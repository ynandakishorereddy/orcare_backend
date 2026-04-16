const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware_supabase');
const { submitQuiz, getQuizHistory } = require('../controllers/quizController_supabase');

// Store a new quiz result
router.post('/', protect, submitQuiz);

// Get all quizzes for the logged-in user
router.get('/', protect, getQuizHistory);

module.exports = router;
