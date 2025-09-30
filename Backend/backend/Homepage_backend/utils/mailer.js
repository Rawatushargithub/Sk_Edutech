import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Debug: Log the mailer environment variables to ensure they are loaded
console.log("[Mailer Debug] MAIL_HOST:", process.env.MAIL_HOST);
console.log("[Mailer Debug] MAIL_PORT:", process.env.MAIL_PORT);
console.log("[Mailer Debug] MAIL_USERNAME:", process.env.MAIL_USERNAME);
console.log("[Mailer Debug] MAIL_PASSWORD:", process.env.MAIL_PASSWORD ? "Exists" : "MISSING or Empty");
console.log("[Mailer Debug] MAIL_FROM_ADDRESS:", process.env.MAIL_FROM_ADDRESS);
console.log("[Mailer Debug] MAIL_FROM_NAME:", process.env.MAIL_FROM_NAME);
console.log("[Mailer Debug] NODE_ENV:", process.env.NODE_ENV);

const mailPort = parseInt(process.env.MAIL_PORT, 10) || 587;

// Enhanced transporter builder with production optimizations
const buildTransporter = async () => {
    const configured = Boolean(process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);
    const isProd = process.env.NODE_ENV === 'production';

    if (!configured) {
        if (isProd) {
            throw new Error('Mail server configuration is missing in production. Cannot send email.');
        }
        
        // Development fallback to Ethereal
        console.warn('[Mailer] No configuration found, using Ethereal test SMTP for development.');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // Production-optimized SMTP configuration
    const transporterConfig = {
        host: process.env.MAIL_HOST,
        port: mailPort,
        secure: mailPort === 465, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
        // Production-optimized connection settings
        pool: isProd, // Use connection pooling in production
        maxConnections: isProd ? 5 : 1,
        maxMessages: isProd ? 100 : 1,
        
        // Timeout settings - more aggressive for production
        connectionTimeout: isProd ? 30000 : 60000, // 30s for prod, 60s for dev
        greetingTimeout: isProd ? 15000 : 30000,   // 15s for prod, 30s for dev  
        socketTimeout: isProd ? 30000 : 60000,     // 30s for prod, 60s for dev
        
        // Additional production settings
        requireTLS: isProd, // Require TLS in production
        
        // Debug settings
        debug: !isProd,
        logger: !isProd,
        
        // Additional security for production
        ...(isProd && {
            tls: {
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2'
            }
        })
    };

    console.log(`[Mailer] Creating transporter for ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
    console.log(`[Mailer] SMTP Config: ${process.env.MAIL_HOST}:${mailPort} (secure: ${transporterConfig.secure})`);
    
    const transporter = nodemailer.createTransporter(transporterConfig);

    // Only verify connection in development or when explicitly needed
    if (!isProd) {
        try {
            await transporter.verify();
            console.log('[Mailer] SMTP connection verified successfully');
        } catch (error) {
            console.warn('[Mailer] SMTP verification failed:', error.message);
            // In development, still return the transporter - it might work for actual sending
        }
    } else {
        console.log('[Mailer] Skipping SMTP verification in production (as recommended by Nodemailer)');
    }

    return transporter;
};

/**
 * Enhanced sendEmail function with retry mechanism and better error handling
 */
const sendEmail = async ({ to, subject, text, html }, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'SK Education'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const transporter = await buildTransporter();
        console.log(`[Mailer] Attempting to send email to ${to} with subject "${subject}" (attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('[Mailer] Email sent successfully: %s', info.messageId);

        // If using Ethereal, log preview URL for easy testing
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[Mailer] Preview URL: ${previewUrl}`);
            info.previewUrl = previewUrl;
        }

        // Close the transporter if pooling is not used
        if (!transporter.options.pool) {
            transporter.close();
        }

        return info;
    } catch (error) {
        console.error(`[Mailer] Error sending email to ${to} (attempt ${retryCount + 1}):`, {
            message: error.message,
            code: error.code,
            command: error.command
        });

        // Retry logic for transient errors
        const isRetryableError = error.code === 'ETIMEDOUT' || 
                                error.code === 'ECONNRESET' || 
                                error.code === 'ENOTFOUND' ||
                                error.code === 'ECONNREFUSED';

        if (isRetryableError && retryCount < maxRetries) {
            console.log(`[Mailer] Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return sendEmail({ to, subject, text, html }, retryCount + 1);
        }

        // Enhanced error message based on error type
        let userFriendlyMessage = "Failed to send email. Please try again later.";
        
        if (error.code === 'ETIMEDOUT') {
            userFriendlyMessage = "Email service is temporarily unavailable. Please try again in a few minutes.";
        } else if (error.code === 'EAUTH') {
            userFriendlyMessage = "Email authentication failed. Please contact support.";
        } else if (error.code === 'ECONNREFUSED') {
            userFriendlyMessage = "Unable to connect to email server. Please try again later.";
        }

        throw new Error(`${userFriendlyMessage} (Error: ${error.message})`);
    }
};

/**
 * Alternative email sending using Brevo API (fallback option)
 * You can use this if SMTP continues to fail
 */
const sendEmailViaAPI = async ({ to, subject, text, html }) => {
    
    const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
        throw new Error('Brevo API key not configured');
    }

    const payload = {
        sender: {
            name: process.env.MAIL_FROM_NAME || 'SK Education',
            email: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html
    };

    if (process.env.MAIL_CC_ADDRESS) {
        payload.cc = [{ email: process.env.MAIL_CC_ADDRESS }];
    }

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Mailer] Brevo API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Brevo API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};

export { sendEmail, sendEmailViaAPI };
