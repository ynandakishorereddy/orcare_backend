const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', chatController.getChatResponse);
router.post('/ask', chatController.getChatResponse);
router.post('/save', protect, chatController.saveChatHistory);
router.get('/history', protect, chatController.getUserChats);

module.exports = router;
