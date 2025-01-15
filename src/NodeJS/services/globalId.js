const User = require('../models/user');
const Movie = require('../models/movie');

let id = 0;

async function initializeId() {
        // Find the highest current id, start at 0 if no records exist
        const maxIdUser = await User.findOne().sort({ id: -1 }).select('id').lean();
        const maxIdMovie = await Movie.findOne().sort({ id: -1 }).select('id').lean();

        const idUser = maxIdUser ? maxIdUser.id : 0;
        const idMovie = maxIdMovie ? maxIdMovie.id : 0;

        // Determine the highest id across both models
        if (idUser !== 0 || idMovie !== 0) // to avoid starting at 1 if both are 0
        {
            id = Math.max(idUser, idMovie) + 1;
        }
}

const generateId = async () => {
    if (id === 0) {
        await initializeId();
    }

    // Return the value BEFORE incrementing
    return id++;
};

module.exports = {
    generateId
}