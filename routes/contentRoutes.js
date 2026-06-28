const express = require('express');
const router = express.Router();
const { getDiseases, getLearningCategories, createFeedback } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

// Using existing functions but mapping to requested paths
router.get('/categories', getLearningCategories);
router.get('/module/:id', getDiseases); // Reusing getDiseases logic for now, could be improved

// Keep old paths for backward compatibility if needed, but per requirements we focus on the specified ones
router.get('/diseases', getDiseases);
router.get('/learning', getLearningCategories);
router.post('/feedback', protect, createFeedback);

module.exports = router;
