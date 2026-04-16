const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, deleteUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile).delete(protect, deleteUserProfile);
router.route('/delete').delete(protect, deleteUserProfile); // play store requirement for easy findability
router.route('/profile-update').post(protect, updateUserProfile); // Added for backward compatibility/choice

module.exports = router;
