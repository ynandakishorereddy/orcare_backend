const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword, requestDeleteAccountOtp, confirmDeleteAccount } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/request-delete-otp', requestDeleteAccountOtp);
router.post('/confirm-delete-account', confirmDeleteAccount);

module.exports = router;
