// ====================================
// EMAIL SERVICE - Nodemailer
// ====================================

const nodemailer = require('nodemailer');

// Email transporter létrehozása
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// [... SABLONOK ÉS FÜGGVÉNYEK UGYANAZOK ...]
// (A teljes fájl túl hosszú, csak a VÁLTOZTATÁSOKAT mutatom)

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
// EMAIL VERIFICATION - Regisztráció megerősítés
// ====================================

const sendVerificationEmail = async (recipientEmail, recipientName, verificationLink) => {
    try {
        const transporter = createTransporter();
        const template = {
            subject: 'Email cím megerősítése - Ingatlan',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background: #764ba2; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.875rem; }
                        .warning { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Email Megerősítés</h1>
                        </div>
                        <div class="content">
                            <p>Kedves ${recipientName}!</p>
                            
                            <p>Köszönjük, hogy regisztráltál az Ingatlanon!</p>
                            
                            <p>Az email címed megerősítéséhez kattints az alábbi gombra:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationLink}" class="button">Email Megerősítése</a>
                            </div>
                            
                            <p>Vagy másold be ezt a linket a böngészőbe:</p>
                            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 0.875rem;">
                                ${verificationLink}
                            </p>
                            
                            <div class="warning">
                                <p style="margin: 0;"><strong>Fontos:</strong></p>
                                <p style="margin: 5px 0 0 0;">
                                    • Ha nem te regisztráltál, hagyd figyelmen kívül ezt az emailt<br>
                                    • Az email cím megerősítése után használhatod a teljes funkcionalitást
                                </p>
                            </div>
                            
                            <p style="margin-top: 20px;">Üdvözlettel,<br><strong>Ingatlan Csapata</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Ingatlan. Minden jog fenntartva.</p>
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
        
        console.log(`Verification email sent to: ${recipientEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, error: error.message };
    }
};

// ====================================
// RESET PASSWORD EMAIL
// ====================================

const sendResetPasswordEmail = async (recipientEmail, recipientName, resetLink) => {
    try {
        const transporter = createTransporter();
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
                        .header { background: linear-gradient(135deg, #4f46e5, #4338ca); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background: #4338ca; }
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
                                <a href="${resetLink}" class="button">Jelszó Visszaállítása</a>
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

// FRISSÍTETT module.exports
module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail,  // ← ÚJ
    sendNewMessageEmail,
    sendPropertySuspendedEmail,
    sendNewInquiryEmail,
    sendWelcomeEmail
};