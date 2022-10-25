const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 1
    },
    password: {
        type: String,
        required: true,
        max: 1000,
        min: 6
    },
    email: {
        type: String,
        unique: true,
        max: 255,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema);