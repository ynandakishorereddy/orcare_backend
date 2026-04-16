const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    iconName: { type: String, default: 'Check' }
});

const quizQuestionSchema = mongoose.Schema({
    id: { type: Number, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, required: true }
});

const learningModuleSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    lessonCount: { type: Number, required: true },
    objective: { type: String, required: true },
    iconName: { type: String, required: true },
    lessons: [lessonSchema],
    quiz: [quizQuestionSchema],
    points: { type: Number, default: 10 }
});

const learningCategorySchema = mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    iconName: { type: String, required: true },
    colorHex: { type: String, required: true },
    modules: [learningModuleSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningCategory', learningCategorySchema);
