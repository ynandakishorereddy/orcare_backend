const { supabase } = require('../config/supabase');

// @desc Update user profile
const updateProfile = async (req, res) => {
    const userId = req.user?.id;
    // We intentionally ignore email and google_id so they cannot be modified
    const {
        name,
        age,
        gender,
        district,
        state,
        profileImageUri,
        language,
        // notification_settings and reminder_settings can be added here if DB supports them
    } = req.body;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (district !== undefined) updateData.district = district;
        if (state !== undefined) updateData.state = state;
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
                profileImageUri: updatedUser.profile_image_uri,
                language: updatedUser.language,
                isEmailVerified: updatedUser.is_email_verified,
            }
        });
    } catch (error) {
        console.error('Update profile error:', error.message);
        return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
    }
};

// @desc Delete user account
const deleteUser = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // 1. Delete all chat messages inside user's sessions (Cascade is better, but doing it manually just in case)
        const { data: sessions } = await supabase.from('chat_sessions').select('id').eq('user_id', userId);
        if (sessions && sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            await supabase.from('chat_messages').delete().in('chat_session_id', sessionIds);
        }

        // 2. Delete chat sessions
        await supabase.from('chat_sessions').delete().eq('user_id', userId);

        // 3. Delete quizzes
        await supabase.from('quizzes').delete().eq('user_id', userId);

        // 4. Delete user profile (Supabase auth users table if applicable, but this is our custom users table)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (deleteError) throw deleteError;

        return res.status(200).json({
            success: true,
            message: "Account and all associated data deleted successfully"
        });
    } catch (error) {
        console.error('Delete account error:', error.message);
        return res.status(500).json({ success: false, message: error.message || "Failed to delete account" });
    }
};

module.exports = {
    updateProfile,
    deleteUser
};
