const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    id : {
        type: Number,
        required: true
    },
    title : {
        type: String,
        required: true
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        }
    ]
});

module.exports = mongoose.model('Movie', movieSchema, 'Movies');
