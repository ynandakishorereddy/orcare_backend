const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validateRequest = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

router.post(
    '/google',
    [
        body('idToken').notEmpty().withMessage('Google idToken is required')
    ],
    validateRequest,
    googleLogin
);

router.get('/me', protect, getMe);

module.exports = router;
