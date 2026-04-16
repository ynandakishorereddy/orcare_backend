const mongoose = require('mongoose');

const userController = {
    // @desc    Get user profile
    // @route   GET /api/users/profile
    // @access  Private
    getUserProfile: async (req, res) => {
        const user = await req.user;
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    },

    // @desc    Update user profile
    // @route   PUT /api/users/profile
    // @access  Private
    updateUserProfile: async (req, res) => {
        const user = await req.user;

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.district = req.body.district || user.district;
            user.state = req.body.state || user.state;
            user.profileImageIndex = req.body.profileImageIndex !== undefined ? req.body.profileImageIndex : user.profileImageIndex;
            if (req.body.profileImageUri !== undefined) user.profileImageUri = req.body.profileImageUri;
            user.language = req.body.language || user.language;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    district: updatedUser.district,
                    state: updatedUser.state,
                    profileImageIndex: updatedUser.profileImageIndex,
                    profileImageUri: updatedUser.profileImageUri,
                    language: updatedUser.language
                },
                token: require('jsonwebtoken').sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
                    expiresIn: '30d'
                })
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    },

    // @desc    Delete user account
    // @route   DELETE /api/users/profile
    // @access  Private
    deleteUserProfile: async (req, res) => {
        const user = await req.user;

        if (user) {
            await user.deleteOne();
            res.json({
                success: true,
                message: 'User account deleted successfully'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }
};

module.exports = userController;
