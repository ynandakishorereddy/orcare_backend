const axios = require('axios');
require('dotenv').config();

/**
 * Send SMS using Brevo (Sendinblue) API
 * @param {Object} options - { to: '+91...', content: 'Your OTP is...' }
 */
const sendSms = async ({ to, content }) => {
    console.log(`[SMS] Preparing to send to: ${to}`);

    // Check if we have an API key or a specific BREVO_SMS_KEY
    const apiKey = process.env.BREVO_SMTP_PASS || process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.warn('[SMS] No Brevo API key found. Logging SMS to console instead.');
        console.log(`[DEBUG SMS] TO: ${to} | CONTENT: ${content}`);
        return { message: 'SMS logged to console (no API key)' };
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/transactionalSMS/sms',
            {
                type: 'transactional',
                unicodeEnabled: true,
                sender: 'ORCare',
                recipient: to,
                content: content
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                }
            }
        );

        console.log('[SMS] Sent successfully:', response.data);
        return response.data;
    } catch (err) {
        console.error('[SMS] Error sending SMS:', err.response ? err.response.data : err.message);
        throw err;
    }
};

module.exports = sendSms;
