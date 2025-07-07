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


const mailPort = parseInt(process.env.MAIL_PORT, 10); // Ensure port is a number

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: mailPort,
    secure: mailPort === 465, // `secure: true` is only for port 465. Port 587 uses STARTTLS (secure: false initially).
    auth: {
        user: process.env.MAIL_USERNAME, 
        pass: process.env.MAIL_PASSWORD, 
    },
    // For port 587 (STARTTLS), you might not need specific tls options unless there are issues.
    // If issues persist with 587, sometimes this helps:
    // tls: {
    //    ciphers:'SSLv3' // Or other specific ciphers if required by provider
    // }
});

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
    // Check if essential mail configurations are loaded
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.error("Mailer environment variables (MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD) are not set. Email will not be sent.");
        // In a real scenario, you might throw an error or have a fallback.
        // For this setup, we'll prevent Nodemailer from trying to connect without config.
        throw new Error("Mail server configuration is missing. Cannot send email.");
    }
    
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'SK Education'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body (optional)
    };

    try {
        console.log(`[Mailer] Attempting to send email via ${process.env.MAIL_HOST} to ${to} with subject "${subject}"`);
        const info = await transporter.sendMail(mailOptions);
        console.log('[Mailer] Email sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error(`[Mailer] Error sending email to ${to}:`, error);
        throw new Error(`Failed to send email. Please check mailer configuration and service status. Error: ${error.message}`);
    }
};

export { sendEmail };
