const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const fs = require('fs');

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
        console.log(`[REAL] Email OTP sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message || err);
        throw err;
    }
};

// SMS Sender
const sendSmsOTP = async (phone, otp) => {
    // SMS functionality disabled per request
    console.log(`[DISABLED SMS] OTP for ${phone} is: ${otp}`);
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

    console.log("Body:", req.body);

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.isEmailVerified) {
                return res.status(400).json({
                    message: "User already exists and is verified. Please log in."
                });
            } else {
                // If user exists but not verified, update OTP and resend
                console.log(`[AUTH] User ${email} exists but not verified. Resending OTP.`);
                const otp = generateOTP();
                user.emailOtp = otp;
                user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                // Keep other details updated if provided
                user.name = name || user.name;
                if (password) user.password = password;
                user.age = age || user.age;
                user.gender = gender || user.gender;

                await user.save();

                try {
                    await sendEmailOTP(email, otp);

                    return res.status(200).json({
                        success: true,
                        message: "User already registered. A new verification OTP has been sent to your email.",
                        user: { _id: user._id, name: user.name, email: user.email }
                    });
                } catch (mailErr) {
                    console.error("[MAIL] Failed to resend email:", mailErr);
                    return res.status(500).json({
                        message: `Failed to send verification code. Please check server logs.`
                    });
                }
            }
        }

        const otp = generateOTP();
        user = await User.create({
            name,
            email,
            password,
            age,
            gender,
            language: language || "English",
            emailOtp: otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        try {
            await sendEmailOTP(email, otp);

            res.status(201).json({
                success: true,
                message: "User registered. Verification OTP sent to your email.",
                user: { _id: user._id, name: user.name, email: user.email }
            });
        } catch (mailErr) {
            console.error("[MAIL] Failed to send initial email:", mailErr);
            res.status(500).json({ message: "Account created but failed to send verification email. Please click register again to retry." });
        }

    } catch (error) {
        console.error("[AUTH] Registration Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};


// @desc Verify Email OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: "User not found"
            });

        if (user.emailOtp !== otp)
            return res.status(400).json({
                message: "Invalid OTP"
            });

        if (new Date() > user.otpExpires)
            return res.status(400).json({
                message: "OTP expired"
            });

        user.isEmailVerified = true;
        user.emailOtp = undefined;

        await user.save();

        res.json({
            success: true,
            message: "Email verified",
            token: generateToken(user._id),
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// @desc Resend Email OTP
const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: "User not found"
            });

        const otp = generateOTP();
        user.emailOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        await sendEmailOTP(email, otp);

        res.json({
            message: "Email OTP resent"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// @desc Forgot password
const forgotPassword = async (req, res) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: "User not found"
            });

        const otp = generateOTP();

        user.emailOtp = otp;

        user.otpExpires =
            new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        await sendEmailOTP(email, otp);

        res.json({
            message: "OTP sent"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// @desc Reset password
const resetPassword = async (req, res) => {

    const { email, otp, newPassword } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: "User not found"
            });

        if (user.emailOtp !== otp)
            return res.status(400).json({
                message: "Invalid OTP"
            });

        user.password = newPassword;

        user.emailOtp = undefined;

        await user.save();

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// @desc Login
const loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user =
            await User.findOne({ email });

        if (!user)
            return res.status(401).json({
                message: "Invalid credentials"
            });

        const match =
            await user.matchPassword(password);

        if (!match)
            return res.status(401).json({
                message: "Invalid credentials"
            });

        res.json({

            success: true,
            message: "Login successful",
            token:
                generateToken(user._id),

            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// JWT
const generateToken = (id) => {

    return jwt.sign(

        { id },

        process.env.JWT_SECRET,

        { expiresIn: "30d" }
    );
};


// @desc  Request OTP to delete account (verifies email + password first)
const requestDeleteAccountOtp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await user.matchPassword(password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const otp = generateOTP();
        user.emailOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const subject = 'ORCare Account Deletion Verification';
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
                .header { background-color: #1E293B; padding: 40px; text-align: center; }
                .content { padding: 40px; text-align: center; background-color: #ffffff; }
                .otp-box { background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 30px 0; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #ef4444; border: 2px dashed #fca5a5; }
                .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
                .brand-name { color: #ffffff; font-weight: 700; font-size: 24px; letter-spacing: 1px; }
                h1 { color: #ef4444; font-size: 28px; margin-bottom: 16px; font-weight: 700; }
                p { color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 16px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><div class="brand-name">ORCare</div></div>
                <div class="content">
                    <h1>⚠️ Account Deletion Request</h1>
                    <p>We received a request to permanently delete your ORCare account.</p>
                    <p>Use this code to confirm. <strong>This action cannot be undone.</strong></p>
                    <div class="otp-box">${otp}</div>
                    <p>This code expires in <strong>10 minutes</strong>. If you did not request this, change your password immediately.</p>
                </div>
                <div class="footer">&copy; ${new Date().getFullYear()} ORCare. All rights reserved.</div>
            </div>
        </body>
        </html>`;

        await sendMail({
            to: email,
            subject,
            text: `Your ORCare account deletion OTP is: ${otp}. It expires in 10 minutes.`,
            html: htmlContent
        });

        console.log(`[DELETE OTP] OTP sent to ${email}: ${otp}`);

        res.json({ success: true, message: 'Verification code sent to your email' });
    } catch (error) {
        console.error('[DELETE OTP] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc  Confirm account deletion with OTP
const confirmDeleteAccount = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        await user.deleteOne();

        res.json({ success: true, message: 'Account permanently deleted' });
    } catch (error) {
        console.error('[DELETE CONFIRM] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {

    registerUser,

    loginUser,

    verifyOtp,

    resendOtp,

    forgotPassword,

    resetPassword,

    requestDeleteAccountOtp,

    confirmDeleteAccount
};
