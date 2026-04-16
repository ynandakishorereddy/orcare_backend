const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController_supabase');
const { protect } = require('../middleware/authMiddleware_supabase');

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/delete').delete(protect, updateProfile); // Delete functionality in updateProfile
router.route('/profile-update').post(protect, updateProfile);

module.exports = router;
