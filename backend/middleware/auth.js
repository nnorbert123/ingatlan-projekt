const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

module.exports = async function(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Nincs token megadva. Kérjük jelentkezz be!'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Mindig friss adatot kérünk az adatbázisból
        const [users] = await promisePool.query(
            'SELECT id, email, szerepkor, aktiv FROM felhasznalok WHERE id = ?',
            [decoded.id]
        );
        
        if (users.length === 0 || !users[0].aktiv) {
            return res.status(401).json({
                success: false,
                message: 'Felhasználó nem található vagy inaktív'
            });
        }
        
        req.user = {
            id: users[0].id,
            email: users[0].email,
            szerepkor: users[0].szerepkor
        };
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Érvénytelen token'
        });
    }
};
