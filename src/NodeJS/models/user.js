const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username : {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: { type: Boolean,
        default: false },
    name: {
        type: String,
        default: ""
    },
    surname: {
        type: String,
        default: ""
    },
    picture: {
        type: String,
        default: ""
    },
    id: {
        type: Number
    },
    watchedMovies: {
        type: [
            {
                movieId: Schema.Types.ObjectId
            }
        ],
        default: []
    }
});

module.exports = mongoose.model('User', userSchema, 'Users');
