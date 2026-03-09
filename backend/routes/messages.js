// ====================================
// ÜZENETEK ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');
const { sendNewMessageEmail, sendNewInquiryEmail } = require('../services/emailService');

// GET /api/messages - Üzenetek lekérése
router.get('/', auth, async (req, res) => {
    try {
        const [messages] = await promisePool.query(`
            SELECT m.*, 
                   k.nev as kuldo_nev,
                   k.profilkep as kuldo_profilkep,
                   f.nev as fogado_nev,
                   f.profilkep as fogado_profilkep,
                   i.cim as ingatlan_cim,
                   m.kuldes_ideje as kuldve
            FROM uzenetek m
            LEFT JOIN felhasznalok k ON m.kuldo_id = k.id
            LEFT JOIN felhasznalok f ON m.fogado_id = f.id
            LEFT JOIN ingatlanok i ON m.ingatlan_id = i.id
            WHERE (m.kuldo_id = ? AND m.torolt_kuldo = FALSE)
               OR (m.fogado_id = ? AND m.torolt_fogado = FALSE)
            ORDER BY m.kuldes_ideje DESC
        `, [req.user.id, req.user.id]);

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Üzenetek lekérése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// GET /api/messages/conversation/:userId - Beszélgetés egy felhasználóval
router.get('/conversation/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const otherUserId = parseInt(userId);

        const [otherUser] = await promisePool.query(
            'SELECT id, nev, email, profilkep FROM felhasznalok WHERE id = ?',
            [otherUserId]
        );

        if (otherUser.length === 0) {
            return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
        }

        // Csak azokat az üzeneteket mutatjuk, amiket az adott fél nem törölt
        const [messages] = await promisePool.query(`
            SELECT m.*, 
                   k.nev as kuldo_nev,
                   f.nev as fogado_nev,
                   i.cim as ingatlan_cim,
                   m.kuldes_ideje as kuldve
            FROM uzenetek m
            LEFT JOIN felhasznalok k ON m.kuldo_id = k.id
            LEFT JOIN felhasznalok f ON m.fogado_id = f.id
            LEFT JOIN ingatlanok i ON m.ingatlan_id = i.id
            WHERE (
                (m.kuldo_id = ? AND m.fogado_id = ? AND m.torolt_kuldo = FALSE)
                OR
                (m.kuldo_id = ? AND m.fogado_id = ? AND m.torolt_fogado = FALSE)
            )
            ORDER BY m.kuldes_ideje ASC
        `, [req.user.id, otherUserId, otherUserId, req.user.id]);

        res.json({ 
            success: true, 
            data: {
                messages,
                otherUser: otherUser[0]
            }
        });
    } catch (error) {
        console.error('Beszélgetés lekérése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// POST /api/messages - Üzenet küldése
router.post('/', auth, async (req, res) => {
    try {
        const { fogado_id, ingatlan_id, targy, uzenet } = req.body;

        if (parseInt(fogado_id) === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nem küldhetsz üzenetet saját magadnak' 
            });
        }

        const [result] = await promisePool.query(
            'INSERT INTO uzenetek (kuldo_id, fogado_id, ingatlan_id, targy, uzenet) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, fogado_id, ingatlan_id || null, targy || '', uzenet]
        );

        // Email értesítés küldése (async)
        (async () => {
            try {
                const [recipient] = await promisePool.query(
                    'SELECT nev, email FROM felhasznalok WHERE id = ?',
                    [fogado_id]
                );

                const senderName = req.user.nev;
                let propertyTitle = null;

                if (ingatlan_id) {
                    const [property] = await promisePool.query(
                        'SELECT cim, felhasznalo_id FROM ingatlanok WHERE id = ?',
                        [ingatlan_id]
                    );
                    
                    if (property.length > 0) {
                        propertyTitle = property[0].cim;
                        
                        const [prevMessages] = await promisePool.query(
                            'SELECT COUNT(*) as count FROM uzenetek WHERE ingatlan_id = ? AND kuldo_id = ?',
                            [ingatlan_id, req.user.id]
                        );
                        
                        if (prevMessages[0].count === 1 && property[0].felhasznalo_id === parseInt(fogado_id)) {
                            await sendNewInquiryEmail(
                                recipient[0].email,
                                recipient[0].nev,
                                senderName,
                                propertyTitle,
                                uzenet
                            );
                            return;
                        }
                    }
                }

                await sendNewMessageEmail(
                    recipient[0].email,
                    recipient[0].nev,
                    senderName,
                    uzenet,
                    propertyTitle
                );
            } catch (emailError) {
                console.error('Email küldési hiba:', emailError);
            }
        })();

        res.status(201).json({ success: true, message: 'Üzenet elküldve', id: result.insertId });
    } catch (error) {
        console.error('Üzenet küldése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/messages/:id/read - Üzenet olvasottnak jelölése
router.put('/:id/read', auth, async (req, res) => {
    try {
        const { id } = req.params;

        await promisePool.query(
            'UPDATE uzenetek SET olvasott = TRUE WHERE id = ? AND fogado_id = ?',
            [id, req.user.id]
        );

        res.json({ success: true, message: 'Üzenet olvasottnak jelölve' });
    } catch (error) {
        console.error('Üzenet olvasott jelölés hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/messages/read-multiple - Több üzenet olvasottnak jelölése
router.put('/read-multiple', auth, async (req, res) => {
    try {
        const { messageIds } = req.body;

        if (!messageIds || messageIds.length === 0) {
            return res.json({ success: true, message: 'Nincs mit olvasottnak jelölni' });
        }

        const placeholders = messageIds.map(() => '?').join(',');
        await promisePool.query(
            `UPDATE uzenetek SET olvasott = TRUE WHERE id IN (${placeholders}) AND fogado_id = ?`,
            [...messageIds, req.user.id]
        );

        res.json({ success: true, message: 'Üzenetek olvasottnak jelölve' });
    } catch (error) {
        console.error('Üzenetek olvasott jelölés hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// DELETE /api/messages/conversation/:userId - Egész beszélgetés törlése (csak saját nézetbõl)
// FONTOS: Ez a route a /:id ELÕTT van!
router.delete('/conversation/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const otherUserId = parseInt(userId);

        // Ha én vagyok a küldõ › torolt_kuldo = TRUE
        await promisePool.query(
            `UPDATE uzenetek SET torolt_kuldo = TRUE 
             WHERE kuldo_id = ? AND fogado_id = ?`,
            [req.user.id, otherUserId]
        );

        // Ha én vagyok a fogadó › torolt_fogado = TRUE
        await promisePool.query(
            `UPDATE uzenetek SET torolt_fogado = TRUE 
             WHERE fogado_id = ? AND kuldo_id = ?`,
            [req.user.id, otherUserId]
        );

        // Ha mindkét fél törölte már, fizikailag is töröljük
        await promisePool.query(
            `DELETE FROM uzenetek 
             WHERE torolt_kuldo = TRUE AND torolt_fogado = TRUE`
        );

        res.json({ success: true, message: 'Beszélgetés törölve' });
    } catch (error) {
        console.error('Beszélgetés törlése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// DELETE /api/messages/:id - Egy üzenet törlése (csak saját nézetbõl)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        await promisePool.query(
            'UPDATE uzenetek SET torolt_kuldo = TRUE WHERE id = ? AND kuldo_id = ?',
            [id, req.user.id]
        );

        await promisePool.query(
            'UPDATE uzenetek SET torolt_fogado = TRUE WHERE id = ? AND fogado_id = ?',
            [id, req.user.id]
        );

        // Ha mindkettõ törölte, fizikailag töröljük
        await promisePool.query(
            'DELETE FROM uzenetek WHERE id = ? AND torolt_kuldo = TRUE AND torolt_fogado = TRUE',
            [id]
        );

        res.json({ success: true, message: 'Üzenet törölve' });
    } catch (error) {
        console.error('Üzenet törlése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

module.exports = router;