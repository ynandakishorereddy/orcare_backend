const { supabase } = require('../config/supabase');

// @desc Submit quiz
const submitQuiz = async (req, res) => {
    const userId = req.user?.id;
    const { questions, score } = req.body;

    if (!userId || !questions || score === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .insert([{
                user_id: userId,
                questions_json: questions,
                score
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            quiz: {
                id: quiz.id,
                score: quiz.score,
                takenAt: quiz.taken_at
            }
        });
    } catch (error) {
        console.error('Submit quiz error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to submit quiz" });
    }
};

// @desc Get quiz history
const getQuizHistory = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('user_id', userId)
            .order('taken_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            quizzes: quizzes.map(quiz => ({
                id: quiz.id,
                score: quiz.score,
                takenAt: quiz.taken_at,
                questions: quiz.questions_json
            }))
        });
    } catch (error) {
        console.error('Get quiz history error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch quiz history" });
    }
};

// @desc Get quiz by ID
const getQuizById = async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || !id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({
            success: true,
            quiz: {
                id: quiz.id,
                score: quiz.score,
                takenAt: quiz.taken_at,
                questions: quiz.questions_json
            }
        });
    } catch (error) {
        console.error('Get quiz by ID error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch quiz" });
    }
};

module.exports = {
    submitQuiz,
    getQuizHistory,
    getQuizById
};
