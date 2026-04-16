const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword, requestDeleteOtp, confirmDeleteAccount } = require('../controllers/authController_supabase');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/request-delete-otp', requestDeleteOtp);
router.post('/confirm-delete-account', confirmDeleteAccount);

module.exports = router;
