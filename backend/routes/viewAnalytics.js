// ====================================
// VIEW ANALYTICS ROUTES
// Részletes megtekintési statisztikák
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/view-analytics/:propertyId - Egy ingatlan részletes statisztikái
router.get('/:propertyId', auth, async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Ellenőrizzük hogy a felhasználó tulajdonosa-e az ingatlannak
        const [property] = await promisePool.query(
            'SELECT felhasznalo_id FROM ingatlanok WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ success: false, message: 'Ingatlan nem található' });
        }

        if (property[0].felhasznalo_id !== req.user.id && req.user.szerepkor !== 'admin') {
            return res.status(403).json({ success: false, message: 'Nincs jogosultságod' });
        }

        // Összes megtekintés
        const [totalViews] = await promisePool.query(
            'SELECT COUNT(*) as total FROM ingatlan_megtekintesek WHERE ingatlan_id = ?',
            [propertyId]
        );

        // Egyedi látogatók (IP alapján)
        const [uniqueVisitors] = await promisePool.query(
            'SELECT COUNT(DISTINCT ip_cim) as total FROM ingatlan_megtekintesek WHERE ingatlan_id = ?',
            [propertyId]
        );

        // Napi megtekintések (utolsó 30 nap)
        const [dailyViews] = await promisePool.query(`
            SELECT 
                DATE(megtekintve_datum) as datum,
                COUNT(*) as megtekintesek,
                COUNT(DISTINCT ip_cim) as egyedi_latogatok
            FROM ingatlan_megtekintesek
            WHERE ingatlan_id = ?
            AND megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(megtekintve_datum)
            ORDER BY datum DESC
        `, [propertyId]);

        // Heti statisztika
        const [weeklyStats] = await promisePool.query(`
            SELECT 
                COUNT(*) as heti_megtekintesek,
                COUNT(DISTINCT ip_cim) as heti_egyedi
            FROM ingatlan_megtekintesek
            WHERE ingatlan_id = ?
            AND megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `, [propertyId]);

        // Havi statisztika
        const [monthlyStats] = await promisePool.query(`
            SELECT 
                COUNT(*) as havi_megtekintesek,
                COUNT(DISTINCT ip_cim) as havi_egyedi
            FROM ingatlan_megtekintesek
            WHERE ingatlan_id = ?
            AND megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [propertyId]);

        // Top 10 város (IP geolocation volna ideális, de IP alapján ez placeholder)
        const [topCities] = await promisePool.query(`
            SELECT 
                SUBSTRING_INDEX(ip_cim, '.', 2) as ip_prefix,
                COUNT(*) as megtekintesek
            FROM ingatlan_megtekintesek
            WHERE ingatlan_id = ?
            GROUP BY ip_prefix
            ORDER BY megtekintesek DESC
            LIMIT 10
        `, [propertyId]);

        // Legutóbbi megtekintések
        const [recentViews] = await promisePool.query(`
            SELECT 
                im.megtekintve_datum,
                im.ip_cim,
                f.nev as felhasznalo_nev
            FROM ingatlan_megtekintesek im
            LEFT JOIN felhasznalok f ON im.felhasznalo_id = f.id
            WHERE im.ingatlan_id = ?
            ORDER BY im.megtekintve_datum DESC
            LIMIT 20
        `, [propertyId]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalViews: totalViews[0].total,
                    uniqueVisitors: uniqueVisitors[0].total,
                    weeklyViews: weeklyStats[0].heti_megtekintesek,
                    monthlyViews: monthlyStats[0].havi_megtekintesek
                },
                dailyViews: dailyViews,
                topCities: topCities,
                recentViews: recentViews
            }
        });

    } catch (error) {
        console.error('View analytics hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// GET /api/view-analytics - Összes ingatlan összesített statisztikái (admin/owner)
router.get('/', auth, async (req, res) => {
    try {
        let whereClause = '';
        const params = [];

        // Ha nem admin, csak saját hirdetéseit látja
        if (req.user.szerepkor !== 'admin') {
            whereClause = 'WHERE i.felhasznalo_id = ?';
            params.push(req.user.id);
        }

        const [stats] = await promisePool.query(`
            SELECT 
                i.id,
                i.cim,
                i.varos,
                COUNT(DISTINCT im.id) as osszes_megtekintes,
                COUNT(DISTINCT im.ip_cim) as egyedi_latogatok,
                COUNT(DISTINCT CASE WHEN im.megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN im.id END) as heti_megtekintes,
                COUNT(DISTINCT CASE WHEN im.megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN im.id END) as havi_megtekintes
            FROM ingatlanok i
            LEFT JOIN ingatlan_megtekintesek im ON i.id = im.ingatlan_id
            ${whereClause}
            GROUP BY i.id, i.cim, i.varos
            ORDER BY osszes_megtekintes DESC
        `, params);

        res.json({ success: true, data: stats });

    } catch (error) {
        console.error('View analytics összesítés hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

module.exports = router;
