import nodemailer from 'nodemailer';
// dotenv should be loaded in the main server.js file
import dotenv from 'dotenv';
dotenv.config();

// Debug: Log the mailer environment variables to ensure they are loaded
console.log("[Mailer Debug] MAIL_HOST:", process.env.MAIL_HOST);
console.log("[Mailer Debug] MAIL_PORT:", process.env.MAIL_PORT);
console.log("[Mailer Debug] MAIL_USERNAME:", process.env.MAIL_USERNAME);
console.log("[Mailer Debug] MAIL_PASSWORD:", process.env.MAIL_PASSWORD ? "Exists" : "MISSING or Empty");
console.log("[Mailer Debug] MAIL_FROM_ADDRESS:", process.env.MAIL_FROM_ADDRESS);
console.log("[Mailer Debug] MAIL_FROM_NAME:", process.env.MAIL_FROM_NAME);
console.log("[Mailer Debug] MAIL_FORCE_SMTP:", process.env.MAIL_FORCE_SMTP);

const mailPort = parseInt(process.env.MAIL_PORT, 10); // Ensure port is a number

// Build transporter dynamically so we can fallback to Ethereal in dev
const buildTransporter = async () => {
    const configured = Boolean(process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);
    const isProd = process.env.NODE_ENV === 'production';
    const forceSmtp = String(process.env.MAIL_FORCE_SMTP || '').toLowerCase() === 'true';

    if (configured) {
        const configuredHost = String(process.env.MAIL_HOST).toLowerCase().trim();
        const looksLocal = configuredHost === 'localhost' || configuredHost === '127.0.0.1';
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: mailPort,
            secure: mailPort === 465,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        // If forced or in production, use configured SMTP and do not fallback
        if (forceSmtp || isProd) {
            console.log(`[Mailer] Using Configured SMTP (${process.env.MAIL_HOST}:${mailPort}) [forced=${forceSmtp}, prod=${isProd}]`);
            // Optional: verify and throw explicit error if misconfigured
            try {
                await Promise.race([
                    transporter.verify(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('verify timeout')), 5000)),
                ]);
            } catch (e) {
                console.error('[Mailer] Configured SMTP verification failed:', e.message);
                throw new Error(`Configured SMTP verification failed: ${e.message}`);
            }
            return transporter;
        }

        // Development: allow fallback if localhost or verification fails
        if (!isProd) {
            if (looksLocal) {
                console.warn('[Mailer] Detected localhost SMTP in development. Falling back to Ethereal test SMTP.');
            } else {
                try {
                    await Promise.race([
                        transporter.verify(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('verify timeout')), 4000)),
                    ]);
                    console.log(`[Mailer] Using Configured SMTP (${process.env.MAIL_HOST}:${mailPort}) [dev verified]`);
                    return transporter;
                } catch (e) {
                    console.warn('[Mailer] Configured SMTP verify failed in development, falling back to Ethereal. Reason:', e.message);
                }
            }
            const testAccount = await nodemailer.createTestAccount();
            console.warn('[Mailer] Using Ethereal test SMTP account for development.');
            return nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }
    }

    if (!isProd) {
        // Auto-provision a test SMTP account from ethereal.email in development
        const testAccount = await nodemailer.createTestAccount();
        console.warn('[Mailer] Using Ethereal test SMTP account for development.');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // Production without configuration -> throw
    throw new Error('Mail server configuration is missing. Cannot send email.');
};

/**
 * Sends an email.
 * @param {object} mailDetails - Object containing to, subject, text, html.
 * @param {string} mailDetails.to Recipient email address.
 * @param {string} mailDetails.subject Email subject.
 * @param {string} mailDetails.text Plain text body.
 * @param {string} [mailDetails.html] HTML body (optional).
 * @returns {Promise<object>} Promise resolving with info object from Nodemailer.
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'SK Education'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const transporter = await buildTransporter();
        console.log(`[Mailer] Attempting to send email to ${to} with subject "${subject}"`);
        const info = await transporter.sendMail(mailOptions);
        console.log('[Mailer] Email sent successfully: %s', info.messageId);

        // If using Ethereal, log preview URL for easy testing
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[Mailer] Preview URL: ${previewUrl}`);
            info.previewUrl = previewUrl;
        }
        return info;
    } catch (error) {
        console.error(`[Mailer] Error sending email to ${to}:`, error);
        throw new Error(`Failed to send email. Please check mailer configuration and service status. Error: ${error.message}`);
    }
};

export { sendEmail };
