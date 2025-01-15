const User = require('../models/user');
const IdService = require('../services/globalId');
const movieService = require('../services/movie');

const createUser = async (username, password, name, surname, picture, watchedMovies) => {
    const errors = []; // Array to collect errors
    try 
    {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            throw new Error("A user with this username already exists.");
        }

        const user = new User({
            username: username,
            password: password,
            name: name || "",
            surname: surname || "",
            picture: picture || ""
        });
        user.id = await IdService.generateId();

        if (watchedMovies && watchedMovies.length > 0) 
        {
            const validObjectIds = [];
            const invalidIds = [];

            // Catch ids of invalid format
            watchedMovies.forEach(id => {
                if (!mongoose.Types.ObjectId.isValid(id)) 
                {
                    invalidIds.push({ id, error: 'Invalid ID format' });
                } else 
                {
                    validObjectIds.push(mongoose.Types.ObjectId(id));
                }
            });

            errors.push(...invalidIds);
            const existingMovies = await Movie.find({ _id: { $in: validObjectIds } }).select('_id');
            const existingMovieIds = new Set(existingMovies.map(movie => movie._id.toString()));

            // Catch nonexistent ids
            validObjectIds.forEach(id => {
                if (!existingMovieIds.has(id.toString())) 
                {
                    errors.push({ id, error: 'Movie does not exist' });
                } else 
                {
                    user.watchedMovies.push({ movieId: id }); // Add valid and existing movieId
                    movieService.postMovieToServer(user._id, id)
                }
            });
        } 

        const savedUser = await user.save();
        return {
            success: true,
            user: savedUser,
            errors
        };
    } catch (error) {
        // Catch unexpected errors
        errors.push({ error: 'error', details: error.message });
        return {
            success: false,
            user: null,
            errors
        };
    }
};

const getUserById = async (id) => { return await User.findById(id); };

const authenticateUserById = async (id) => { return getUserById(id) };

const getUserByCredentials = async(username, password) => { return await User.findOne({ username, password }).select('_id'); }

module.exports = {
    createUser, getUserById, authenticateUserById, getUserByCredentials
}