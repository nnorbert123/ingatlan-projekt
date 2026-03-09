// ====================================
// KEDVENCEK ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');

// ====================================
// KEDVENCEK LEKÉRÉSE
// GET /api/favorites
// ====================================

router.get('/', auth, async (req, res) => {
    try {
        const [favorites] = await promisePool.query(`
            SELECT 
                i.*,
                k.hozzaadva as kedvenc_hozzaadva,
                f.nev AS hirdeto_nev,
                GROUP_CONCAT(kp.fajl_utvonal ORDER BY kp.sorrend) AS kepek,
                COALESCE(
                    (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = i.id AND fo_kep = TRUE LIMIT 1),
                    (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = i.id ORDER BY sorrend LIMIT 1)
                ) AS fo_kep
            FROM kedvencek k
            JOIN ingatlanok i ON k.ingatlan_id = i.id
            LEFT JOIN felhasznalok f ON i.felhasznalo_id = f.id
            LEFT JOIN kepek kp ON i.id = kp.ingatlan_id
            WHERE k.felhasznalo_id = ? AND i.statusz = 'aktiv'
            GROUP BY i.id
            ORDER BY k.hozzaadva DESC
        `, [req.user.id]);

        res.json({
            success: true,
            data: favorites
        });

    } catch (error) {
        console.error('Kedvencek lekérése hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// INGATLAN HOZZÁADÁSA A KEDVENCEKHEZ
// POST /api/favorites/:propertyId
// ====================================

router.post('/:propertyId', auth, async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Ellenőrzés: létezik-e az ingatlan
        const [properties] = await promisePool.query(
            'SELECT id FROM ingatlanok WHERE id = ? AND statusz = "aktiv"',
            [propertyId]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Az ingatlan nem található'
            });
        }

        // Ellenőrzés: már kedvenc-e
        const [existing] = await promisePool.query(
            'SELECT id FROM kedvencek WHERE felhasznalo_id = ? AND ingatlan_id = ?',
            [req.user.id, propertyId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Az ingatlan már a kedvencek között van'
            });
        }

        // Hozzáadás a kedvencekhez
        await promisePool.query(
            'INSERT INTO kedvencek (felhasznalo_id, ingatlan_id) VALUES (?, ?)',
            [req.user.id, propertyId]
        );

        res.status(201).json({
            success: true,
            message: 'Az ingatlan hozzáadva a kedvencekhez'
        });

    } catch (error) {
        console.error('Kedvencekhez adás hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// INGATLAN ELTÁVOLÍTÁSA A KEDVENCEKBŐL
// DELETE /api/favorites/:propertyId
// ====================================

router.delete('/:propertyId', auth, async (req, res) => {
    try {
        const { propertyId } = req.params;

        const [result] = await promisePool.query(
            'DELETE FROM kedvencek WHERE felhasznalo_id = ? AND ingatlan_id = ?',
            [req.user.id, propertyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Az ingatlan nincs a kedvencek között'
            });
        }

        res.json({
            success: true,
            message: 'Az ingatlan eltávolítva a kedvencekből'
        });

    } catch (error) {
        console.error('Kedvencekből törlés hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// ELLENŐRZÉS: KEDVENC-E AZ INGATLAN
// GET /api/favorites/check/:propertyId
// ====================================

router.get('/check/:propertyId', auth, async (req, res) => {
    try {
        const { propertyId } = req.params;

        const [favorites] = await promisePool.query(
            'SELECT id FROM kedvencek WHERE felhasznalo_id = ? AND ingatlan_id = ?',
            [req.user.id, propertyId]
        );

        res.json({
            success: true,
            isFavorite: favorites.length > 0
        });

    } catch (error) {
        console.error('Kedvenc ellenőrzés hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

module.exports = router;
