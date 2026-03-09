// ====================================
// ÉRTESÍTÉSEK ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/notifications - Értesítések lekérése
router.get('/', auth, async (req, res) => {
    try {
        const [notifications] = await promisePool.query(`
            SELECT * FROM ertesitesek
            WHERE felhasznalo_id = ?
            ORDER BY letrehozva DESC
            LIMIT 50
        `, [req.user.id]);

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Értesítések lekérése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// PUT /api/notifications/:id/read - Értesítés olvasottnak jelölése
router.put('/:id/read', auth, async (req, res) => {
    try {
        const { id } = req.params;

        await promisePool.query(
            'UPDATE ertesitesek SET olvasott = TRUE WHERE id = ? AND felhasznalo_id = ?',
            [id, req.user.id]
        );

        res.json({ success: true, message: 'Értesítés olvasottnak jelölve' });
    } catch (error) {
        console.error('Értesítés olvasott jelölés hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// POST /api/notifications - Új értesítés létrehozása (ADMIN/INTERNAL)
router.post('/', auth, async (req, res) => {
    try {
        const { felhasznalo_id, tipus, uzenet } = req.body;

        // Validation
        if (!felhasznalo_id || !uzenet) {
            return res.status(400).json({ 
                success: false, 
                message: 'felhasznalo_id és uzenet kötelező!' 
            });
        }

        const [result] = await promisePool.query(
            'INSERT INTO ertesitesek (felhasznalo_id, tipus, uzenet) VALUES (?, ?, ?)',
            [felhasznalo_id, tipus || 'info', uzenet]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Értesítés létrehozva',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Értesítés létrehozása hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba', error: error.message });
    }
});

// PUT /api/notifications/read-all - Összes értesítés olvasottnak jelölése
router.put('/read-all', auth, async (req, res) => {
    try {
        await promisePool.query(
            'UPDATE ertesitesek SET olvasott = TRUE WHERE felhasznalo_id = ?',
            [req.user.id]
        );

        res.json({ success: true, message: 'Összes értesítés olvasottnak jelölve' });
    } catch (error) {
        console.error('Értesítések olvasott jelölés hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// DELETE /api/notifications/:id - Értesítés törlése
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        await promisePool.query(
            'DELETE FROM ertesitesek WHERE id = ? AND felhasznalo_id = ?',
            [id, req.user.id]
        );

        res.json({ success: true, message: 'Értesítés törölve' });
    } catch (error) {
        console.error('Értesítés törlése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

module.exports = router;
