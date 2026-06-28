const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Google Login / Registration
const googleLogin = async (req, res) => {
    console.log('--- GOOGLE LOGIN HIT ---');
    const { idToken, language } = req.body;

    try {
        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        
        console.log(`[AUTH] Google login attempt for: ${email}`);

        // 2. Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        let user = existingUser;

        // 3. Create user if doesn't exist
        if (!user || fetchError) {
            console.log(`[AUTH] Creating new user for: ${email}`);
            
            // Dummy password since it's Google Auth
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    name,
                    email,
                    password: randomPassword, // Fallback password field
                    profile_image_uri: picture,
                    language: language || 'English',
                    is_email_verified: true,
                }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        }

        // 4. Generate our API JWT
        const token = generateToken(user.id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                district: user.district,
                state: user.state,
                profileImageUri: user.profile_image_uri,
                language: user.language,
                isEmailVerified: user.is_email_verified,
            }
        });

    } catch (error) {
        console.error('Google Login error:', error.message);
        return res.status(401).json({ success: false, message: "Google authentication failed", details: error.message });
    }
};

// @desc Get Current Logged In User
const getMe = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

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
                profileImageUri: user.profile_image_uri,
                language: user.language,
                isEmailVerified: user.is_email_verified,
            }
        });
    } catch (error) {
        console.error('Get Me error:', error.message);
        return res.status(500).json({ success: false, message: "Failed to fetch user data" });
    }
};

module.exports = {
    googleLogin,
    getMe
};
