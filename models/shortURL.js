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
    },

    owner:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('ShortURL', shortURLSchema)