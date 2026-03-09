// ====================================
// ADATBÁZIS KAPCSOLAT - MySQL Connection Pool
// ====================================

const mysql = require('mysql2');

// connection pool letrehozasa
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ingatlan_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// promise-alapu interface
const promisePool = pool.promise();

// Kapcsolat tesztelése
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Adatbázis kapcsolódási hiba:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Adatbázis kapcsolat megszakadt');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Túl sok adatbázis kapcsolat');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('adatbázis kapcsolat elutasítva. ellenőrizd, hogy fut-e a mysql szerver (XAMPP)!');
        }
        return;
    }
    
    if (connection) {
        console.log('mysql adatbázis sikeresen csatlakoztatva');
        connection.release();
    }
});

// Kapcsolat lezárása  graceful shutdown esetén
process.on('SIGINT', () => {
    pool.end(err => {
        if (err) {
            console.error('hiba az adatbázis kapcsolat lezárásakor:', err);
        } else {
            console.log('Adatbázis kapcsolat bezárva');
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = {
    pool,
    promisePool
};
