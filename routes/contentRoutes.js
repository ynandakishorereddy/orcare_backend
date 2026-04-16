const express = require('express');
const router = express.Router();
const { getDiseases, getLearningCategories, submitFeedback } = require('../controllers/contentController');

router.get('/diseases', getDiseases);
router.get('/learning', getLearningCategories);
router.post('/feedback', submitFeedback);

module.exports = router;
