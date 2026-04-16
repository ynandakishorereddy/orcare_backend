const sendMail = require('../utils/sendMail');

(async () => {
  try {
    const info = await sendMail({
      to: 'harshithboddu2215@gmail.com',
      subject: 'Test Email from ORCare',
      text: 'This is a test email to verify SMTP setup.'
    });
    console.log('Test email sent:', info);
  } catch (err) {
    console.error('Test email error:', err);
  }
})();
