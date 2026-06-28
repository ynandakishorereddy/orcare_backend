const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendMessage, getChatHistory, getChatSessions, deleteChatSession } = require('../controllers/chatController');
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
    '/',
    protect,
    [
        body('sessionId').notEmpty().withMessage('sessionId is required'),
        body('message').notEmpty().withMessage('message is required')
    ],
    validateRequest,
    sendMessage
);

router.get('/history', protect, getChatHistory);
router.get('/sessions', protect, getChatSessions);
router.delete('/session', protect, deleteChatSession);

module.exports = router;
