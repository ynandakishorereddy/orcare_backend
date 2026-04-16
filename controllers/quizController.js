const Quiz = require('../models/Quiz');

// Create a new quiz result
exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({
      userId: req.user._id,
      questions: req.body.questions,
      score: req.body.score,
      takenAt: req.body.takenAt || Date.now()
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all quizzes for a user
exports.getUserQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id });
    res.json(quizzes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
