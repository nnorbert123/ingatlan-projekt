// ====================================
// INGATLAN WEBOLDAL - Node.js Backend
// Express REST API Server
// ====================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// ====================================
// MIDDLEWARE
// ====================================

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'ingatlan-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Biztonság - Allow images from uploads
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

/* CORS engedélyezés
//app.use(cors({
//    origin: ['https://ingatlan-projekt.com', 'https://www.ingatlan-projekt.com'],
//    credentials: true,
 }));
*/

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tömörítés
app.use(compression());

// Logging (development módban)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Statikus fájlok (feltöltött képek)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'properties')));

// ====================================
// ÚTVONALAK (Routes)
// ====================================

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const viewAnalyticsRoutes = require('./routes/viewAnalytics');

const API_PREFIX = process.env.API_PREFIX || '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/properties`, propertyRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/favorites`, favoriteRoutes);
app.use(`${API_PREFIX}/messages`, messageRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/view-analytics`, viewAnalyticsRoutes);

// ====================================
// ALAPÉRTELMEZETT ROUTE
// ====================================

app.get('/', (req, res) => {
    res.json({
        message: 'Ingatlan Weboldal API',
        version: '1.0.0',
        uploadsDir: path.join(__dirname, 'uploads'),
        profilesDir: path.join(__dirname, 'uploads', 'profiles'),
        endpoints: {
            auth: `${API_PREFIX}/auth`,
            properties: `${API_PREFIX}/properties`,
            users: `${API_PREFIX}/users`,
            favorites: `${API_PREFIX}/favorites`,
            messages: `${API_PREFIX}/messages`,
            search: `${API_PREFIX}/search`,
            uploads: '/uploads'
        }
    });
});

// ====================================
// HIBAKEZELES
// ====================================

// 404 - Nem talált oldal
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Az endpoint nem található'
    });
});

// Általános hibakezelo
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Szerverhiba történt',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ====================================
// SZERVER INDÍTÁSA
// ====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   Ingatlan API szerver elindult       ║
    ║   Port: ${PORT}                         ║
    ║   Környezet: ${process.env.NODE_ENV}             ║
    ║   API: http://localhost:${PORT}${API_PREFIX}      ║
    ╚═══════════════════════════════════════╝
    `);
});

module.exports = app;
