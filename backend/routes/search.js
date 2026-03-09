// ====================================
// KERESÉS ÉS SZŰRÉS ROUTES
// ====================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// ====================================
// INGATLANOK KERESÉSE ÉS SZŰRÉSE
// GET /api/search
// ====================================

router.get('/', async (req, res) => {
    try {
        const {
            q,              // Szöveges keresés
            tipus,          // Ingatlan típusa
            tranzakcio,     // Eladó vagy kiadó
            varos,          // Város
            min_ar,         // Minimum ár
            max_ar,         // Maximum ár
            min_alapterulet, // Minimum alapterület
            max_alapterulet, // Maximum alapterület
            min_szobak,     // Minimum szobák száma
            max_szobak,     // Maximum szobák száma
            allapot,        // Állapot
            page = 1,
            limit = 12
        } = req.query;

        // SQL query építése dinamikusan
        let query = `
            SELECT 
                i.*,
                f.nev AS hirdeto_nev,
                f.telefon AS hirdeto_telefon,
                GROUP_CONCAT(k.fajl_utvonal ORDER BY k.sorrend) AS kepek,
                COALESCE(
                    (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = i.id AND fo_kep = TRUE LIMIT 1),
                    (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = i.id ORDER BY sorrend LIMIT 1)
                ) AS fo_kep
            FROM ingatlanok i
            LEFT JOIN felhasznalok f ON i.felhasznalo_id = f.id
            LEFT JOIN kepek k ON i.id = k.ingatlan_id
            WHERE i.statusz = 'aktiv'
        `;

        const queryParams = [];

        // Szűrők hozzáadása
        if (q) {
            query += ` AND (i.cim LIKE ? OR i.leiras LIKE ? OR i.varos LIKE ?)`;
            const searchTerm = `%${q}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        if (tipus) {
            query += ` AND i.tipus = ?`;
            queryParams.push(tipus);
        }

        if (tranzakcio) {
            query += ` AND i.tranzakcio_tipus = ?`;
            queryParams.push(tranzakcio);
        }

        if (varos) {
            query += ` AND i.varos LIKE ?`;
            queryParams.push(`%${varos}%`);
        }

        if (min_ar) {
            query += ` AND i.ar >= ?`;
            queryParams.push(parseFloat(min_ar));
        }

        if (max_ar) {
            query += ` AND i.ar <= ?`;
            queryParams.push(parseFloat(max_ar));
        }

        if (min_alapterulet) {
            query += ` AND i.alapterulet >= ?`;
            queryParams.push(parseFloat(min_alapterulet));
        }

        if (max_alapterulet) {
            query += ` AND i.alapterulet <= ?`;
            queryParams.push(parseFloat(max_alapterulet));
        }

        if (min_szobak) {
            query += ` AND i.szobak_szama >= ?`;
            queryParams.push(parseInt(min_szobak));
        }

        if (max_szobak) {
            query += ` AND i.szobak_szama <= ?`;
            queryParams.push(parseInt(max_szobak));
        }

        if (allapot) {
            query += ` AND i.allapot = ?`;
            queryParams.push(allapot);
        }

        query += ` GROUP BY i.id ORDER BY i.kiemelt DESC, i.frissitve DESC`;

        // Teljes találatok száma
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT i.id) as total FROM');
        const [countResult] = await promisePool.query(countQuery, queryParams);
        const total = countResult[0].total;

        // Lapozás
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), offset);

        // Ingatlanok lekérése
        const [properties] = await promisePool.query(query, queryParams);

        res.json({
            success: true,
            data: properties,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            filters: {
                q, tipus, tranzakcio, varos,
                min_ar, max_ar, min_alapterulet, max_alapterulet,
                min_szobak, max_szobak, allapot
            }
        });

    } catch (error) {
        console.error('Keresés hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt a keresés során'
        });
    }
});

// ====================================
// VÁROS JAVASLATOK (Autocomplete)
// GET /api/search/cities
// ====================================

router.get('/cities', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const [cities] = await promisePool.query(`
            SELECT DISTINCT varos, COUNT(*) as count
            FROM ingatlanok
            WHERE varos LIKE ? AND statusz = 'aktiv'
            GROUP BY varos
            ORDER BY count DESC
            LIMIT 10
        `, [`%${q}%`]);

        res.json({
            success: true,
            data: cities
        });

    } catch (error) {
        console.error('Város javaslatok hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

// ====================================
// SZŰRŐ OPCIÓK LEKÉRÉSE
// GET /api/search/filters
// ====================================

router.get('/filters', async (req, res) => {
    try {
        // Ingatlan típusok statisztikával
        const [tipusok] = await promisePool.query(`
            SELECT tipus, COUNT(*) as count
            FROM ingatlanok
            WHERE statusz = 'aktiv'
            GROUP BY tipus
        `);

        // Városok statisztikával
        const [varosok] = await promisePool.query(`
            SELECT varos, COUNT(*) as count
            FROM ingatlanok
            WHERE statusz = 'aktiv'
            GROUP BY varos
            ORDER BY count DESC
            LIMIT 20
        `);

        // Ár tartományok
        const [arStatisztika] = await promisePool.query(`
            SELECT 
                MIN(ar) as min_ar,
                MAX(ar) as max_ar,
                AVG(ar) as avg_ar
            FROM ingatlanok
            WHERE statusz = 'aktiv'
        `);

        res.json({
            success: true,
            data: {
                tipusok,
                varosok,
                ar: arStatisztika[0]
            }
        });

    } catch (error) {
        console.error('Szűrők lekérése hiba:', error);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba történt'
        });
    }
});

module.exports = router;
