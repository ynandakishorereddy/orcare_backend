const Disease = require('../models/Disease');
const LearningCategory = require('../models/LearningCategory');
const Feedback = require('../models/Feedback');

const contentController = {
    // @desc    Get all diseases
    // @route   GET /api/content/diseases
    // @access  Public
    getDiseases: async (req, res) => {
        try {
            const diseases = await Disease.find({});
            res.json(diseases);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // @desc    Get all learning categories
    // @route   GET /api/content/learning
    // @access  Public
    getLearningCategories: async (req, res) => {
        try {
            const categories = await LearningCategory.find({});
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // @desc    Submit feedback
    // @route   POST /api/content/feedback
    // @access  Public
    submitFeedback: async (req, res) => {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please provide all required fields (name, email, message)" });
        }

        try {
            const feedback = await Feedback.create({
                name,
                email,
                message
            });

            res.status(201).json({
                success: true,
                message: "Feedback submitted successfully!",
                data: feedback
            });
        } catch (error) {
            console.error('[BACKEND] Error submitting feedback:', error);
            res.status(500).json({ message: "Server error while saving feedback. Please try again." });
        }
    }
};

module.exports = contentController;
