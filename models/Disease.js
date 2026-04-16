const mongoose = require('mongoose');

const diseaseSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    iconName: { type: String, required: true },
    colorHex: { type: String, required: true },
    whatIsHappening: { type: String, required: true },
    whatPeopleNotice: { type: String, required: true },
    whyItHappens: { type: String, required: true },
    whyNotIgnore: { type: String, required: true },
    whenToSeeDentist: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Disease', diseaseSchema);
