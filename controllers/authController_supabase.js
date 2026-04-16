const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const sendMail = require('../utils/sendMail');

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email Sender
const sendEmailOTP = async (email, otp) => {
    const subject = 'ORCare Verification Code';
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background-color: #1E293B; padding: 40px; text-align: center; }
            .content { padding: 40px; text-align: center; background-color: #ffffff; }
            .otp-box { background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 30px 0; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #10B981; border: 2px dashed #cbd5e1; }
            .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .brand-name { color: #ffffff; font-weight: 700; font-size: 24px; letter-spacing: 1px; }
            h1 { color: #1e293b; font-size: 28px; margin-bottom: 16px; font-weight: 700; }
            p { color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="brand-name">ORCare</div>
            </div>
            <div class="content">
                <h1>Action Required: Verification</h1>
                <p>Hello,</p>
                <p>Welcome to <strong>ORCare</strong>, your personal companion for oral health. To ensure the security of your account, please use the verification code provided below:</p>
                <div class="otp-box">${otp}</div>
                <p>This security code is specifically generated for your current request and will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this code, please ignore this email or contact our support team immediately.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} ORCare. All rights reserved.<br>
                <em>"Better Oral Health, Better Life"</em><br>
                <div style="margin-top: 10px;">ORCare Team</div>
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `Your ORCare verification code is: ${otp}. It expires in 10 minutes.`;

    console.log(`[DEBUG] OTP for ${email} is: ${otp}`);

    try {
        await sendMail({
            to: email,
            subject,
            text: textContent,
            html: htmlContent
        });
        console.log(`[EMAIL] OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message || err);
        throw err;
    }
};

// Hash password helper
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password helper
const comparePassword = async (enteredPassword, hashedPassword) => {
    return bcrypt.compare(enteredPassword, hashedPassword);
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register user
const registerUser = async (req, res) => {
    console.log('--- REGISTRATION HIT ---');
    const {
        name,
        email,
        password,
        age,
        gender,
        language,
    } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!fetchError && existingUser) {
            if (existingUser.is_email_verified) {
                return res.status(400).json({
                    message: "User already exists and is verified. Please log in."
                });
            } else {
                // User exists but not verified, resend OTP
                console.log(`[AUTH] User ${email} exists but not verified. Resending OTP.`);
                const otp = generateOTP();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                // Update existing user
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        name: name || existingUser.name,
                        password: await hashPassword(password),
                        age: age || existingUser.age,
                        gender: gender || existingUser.gender,
                        email_otp: otp,
                        otp_expires: otpExpires,
                    })
                    .eq('id', existingUser.id);

                if (updateError) throw updateError;

                try {
                    await sendEmailOTP(email, otp);
                    return res.status(200).json({
                        success: true,
                        message: "User already registered. A new verification OTP has been sent to your email.",
                        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email }
                    });
                } catch (mailErr) {
                    return res.status(500).json({
                        message: "Account created but failed to send verification email. Please try again."
                    });
                }
            }
        }

        // Create new user
        const otp = generateOTP();
        const hashedPassword = await hashPassword(password);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
                age,
                gender,
                language: language || 'English',
                email_otp: otp,
                otp_expires: otpExpires,
                is_email_verified: false,
            }])
            .select()
            .single();

        if (createError) throw createError;

        // Send verification email
        try {
            await sendEmailOTP(email, otp);
            return res.status(201).json({
                success: true,
                message: "Account created! Verification OTP has been sent to your email.",
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            });
        } catch (mailErr) {
            return res.status(500).json({
                message: "Account created but failed to send verification email. Please click register again to retry."
            });
        }
    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({ message: error.message || "Registration failed" });
    }
};

// @desc Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.is_email_verified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

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
                language: user.language,
                isEmailVerified: user.is_email_verified,
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: error.message || "Login failed" });
    }
};

// @desc Verify OTP
const verifyOtp = async (req, res) => {
    console.log('--- VERIFY OTP HIT ---');
    const { email, otp, type } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Please provide email and OTP" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check OTP and expiration
        if (user.email_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        // Mark email as verified
        const { error: updateError } = await supabase
            .from('users')
            .update({
                is_email_verified: true,
                email_otp: null,
                otp_expires: null,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        const token = generateToken(user.id);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                district: user.district,
                state: user.state,
                language: user.language,
                isEmailVerified: true,
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error.message);
        return res.status(500).json({ message: error.message || "OTP verification failed" });
    }
};

// @desc Resend OTP
const resendOtp = async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                email_otp: otp,
                otp_expires: otpExpires,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        await sendEmailOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error('Resend OTP error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to resend OTP" });
    }
};

// @desc Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                email_otp: otp,
                otp_expires: otpExpires,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        await sendEmailOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email"
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to send reset email" });
    }
};

// @desc Reset Password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Please provide email, OTP, and new password" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.email_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const hashedPassword = await hashPassword(newPassword);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                password: hashedPassword,
                email_otp: null,
                otp_expires: null,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return res.status(200).json({
            success: true,
            message: "Password reset successful!"
        });
    } catch (error) {
        console.error('Reset password error:', error.message);
        return res.status(500).json({ message: error.message || "Password reset failed" });
    }
};

// @desc Delete Account
const deleteAccount = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (deleteError) throw deleteError;

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Delete account error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to delete account" });
    }
};

// @desc Request Delete OTP
const requestDeleteOtp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                email_otp: otp,
                otp_expires: otpExpires,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        await sendEmailOTP(email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email"
        });
    } catch (error) {
        console.error('Request delete OTP error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to send OTP" });
    }
};

// @desc Confirm Delete Account
const confirmDeleteAccount = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Please provide email and OTP" });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.email_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Delete user
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

        if (deleteError) throw deleteError;

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Confirm delete account error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to delete account" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    deleteAccount,
    requestDeleteOtp,
    confirmDeleteAccount
};
