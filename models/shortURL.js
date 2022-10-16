const mongoose = require('mongoose');
const shortid = require('shortid');

const shortURLSchema = new mongoose.Schema({
    fullURL: {
        type: String,
        required: true,
    },
    
    shortURL:{
        type: String,
        required: true,
        default: shortid.generate,
    },

    clicks: {
        type: Number,
        required: true,
        default: 0,
    }
})

module.exports = mongoose.model('Schema', shortURLSchema)