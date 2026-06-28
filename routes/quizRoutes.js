const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { submitQuiz, getQuizHistory, getQuizById } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const validateRequest = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

router.post(
    '/submit',
    protect,
    [
        body('questions').isArray().withMessage('questions must be an array'),
        body('score').isNumeric().withMessage('score must be a number')
    ],
    validateRequest,
    submitQuiz
);

router.get('/modules', protect, getQuizHistory); // Maps to history for now
router.get('/:id', protect, getQuizById);

module.exports = router;
