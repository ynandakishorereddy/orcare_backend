const { supabase } = require('../config/supabase');

// @desc Update user profile
const updateProfile = async (req, res) => {
    const userId = req.user?.id;
    const {
        name,
        age,
        gender,
        district,
        state,
        profileImageIndex,
        profileImageUri,
        language
    } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (district !== undefined) updateData.district = district;
        if (state !== undefined) updateData.state = state;
        if (profileImageIndex !== undefined) updateData.profile_image_index = profileImageIndex;
        if (profileImageUri !== undefined) updateData.profile_image_uri = profileImageUri;
        if (language !== undefined) updateData.language = language;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                age: updatedUser.age,
                gender: updatedUser.gender,
                district: updatedUser.district,
                state: updatedUser.state,
                profileImageIndex: updatedUser.profile_image_index,
                profileImageUri: updatedUser.profile_image_uri,
                language: updatedUser.language,
                isEmailVerified: updatedUser.is_email_verified,
            }
        });
    } catch (error) {
        console.error('Update profile error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to update profile" });
    }
};

// @desc Get user profile
const getProfile = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                district: user.district,
                state: user.state,
                profileImageIndex: user.profile_image_index,
                profileImageUri: user.profile_image_uri,
                language: user.language,
                isEmailVerified: user.is_email_verified,
            }
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch profile" });
    }
};

module.exports = {
    updateProfile,
    getProfile
};
