const mongoose = require('mongoose');

const quizSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [
    {
      questionId: String,
      questionText: String,
      selectedOption: String,
      correctOption: String,
      options: [String]
    }
  ],
  score: {
    type: Number,
    default: 0
  },
  takenAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
