const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getChatSessions, deleteChatSession } = require('../controllers/chatController_supabase');
const { protect } = require('../middleware/authMiddleware_supabase');

router.post('/chat', protect, sendMessage);
router.post('/ask', protect, sendMessage);
router.post('/save', protect, sendMessage);
router.get('/history', protect, getChatHistory);

module.exports = router;
