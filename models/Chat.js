const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [
        {
            text: { type: String, required: true },
            isFromUser: { type: Boolean, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
