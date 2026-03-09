// ====================================
// FELHASZNÁLÓK ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');

// ADMIN CHECK MIDDLEWARE - FRISS szerepkör az adatbázisból
const checkAdmin = async (req, res, next) => {
    try {
        console.log('=== CHECK ADMIN ===');
        console.log('User ID from token:', req.user.id);
        
        // Fetch user az adatbázisból
        const [rows] = await promisePool.query(
            'SELECT id, nev, email, szerepkor FROM felhasznalok WHERE id = ?',
            [req.user.id]
        );
        
        const user = rows[0];
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                success: false,
                message: 'Felhasználó nem található'
            });
        }

        console.log('User from DB:', user.email);
        console.log('User role from DB:', user.szerepkor);

        if (user.szerepkor !== 'admin') {
            console.log('Not admin - role:', user.szerepkor);
            return res.status(403).json({
                success: false,
                message: 'Nincs jogosultságod'
            });
        }

        console.log('Admin check PASSED!');
        
        // Frissítsük req.user szerepkört
        req.user.szerepkor = user.szerepkor;
        req.user.nev = user.nev;
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Szerver hiba: ' + error.message
        });
    }
};

// ====================================
// PROFILKÉP FELTÖLTÉS KONFIGURÁCIÓ
// ====================================

const uploadDir = './uploads/profiles';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Csak kép fájlok (JPEG, PNG, WEBP) tölthetők fel'));
        }
    }
});

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await promisePool.query(
            'SELECT id, nev, email, telefon, szerepkor, profilkep, regisztracio_datum FROM felhasznalok WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/users/profile - Profil frissítése
router.put('/profile', auth, upload.single('profilkep'), async (req, res) => {
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    try {
        const { nev, email, telefon, jelenlegi_jelszo, uj_jelszo } = req.body;

        // Email egyediség ellenőrzése (ha változott)
        const [existing] = await promisePool.query(
            'SELECT id FROM felhasznalok WHERE email = ? AND id != ?',
            [email, req.user.id]
        );

        if (existing.length > 0) {
            console.log('Email already exists');
            return res.status(400).json({ success: false, message: 'Ez az email cím már használatban van' });
        }

        let updateData = { nev, email, telefon };

        // Jelszó módosítás
        if (uj_jelszo) {
            console.log('Password change requested');
            // Jelenlegi jelszó ellenőrzése
            const [users] = await promisePool.query(
                'SELECT jelszo FROM felhasznalok WHERE id = ?',
                [req.user.id]
            );

            const validPassword = await bcrypt.compare(jelenlegi_jelszo, users[0].jelszo);
            if (!validPassword) {
                console.log('Invalid current password');
                return res.status(400).json({ success: false, message: 'Hibás jelenlegi jelszó' });
            }

            const hashedPassword = await bcrypt.hash(uj_jelszo, 10);
            updateData.jelszo = hashedPassword;
        }

        // Profilkép feltöltés
        if (req.file) {
            console.log('Profile image uploaded:', req.file.path);
            console.log('Original filename:', req.file.filename);
            
            // Régi profilkép törlése
            const [oldUser] = await promisePool.query(
                'SELECT profilkep FROM felhasznalok WHERE id = ?',
                [req.user.id]
            );

            if (oldUser[0].profilkep) {
                // Régi kép törlése (teljes útvonal)
                const oldPath = path.join(__dirname, '..', oldUser[0].profilkep.replace(/^\//, ''));
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log('Old profile image deleted:', oldPath);
                }
            }

            // URL-friendly útvonal mentése: /uploads/profiles/filename.jpg
            const imageUrl = `/uploads/profiles/${req.file.filename}`;
            updateData.profilkep = imageUrl;
            console.log('Saving profile image URL:', imageUrl);
        }

        // Adatok frissítése
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');

        console.log('Update query:', `UPDATE felhasznalok SET ${setClause} WHERE id = ${req.user.id}`);
        console.log('Values:', values);

        await promisePool.query(
            `UPDATE felhasznalok SET ${setClause} WHERE id = ?`,
            [...values, req.user.id]
        );

        console.log('Profile updated successfully');
        res.json({ success: true, message: 'Profil sikeresen frissítve' });
    } catch (error) {
        console.error('Profil frissítési hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba: ' + error.message });
    }
});

// GET /api/users - Összes felhasználó (Admin)
router.get('/', auth, checkAdmin, async (req, res) => {
    try {
        console.log('=== GET USERS ===');

        const [users] = await promisePool.query(`
            SELECT 
                id, nev, email, telefon, szerepkor, 
                profilkep, aktiv, regisztracio_datum,
                (SELECT COUNT(*) FROM ingatlanok WHERE felhasznalo_id = felhasznalok.id) as ingatlanok_szama
            FROM felhasznalok
            ORDER BY regisztracio_datum DESC
        `);

        console.log('Users found:', users.length);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Felhasználók lekérése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/users/:id/role - Szerepkör módosítása (ADMIN ONLY)
// FONTOS: Ez ELŐBB kell hogy legyen mint a PUT /:id route!
router.put('/:id/role', auth, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { szerepkor } = req.body;

        // Validáció
        if (!['user', 'admin'].includes(szerepkor)) {
            return res.status(400).json({ success: false, message: 'Érvénytelen szerepkör' });
        }

        await promisePool.query(
            'UPDATE felhasznalok SET szerepkor = ? WHERE id = ?',
            [szerepkor, id]
        );

        console.log('Role updated:', id, '→', szerepkor);
        res.json({ success: true, message: 'Szerepkör frissítve' });

    } catch (error) {
        console.error('Szerepkör módosítási hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/users/:id/reset-password - Admin jelszó reset
router.put('/:id/reset-password', auth, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Validáció
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie' 
            });
        }

        // Jelszó hashelése
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Jelszó frissítése
        await promisePool.query(
            'UPDATE felhasznalok SET jelszo = ? WHERE id = ?',
            [hashedPassword, id]
        );

        console.log(`Admin ${req.user.id} reset password for user ${id}`);
        res.json({ success: true, message: 'Jelszó sikeresen visszaállítva' });

    } catch (error) {
        console.error('Jelszó reset hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/users/:id - Felhasználó módosítása (Admin)
router.put('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic UPDATE query
        const fields = [];
        const values = [];

        // Only update fields that are provided
        if (updates.nev !== undefined) {
            fields.push('nev = ?');
            values.push(updates.nev);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.telefon !== undefined) {
            fields.push('telefon = ?');
            values.push(updates.telefon);
        }
        if (updates.szerepkor !== undefined) {
            fields.push('szerepkor = ?');
            values.push(updates.szerepkor);
        }
        if (updates.aktiv !== undefined) {
            fields.push('aktiv = ?');
            values.push(updates.aktiv);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Nincs módosítandó mező' });
        }

        values.push(id);
        const query = `UPDATE felhasznalok SET ${fields.join(', ')} WHERE id = ?`;

        await promisePool.query(query, values);

        console.log('User updated:', id);
        res.json({ success: true, message: 'Felhasználó frissítve' });
    } catch (error) {
        console.error('Felhasználó módosítási hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// DELETE /api/users/:id - Felhasználó törlése (Admin)
router.delete('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Ne lehessen saját magát törölni
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Nem törölheted saját magad' });
        }

        await promisePool.query('DELETE FROM felhasznalok WHERE id = ?', [id]);

        console.log('User deleted:', id);
        res.json({ success: true, message: 'Felhasználó törölve' });
    } catch (error) {
        console.error('Felhasználó törlési hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

module.exports = router;