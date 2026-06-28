require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP Connection Failed:', error);
        process.exit(1);
    } else {
        console.log('SMTP Connection Successful!');
        process.exit(0);
    }
});
