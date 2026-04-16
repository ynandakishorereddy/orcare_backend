const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createQuiz, getUserQuizzes } = require('../controllers/quizController');

// Store a new quiz result
router.post('/', protect, createQuiz);

// Get all quizzes for the logged-in user
router.get('/', protect, getUserQuizzes);

module.exports = router;
