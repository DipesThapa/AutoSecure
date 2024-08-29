const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    twoFASecret: { type: String },
    twoFAEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);

