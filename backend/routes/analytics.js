// ====================================
// ANALYTICS ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/analytics - felhasználó statisztikái
router.get('/', auth, async (req, res) => {
    try {
        // összes megtekintés
        const [viewsResult] = await promisePool.query(`
            SELECT SUM(megtekintesek) as total
            FROM ingatlanok
            WHERE felhasznalo_id = ?
        `, [req.user.id]);

        // megtekintések ebben a hónapban (uj nézetek az elmúlt 30 napban)
        const [monthViewsResult] = await promisePool.query(`
            SELECT SUM(megtekintesek) as total
            FROM ingatlanok
            WHERE felhasznalo_id = ? 
            AND frissitve >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [req.user.id]);

        // összes üzenet
        const [messagesResult] = await promisePool.query(`
            SELECT COUNT(*) as total
            FROM uzenetek
            WHERE fogado_id = ?
        `, [req.user.id]);

        // üzenetek ebben a hónapban
        const [monthMessagesResult] = await promisePool.query(`
            SELECT COUNT(*) as total
            FROM uzenetek
            WHERE fogado_id = ? 
            AND kuldes_ideje >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [req.user.id]);

        // kedvencek száma
        const [favoritesResult] = await promisePool.query(`
            SELECT COUNT(DISTINCT k.id) as total
            FROM kedvencek k
            JOIN ingatlanok i ON k.ingatlan_id = i.id
            WHERE i.felhasznalo_id = ?
        `, [req.user.id]);

        // aktív hirdetések
        const [activeResult] = await promisePool.query(`
            SELECT COUNT(*) as total
            FROM ingatlanok
            WHERE felhasznalo_id = ? AND statusz = 'aktiv'
        `, [req.user.id]);

        // legjobban teljesítő hirdetés
        const [topProperty] = await promisePool.query(`
            SELECT id, cim, varos, ar, penznem, megtekintesek,
                   (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = ingatlanok.id AND fo_kep = TRUE LIMIT 1) as fo_kep
            FROM ingatlanok
            WHERE felhasznalo_id = ?
            ORDER BY megtekintesek DESC
            LIMIT 1
        `, [req.user.id]);

        // közelmúlt aktivitás
        const recentActivity = [];
        
        // legutóbbi üzenetek
        const [recentMessages] = await promisePool.query(`
            SELECT u.kuldes_ideje, f.nev as kuldo_nev, i.cim
            FROM uzenetek u
            JOIN felhasznalok f ON u.kuldo_id = f.id
            LEFT JOIN ingatlanok i ON u.ingatlan_id = i.id
            WHERE u.fogado_id = ?
            ORDER BY u.kuldes_ideje DESC
            LIMIT 5
        `, [req.user.id]);

        recentMessages.forEach(msg => {
            const time = formatTime(msg.kuldes_ideje);
            recentActivity.push({
                icon: '💬',
                title: 'uj üzenet',
                description: `${msg.kuldo_nev} üzenetet küldött ${msg.cim ? `a(z) "${msg.cim}" hirdetéseddel kapcsolatban` : 'neked'}`,
                time: time
            });
        });

        // közelmúlt megtekintések (ha van friss nézet)
        const [recentViews] = await promisePool.query(`
            SELECT cim, megtekintesek, frissitve
            FROM ingatlanok
            WHERE felhasznalo_id = ?
            AND frissitve >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY frissitve DESC
            LIMIT 3
        `, [req.user.id]);

        recentViews.forEach(view => {
            const time = formatTime(view.frissitve);
            recentActivity.push({
                icon: '👁️',
                title: 'Új megtekintés',
                description: `A(z) "${view.cim}" hirdetésed ${view.megtekintesek} alkalommal megtekintve`,
                time: time
            });
        });

        // időrend szerinti rendezés
        recentActivity.sort((a, b) => {
            // Egyszerű időrendi sorrend a time alapján
            return 0; // Már időrendben vannak az SQL-ből
        });

        const data = {
            totalViews: viewsResult[0].total || 0,
            viewsThisMonth: monthViewsResult[0].total || 0,
            totalMessages: messagesResult[0].total || 0,
            messagesThisMonth: monthMessagesResult[0].total || 0,
            totalFavorites: favoritesResult[0].total || 0,
            activeProperties: activeResult[0].total || 0,
            topProperty: topProperty[0] || null,
            recentActivity: recentActivity.slice(0, 10)
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Analytics lekérése hiba:', error);
        res.status(500).json({ success: false, message: 'Szerverhiba' });
    }
});

// segédfüggvény az idő formázásához
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Most';
    if (minutes < 60) return `${minutes} perce`;
    if (hours < 24) return `${hours} órája`;
    if (days < 7) return `${days} napja`;
    return date.toLocaleDateString('hu-HU');
}

module.exports = router;
