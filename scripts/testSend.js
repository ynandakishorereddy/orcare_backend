const sendMail = require('../utils/sendMail');

(async () => {
  try {
    const to = 'kishorereddyyn1435.sse@saveetha.com';
    console.log('Sending test email to', to);
    const info = await sendMail({
      to,
      subject: 'ORCare — Brevo SMTP test',
      text: 'This is a test email from ORCare backend using Brevo SMTP.'
    });
    console.log('Send result:', info && info.messageId ? info.messageId : info);
    process.exit(0);
  } catch (err) {
    console.error('Test send failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
