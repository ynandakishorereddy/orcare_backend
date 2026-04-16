/**
 * Migration script: MongoDB to Supabase PostgreSQL
 * 
 * SETUP INSTRUCTIONS:
 * 1. Keep both MongoDB and Supabase credentials in .env
 * 2. Run: node scripts/migrateMongoToSupabase.js
 * 3. Verify all data is migrated
 * 4. Update server.js to use Supabase config
 */

const mongoose = require('mongoose');
const { supabase } = require('../config/supabase');
require('dotenv').config();

// Import MongoDB models (old)
const User = require('../models/User');
const Chat = require('../models/Chat');
const Disease = require('../models/Disease');
const Quiz = require('../models/Quiz');
const LearningCategory = require('../models/LearningCategory');
const Feedback = require('../models/Feedback');

const migrateData = async () => {
    try {
        // Connect to MongoDB
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI_LEGACY || process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // STEP 1: Migrate Users
        console.log('\n📦 Migrating Users...');
        const users = await User.find();
        console.log(`Found ${users.length} users`);

        if (users.length > 0) {
            const userData = users.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                password: user.password,
                age: user.age || null,
                gender: user.gender || null,
                district: user.district || null,
                state: user.state || null,
                profile_image_index: user.profileImageIndex || 0,
                profile_image_uri: user.profileImageUri || null,
                language: user.language || 'English',
                is_email_verified: user.isEmailVerified || false,
                email_otp: user.emailOtp || null,
                otp_expires: user.otpExpires || null,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            }));

            const { error: userError } = await supabase
                .from('users')
                .insert(userData);

            if (userError) {
                console.error('❌ User migration failed:', userError);
            } else {
                console.log(`✅ Migrated ${users.length} users`);
            }
        }

        // STEP 2: Migrate Diseases
        console.log('\n📦 Migrating Diseases...');
        const diseases = await Disease.find();
        console.log(`Found ${diseases.length} diseases`);

        if (diseases.length > 0) {
            const diseaseData = diseases.map(disease => ({
                id: disease.id,
                name: disease.name,
                icon_name: disease.iconName,
                color_hex: disease.colorHex,
                what_is_happening: disease.whatIsHappening,
                what_people_notice: disease.whatPeopleNotice,
                why_it_happens: disease.whyItHappens,
                why_not_ignore: disease.whyNotIgnore,
                when_to_see_dentist: disease.whenToSeeDentist,
                created_at: disease.createdAt,
                updated_at: disease.updatedAt,
            }));

            const { error: diseaseError } = await supabase
                .from('diseases')
                .insert(diseaseData);

            if (diseaseError) {
                console.error('❌ Disease migration failed:', diseaseError);
            } else {
                console.log(`✅ Migrated ${diseases.length} diseases`);
            }
        }

        // STEP 3: Migrate Learning Categories
        console.log('\n📦 Migrating Learning Categories...');
        const categories = await LearningCategory.find();
        console.log(`Found ${categories.length} learning categories`);

        if (categories.length > 0) {
            const categoryData = categories.map(category => ({
                id: category.id,
                title: category.title,
                icon_name: category.iconName,
                color_hex: category.colorHex,
                modules_json: category.modules || [],
                created_at: category.createdAt,
                updated_at: category.updatedAt,
            }));

            const { error: categoryError } = await supabase
                .from('learning_categories')
                .insert(categoryData);

            if (categoryError) {
                console.error('❌ Learning category migration failed:', categoryError);
            } else {
                console.log(`✅ Migrated ${categories.length} learning categories`);
            }
        }

        // STEP 4: Migrate Chat Sessions and Messages
        console.log('\n📦 Migrating Chats...');
        const chats = await Chat.find();
        console.log(`Found ${chats.length} chat sessions`);

        if (chats.length > 0) {
            for (const chat of chats) {
                // Create chat session
                const { data: chatSession, error: sessionError } = await supabase
                    .from('chat_sessions')
                    .insert([{
                        id: chat._id.toString(),
                        user_id: chat.userId.toString(),
                        session_id: chat.sessionId,
                        title: chat.title,
                        created_at: chat.createdAt,
                        updated_at: chat.updatedAt,
                    }])
                    .select()
                    .single();

                if (sessionError) {
                    console.error(`❌ Chat session migration failed for ${chat._id}:`, sessionError);
                    continue;
                }

                // Migrate messages
                if (chat.messages && chat.messages.length > 0) {
                    const messageData = chat.messages.map(msg => ({
                        chat_session_id: chatSession.id,
                        text: msg.text,
                        is_from_user: msg.isFromUser,
                        timestamp: msg.timestamp || new Date(),
                    }));

                    const { error: messageError } = await supabase
                        .from('chat_messages')
                        .insert(messageData);

                    if (messageError) {
                        console.error(`❌ Message migration failed for ${chat._id}:`, messageError);
                    } else {
                        console.log(`✅ Migrated ${chat.messages.length} messages for chat ${chat._id}`);
                    }
                }
            }
        }

        // STEP 5: Migrate Quizzes
        console.log('\n📦 Migrating Quizzes...');
        const quizzes = await Quiz.find();
        console.log(`Found ${quizzes.length} quizzes`);

        if (quizzes.length > 0) {
            const quizData = quizzes.map(quiz => ({
                id: quiz._id.toString(),
                user_id: quiz.userId.toString(),
                questions_json: quiz.questions || [],
                score: quiz.score || 0,
                taken_at: quiz.takenAt || new Date(),
            }));

            const { error: quizError } = await supabase
                .from('quizzes')
                .insert(quizData);

            if (quizError) {
                console.error('❌ Quiz migration failed:', quizError);
            } else {
                console.log(`✅ Migrated ${quizzes.length} quizzes`);
            }
        }

        // STEP 6: Migrate Feedbacks
        console.log('\n📦 Migrating Feedbacks...');
        const feedbacks = await Feedback.find();
        console.log(`Found ${feedbacks.length} feedbacks`);

        if (feedbacks.length > 0) {
            const feedbackData = feedbacks.map(feedback => ({
                id: feedback._id.toString(),
                name: feedback.name,
                email: feedback.email,
                message: feedback.message,
                created_at: feedback.createdAt,
                updated_at: feedback.updatedAt,
            }));

            const { error: feedbackError } = await supabase
                .from('feedbacks')
                .insert(feedbackData);

            if (feedbackError) {
                console.error('❌ Feedback migration failed:', feedbackError);
            } else {
                console.log(`✅ Migrated ${feedbacks.length} feedbacks`);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Verify all data in Supabase');
        console.log('2. Update your routes to use the new Supabase controllers');
        console.log('3. Update server.js to import Supabase config instead of MongoDB');
        console.log('4. Test all endpoints');
        console.log('5. Deploy to production');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('💔 Disconnected from MongoDB');
    }
};

// Run migration
migrateData();
