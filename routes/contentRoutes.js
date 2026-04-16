const express = require('express');
const router = express.Router();
const { getDiseases, getLearningCategories, createFeedback } = require('../controllers/contentController_supabase');

router.get('/diseases', getDiseases);
router.get('/learning', getLearningCategories);
router.post('/feedback', createFeedback);

module.exports = router;
