const express = require('express');
const router = express.Router();
const { updateProfile, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.delete('/', protect, deleteUser);

module.exports = router;
