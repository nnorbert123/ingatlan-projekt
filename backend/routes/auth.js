// ====================================
// AUTENTIKÁCIÓ ROUTES - regisztráció, bejelentkezés
// ====================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { promisePool } = require('../config/database');
const { sendWelcomeEmail, sendVerificationEmail } = require('../services/emailService');

// ====================================
// REGISZTRÁCIÓ - EMAIL VERIFICATION-NEL
// POST /api/auth/register
// ====================================

router.post('/register', [
    body('nev').trim().notEmpty().withMessage('A név megadása kötelező'),
    body('email').isEmail().withMessage('Érvényes email cím megadása kötelező'),
    body('jelszo').isLength({ min: 6 }).withMessage('A jelszó legalább 6 karakter hosszú legyen'),
    body('telefon').optional().isMobilePhone('hu-HU').withMessage('Érvényes telefonszám megadása szükséges')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nev, email, jelszo, telefon } = req.body;

        // Email cím egyediségének ellenőrzése
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM felhasznalok WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ez az email cím már regisztrálva van'
            });
        }

        // jelszó hashelése
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(jelszo, salt);

        // email verification token generálása
        const emailToken = crypto.randomBytes(32).toString('hex');

        // felhasználó létrehozása - EMAIL_MEGEROSITETT = FALSE
        const [result] = await promisePool.query(
            'INSERT INTO felhasznalok (nev, email, jelszo, telefon, email_megerositett, email_token) VALUES (?, ?, ?, ?, FALSE, ?)',
            [nev, email, hashedPassword, telefon || null, emailToken]
        );

        // JWT token generálása
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // email verification link
        const verificationLink = `${process.env.FRONTEND_URL}/email-megerosites?token=${emailToken}`;

        // megerősitő email küldése
        sendVerificationEmail(email, nev, verificationLink).catch(err => {
            console.error('Verification email küldési hiba:', err);
        });

        console.log(`Verification email sent to: ${email}`);
        console.log(`Verification link: ${verificationLink}`);

        res.status(201).json({
            success: true,
            message: 'Sikeres regisztráció! Kérjük erősítsd meg az email címed.',
            token,
            user: {
                id: result.insertId,
                nev,
                email,
                szerepkor: 'felhasznalo',
                email_megerositett: false
            }
        });

    } catch (error) {
        console.error('Regisztráció hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt a regisztráció során'
        });
    }
});

// ====================================
// EMAIL VERIFICATION - Megerősítés
// POST /api/auth/verify-email
// ====================================

router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token megadása kötelező'
            });
        }

        // token keresése
        const [users] = await promisePool.query(
            'SELECT * FROM felhasznalok WHERE email_token = ?',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen vagy lejárt token'
            });
        }

        const user = users[0];

        // email megerősítve
        await promisePool.query(
            'UPDATE felhasznalok SET email_megerositett = TRUE, email_token = NULL WHERE id = ?',
            [user.id]
        );

        console.log(`Email verified for user: ${user.email}`);

        // üdvözlő email küldése MOST
        sendWelcomeEmail(user.email, user.nev).catch(err => {
            console.error('Üdvözlő email hiba:', err);
        });

        res.json({
            success: true,
            message: 'Email cím sikeresen megerősítve!'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// BEJELENTKEZÉS
// POST /api/auth/login
// ====================================

router.post('/login', [
    body('email').isEmail().withMessage('Érvényes email cím megadása kötelező'),
    body('jelszo').notEmpty().withMessage('A jelszó megadása kötelező')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, jelszo } = req.body;

        // felhasználó keresése
        const [users] = await promisePool.query(
            'SELECT * FROM felhasznalok WHERE email = ? AND aktiv = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Hibás email cím vagy jelszó'
            });
        }

        const user = users[0];

        // jelszó ellenőrzése
        const isMatch = await bcrypt.compare(jelszo, user.jelszo);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Hibás email cím vagy jelszó'
            });
        }

        // utolsó belépés frissítése
        await promisePool.query(
            'UPDATE felhasznalok SET utolso_belepes = NOW() WHERE id = ?',
            [user.id]
        );

        // JWT token generálása
        const token = jwt.sign(
            { id: user.id, email: user.email, szerepkor: user.szerepkor },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Sikeres bejelentkezés',
            token,
            user: {
                id: user.id,
                nev: user.nev,
                email: user.email,
                szerepkor: user.szerepkor,
                profilkep: user.profilkep,
                email_megerositett: user.email_megerositett
            }
        });

    } catch (error) {
        console.error('Bejelentkezés hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt a bejelentkezés során'
        });
    }
});

// ====================================
// JELENLEGI FELHASZNÁLÓ LEKÉRÉSE
// GET /api/auth/me
// ====================================

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Nincs token megadva'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await promisePool.query(
            'SELECT id, nev, email, telefon, szerepkor, profilkep, regisztracio_datum, email_megerositett FROM felhasznalok WHERE id = ? AND aktiv = TRUE',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Token ellenőrzési hiba:', error);
        res.status(401).json({
            success: false,
            message: 'Érvénytelen token'
        });
    }
});

// ====================================
// FORGOT PASSWORD - Email küldés reset linkkel
// POST /api/auth/forgot-password
// ====================================

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email cím megadása kötelező'
            });
        }

        // Felhasználó keresése
        const [users] = await promisePool.query(
            'SELECT id, nev, email FROM felhasznalok WHERE email = ? AND aktiv = TRUE',
            [email]
        );

        // Biztonsági okokból mindig "sikeres" választ adunk
        if (users.length === 0) {
            return res.json({
                success: true,
                message: 'Ha az email cím létezik, küldtünk egy jelszó visszaállító linket'
            });
        }

        const user = users[0];

        // Random token generálás
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Token lejárati idő: 1 óra
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Token mentése
        await promisePool.query(
            'INSERT INTO password_reset_tokens (felhasznalo_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, resetToken, expiresAt]
        );

        // Reset link
        const resetLink = `${process.env.FRONTEND_URL}/jelszo-visszaallitas?token=${resetToken}`;

        // Email küldés
        const { sendResetPasswordEmail } = require('../services/emailService');
        await sendResetPasswordEmail(user.email, user.nev, resetLink);

        console.log(`Password reset email sent to: ${user.email}`);

        res.json({
            success: true,
            message: 'Jelszó visszaállító link elküldve az email címedre'
        });

    } catch (error) {
        console.error('Forgot password hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// RESET PASSWORD - Új jelszó beállítása
// POST /api/auth/reset-password
// ====================================

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token és új jelszó megadása kötelező'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
            });
        }

        // Token ellenőrzése
        const [tokens] = await promisePool.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen vagy lejárt token'
            });
        }

        const resetToken = tokens[0];

        // Jelszó hashelése
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Jelszó frissítése
        await promisePool.query(
            'UPDATE felhasznalok SET jelszo = ? WHERE id = ?',
            [hashedPassword, resetToken.felhasznalo_id]
        );

        // Token felhasználva jelölése
        await promisePool.query(
            'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
            [resetToken.id]
        );

        console.log(`Password reset successful for user ID: ${resetToken.felhasznalo_id}`);

        res.json({
            success: true,
            message: 'Jelszó sikeresen megváltoztatva'
        });

    } catch (error) {
        console.error('Reset password hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

module.exports = router;