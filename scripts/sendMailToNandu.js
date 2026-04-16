const sendMail = require('../utils/sendMail');

(async () => {
  try {
    await sendMail({
      to: 'yerrabandinandu00@gmail.com',
      subject: 'Test Email from ORCare',
      text: 'Hello Nandu, this is a test email from ORCare backend.',
    });
    console.log('Mail sent successfully!');
  } catch (err) {
    console.error('Failed to send mail:', err);
  }
})();
