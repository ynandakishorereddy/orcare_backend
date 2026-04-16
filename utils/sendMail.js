require('dotenv').config();
const nodemailer = require('nodemailer');

const {
    BREVO_SMTP_HOST = 'smtp-relay.brevo.com',
    BREVO_SMTP_PORT = 587,
    BREVO_SMTP_USER,
    BREVO_SMTP_PASS,
    FROM_EMAIL,
    FROM_NAME = 'ORCare',
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS,
    MAIL_FROM
} = process.env;

const useBrevo = Boolean(BREVO_SMTP_USER && BREVO_SMTP_PASS);

const host = useBrevo ? BREVO_SMTP_HOST : (MAIL_HOST || 'smtp.mailtrap.io');
const port = useBrevo ? Number(BREVO_SMTP_PORT) : (Number(MAIL_PORT) || 2525);
const authUser = useBrevo ? BREVO_SMTP_USER : MAIL_USER;
const authPass = useBrevo ? BREVO_SMTP_PASS : MAIL_PASS;
const fromAddress = `"${FROM_NAME}" <${FROM_EMAIL}>`;


const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
        user: authUser,
        pass: authPass
    }
});

const sendMail = async ({ to, subject, text, html, attachments }) => {
    console.log(`[MAIL] Preparing to send to: ${to}`);
    console.log(`[MAIL] Subject: ${subject}`);
    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            text,
            html: html || `<h2>${text}</h2>`,
            attachments: attachments || []
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (err) {
        console.error('Email error details:', {
            message: err.message,
            code: err.code,
            command: err.command,
            response: err.response,
            stack: err.stack
        });
        throw err;
    }
};

module.exports = sendMail;
