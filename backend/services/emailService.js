// ====================================
// EMAIL SERVICE - Nodemailer
// ====================================

const nodemailer = require('nodemailer');

// Email transporter létrehozása
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Vagy más SMTP szolgáltató
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// ====================================
// SABLONOK
// ====================================

// Új üzenet email
const newMessageTemplate = (recipientName, senderName, messagePreview, propertyTitle) => {
    return {
        subject: `Új üzenet érkezett ${senderName} felhasználótól`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2b2b2b; color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .button { display: inline-block; background: #2b2b2b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Ingatlan</h1>
                        <p>Új üzenet érkezett!</p>
                    </div>
                    <div class="content">
                        <p>Szia <strong>${recipientName}</strong>!</p>
                        <p><strong>${senderName}</strong> üzenetet küldött neked${propertyTitle ? ` a <strong>"${propertyTitle}"</strong> hirdetéseddel kapcsolatban` : ''}:</p>
                        
                        <div class="message-box">
                            <p><em>${messagePreview}</em></p>
                        </div>
                        
                        <p>Válaszolj gyorsan, hogy ne veszítsd el az érdeklődőt!</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'https://ingatlan-projekt.com'}/uzenetek" class="button">
                            Válaszolok most
                        </a>
                        
                        <div class="footer">
                            <p>Ez egy automatikus értesítő email az Ingatlan rendszerből.</p>
                            <p>Ha nem szeretnél több értesítést kapni, állítsd be a profilodban.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Hirdetés felfüggesztve email
const propertySuspendedTemplate = (userName, propertyTitle, reason) => {
    return {
        subject: `A "${propertyTitle}" hirdetésed felfüggesztve lett`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
                    .reason-box { background: white; padding: 20px; border: 2px solid #e74c3c; margin: 20px 0; }
                    .button { display: inline-block; background: #2b2b2b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Hirdetés Felfüggesztve</h1>
                    </div>
                    <div class="content">
                        <p>Szia <strong>${userName}</strong>!</p>
                        
                        <div class="warning-box">
                            <p><strong>A "${propertyTitle}" című hirdetésed felfüggesztésre került.</strong></p>
                        </div>
                        
                        <p><strong>Felfüggesztés indoka:</strong></p>
                        <div class="reason-box">
                            <p>${reason}</p>
                        </div>
                        
                        <p>Mit tehetsz?</p>
                        <ul>
                            <li>Ellenőrizd a hirdetés tartalmát</li>
                            <li>Javítsd ki a problémát</li>
                            <li>Vedd fel velünk a kapcsolatot, ha kérdésed van</li>
                        </ul>
                        
                        <a href="${process.env.FRONTEND_URL || 'https://ingatlan-projekt.com'}/profil" class="button">
                            Hirdetéseim megtekintése
                        </a>
                        
                        <div class="footer">
                            <p>Kérdés esetén írj nekünk: support@ingatlanportal.hu</p>
                            <p>© 2026 Ingatlan - Minden jog fenntartva</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Új érdeklődő email (hirdetőnek)
const newInquiryTemplate = (ownerName, inquirerName, propertyTitle, messagePreview) => {
    return {
        subject: `Érdeklődnek a "${propertyTitle}" hirdetésed iránt!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
                    .message-box { background: white; padding: 20px; margin: 20px 0; }
                    .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Jó hír!</h1>
                        <p>Új érdeklődő van!</p>
                    </div>
                    <div class="content">
                        <p>Szia <strong>${ownerName}</strong>!</p>
                        
                        <div class="success-box">
                            <p><strong>${inquirerName}</strong> érdeklődik a <strong>"${propertyTitle}"</strong> hirdetésed iránt!</p>
                        </div>
                        
                        <p><strong>Üzenet:</strong></p>
                        <div class="message-box">
                            <p><em>${messagePreview}</em></p>
                        </div>
                        
                        <p><strong>Tipp:</strong> Minél gyorsabban válaszolsz, annál nagyobb az esélyemutató, hogy üzletet kötsz!</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'https://ingatlan-projekt.com'}/uzenetek" class="button">
                            Válaszolok most
                        </a>
                        
                        <div class="footer">
                            <p>Sok sikert az ingatlan értékesítéséhez/kiadásához!</p>
                            <p>© 2026 Ingatlan</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Üdvözlő email regisztrációkor
const welcomeEmailTemplate = (userName) => {
    return {
        subject: 'Üdvözlünk az Ingatlanon!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2b2b2b; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .button { display: inline-block; background: #2b2b2b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Üdvözlünk!</h1>
                        <p>Örülünk, hogy csatlakoztál!</p>
                    </div>
                    <div class="content">
                        <p>Szia <strong>${userName}</strong>!</p>
                        <p>Sikeres regisztráció! Most már használhatod az Ingatlan összes funkcióját:</p>
                        
                        <div class="feature">
                            <strong>Hirdetés feladás</strong> - Adj fel korlátlan hirdetést
                        </div>
                        <div class="feature">
                            <strong>Kedvencek</strong> - Mentsd el a tetszőingatlanokat
                        </div>
                        <div class="feature">
                            <strong>Üzenetek</strong> - Kommunikálj közvetlenül az érdeklődőkkel
                        </div>
                        <div class="feature">
                            <strong>Statisztikák</strong> - Kövesd nyomon a hirdetéseid teljesítményét
                        </div>
                        
                        <p>Kezdd el most!</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'https://ingatlan-projekt.com'}/hirdetes-feladas" class="button">
                            Első hirdetésem feladása
                        </a>
                        
                        <div class="footer">
                            <p>Bármilyen kérdés esetén vagyunk itt: ingatlanprojekt.info@gmail.com</p>
                            <p>© 2026 Ingatlan - Minden jog fenntartva</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// ====================================
// EMAIL KÜLDŐ FÜGGVÉNYEK
// ====================================

// Új üzenet értesítés
const sendNewMessageEmail = async (recipientEmail, recipientName, senderName, messagePreview, propertyTitle = null) => {
    try {
        const transporter = createTransporter();
        const template = newMessageTemplate(recipientName, senderName, messagePreview, propertyTitle);
        
        await transporter.sendMail({
            from: `"Ingatlan" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Üzenet email elküldve: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email küldési hiba:', error);
        return { success: false, error: error.message };
    }
};

// Hirdetés felfüggesztve értesítés
const sendPropertySuspendedEmail = async (recipientEmail, userName, propertyTitle, reason) => {
    try {
        const transporter = createTransporter();
        const template = propertySuspendedTemplate(userName, propertyTitle, reason);
        
        await transporter.sendMail({
            from: `"Ingatlan Admin" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Felfüggesztés email elküldve: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email küldési hiba:', error);
        return { success: false, error: error.message };
    }
};

// Új érdeklődő értesítés
const sendNewInquiryEmail = async (ownerEmail, ownerName, inquirerName, propertyTitle, messagePreview) => {
    try {
        const transporter = createTransporter();
        const template = newInquiryTemplate(ownerName, inquirerName, propertyTitle, messagePreview);
        
        await transporter.sendMail({
            from: `"Ingatlan" <${process.env.EMAIL_USER}>`,
            to: ownerEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Érdeklődő email elküldve: ${ownerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email küldési hiba:', error);
        return { success: false, error: error.message };
    }
};

// Üdvözlő email
const sendWelcomeEmail = async (recipientEmail, userName) => {
    try {
        const transporter = createTransporter();
        const template = welcomeEmailTemplate(userName);
        
        await transporter.sendMail({
            from: `"Ingatlan" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Üdvözlő email elküldve: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email küldési hiba:', error);
        return { success: false, error: error.message };
    }
};

// ====================================
// RESET PASSWORD EMAIL
// ====================================

const sendResetPasswordEmail = async (recipientEmail, recipientName, resetLink) => {
    try {
        const transporter = createTransporter(); // JAVÍTVA - transporter létrehozva
        const template = {
            subject: 'Jelszó Visszaállítás - Ingatlan',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #2b2b2b, #2b2b2b); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; padding: 12px 30px; background: #2b2b2b; color: #ffffff; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background: #2b2b2b; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.875rem; }
                        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Jelszó Visszaállítás</h1>
                        </div>
                        <div class="content">
                            <p>Kedves ${recipientName}!</p>
                            
                            <p>Jelszó visszaállítási kérelmet kaptunk a fiókodhoz.</p>
                            
                            <p>Kattints az alábbi gombra az új jelszó beállításához:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetLink}" style="display:inline-block;padding:12px 30px;background:#2b2b2b !important;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:bold;">Jelszó Visszaállítása</a>
                            </div>
                            
                            <p>Vagy másold be ezt a linket a böngészőbe:</p>
                            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 0.875rem;">
                                ${resetLink}
                            </p>
                            
                            <div class="warning">
                                <p style="margin: 0;"><strong>Figyelem:</strong></p>
                                <p style="margin: 5px 0 0 0;">
                                    • Ez a link <strong>1 órán belül</strong> lejár<br>
                                    • Ha nem te kérted ezt, hagyd figyelmen kívül ezt az emailt<br>
                                    • A link csak egyszer használható
                                </p>
                            </div>
                            
                            <p style="margin-top: 20px;">Üdvözlettel,<br><strong>Ingatlan Csapata</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Ingatlan. Minden jog fenntartva.</p>
                            <p>Ha nem te kérted ezt az emailt, kérjük, hagyj figyelmen kívül!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail({
            from: `"Ingatlan" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Jelszó reset email elküldve: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email küldési hiba:', error);
        return { success: false, error: error.message };
    }
};

// ====================================
// EMAIL VERIFICATION
// ====================================

const sendVerificationEmail = async (recipientEmail, recipientName, verificationLink) => {
    try {
        const transporter = createTransporter();
        
        await transporter.sendMail({
            from: `"Ingatlan" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: 'Email cím megerősítése - Ingatlan',
            html: `
                <h1>Üdvözlünk ${recipientName}!</h1>
                <p>Kattints az alábbi linkre az email cím megerősítéséhez:</p>
                <a href="${verificationLink}" style="display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:8px;">Email Megerősítése</a>
                <p>Ha nem te regisztráltál, hagyd figyelmen kívül ezt az emailt.</p>
            `
        });
        
        console.log(`Verification email sent to: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Verification email error:', error);
        return { success: false };
    }
};




// JAVÍTVA - module.exports UTOLJÁRA, MINDEN függvény UTÁN
module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail,
    sendNewMessageEmail,
    sendPropertySuspendedEmail,
    sendNewInquiryEmail,
    sendWelcomeEmail
};
