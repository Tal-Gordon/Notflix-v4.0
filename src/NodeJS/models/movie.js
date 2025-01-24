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
    ],
    actors: [{ type: String }],
    description: {type: String, default: ""},
    directors: [{ type: String }],
    picture: {type: String},
    video: {type: String}
});

module.exports = mongoose.model('Movie', movieSchema, 'Movies');
