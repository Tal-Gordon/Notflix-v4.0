const movie = require('../models/movie');
const movieService = require('../services/movie');
const mongoose = require('mongoose');

// Helper to validate an array of ObjectId strings
const isValidArrayOfObjectIds = (arr) => {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every(item => mongoose.Types.ObjectId.isValid(item));
};

// Create a new movie
const createMovie = async (req, res) => {
    const { title, categories, actors, description, directors } = req.body;
    const picture = req.files?.picture?.[0];
    const video = req.files?.video?.[0];
    // Validate inputs
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing title' });
    }
    if (categories && !isValidArrayOfObjectIds(categories)) {
        return res.status(400).json({ error: 'Invalid categories format' });
    }

    try {
        const newMovie = await movieService.createMovie(title, categories, actors, description, directors, 
            picture,
            video);
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get movies for a user (including random unwatched movies and recently watched)
const getMoviesForUser = async (req, res) => {
    const userId = req.headers["id"];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Check if the user exists in the database
        const movies = await movieService.getMoviesForUser(userId);
        if (!movies) {
            return res.status(404).json({ error: 'User not found or no movies found' });
        }

        // Return the movies for the user
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a movie by its ID
const getMovie = async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid or missing movie ID' });
    }

    try {
        const movie = await movieService.getMovieById(id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an existing movie
const replaceMovie = async (req, res) => {
    const { id } = req.params;
    const { title, categories } = req.body;

    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid or missing movie ID' });
    }
    if (title && (typeof title !== 'string' || title.trim() === '')) {
        return res.status(400).json({ error: 'Invalid title' });
    }
    if (categories && !isValidArrayOfObjectIds(categories)) {
        return res.status(400).json({ error: 'Invalid categories format' });
    }

    // Warning if all fields are empty
    if (!title && (!categories || categories.length === 0)) {
        return res.status(400).json({
            message: 'No valid fields provided. No changes were made.',
        });
    }

    try {
        const updatedMovie = await movieService.replaceMovie(id, title, categories);

        if (!updatedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a movie by its ID
const deleteMovie = async (req, res) => {
    try {
        // Extract the movie ID directly from the params
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Movie ID is missing' });
        }

        // Call the deleteMovie service
        const deleteResponse = await movieService.deleteMovie(id);

        // Check the response status and handle accordingly
        if (deleteResponse.status === 400) {
            return res.status(400).json({ error: deleteResponse.result });
        }

        if (deleteResponse.status === 404) {
            return res.status(404).json({ error: deleteResponse.result });
        }

        // If status is 200, just return the deleted movie data
        if (deleteResponse.status === 200) {
            return res.status(200).json(deleteResponse.result);
        }

        // In case something unexpected happens
        return res.status(500).json({ error: 'Unexpected error occurred' });
    } catch (error) {
        // Handle any unexpected errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Search for movie
const searchMovies = async (req, res) => {
    const { query } = req.params;

    // Validate input
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing search query' });
    }

    try {
        // Search for the movie
        const movies = await movieService.searchMovies(query);

        if (!movies || movies.length === 0) {
            return res.status(404).json({ error: 'No movies found matching the query' });
        }

        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Recommend up to 10 movies
const getRecommendations = async (req, res) => {
    try {
        const userId = req.headers["id"];

        const urlSegments = req.path.split('/');
        const movieId = urlSegments[urlSegments.length - 2];

        if (!userId || !movieId) {
            return res.status(400).json({ error: "Movie ID or user ID are missing" });
        }

        // Call the recommendation service
        const recommendationResponse = await movieService.getRecommendations(userId, movieId);

        // Check the response status and handle accordingly
        if (recommendationResponse.status === 400) {
            return res.status(400).json({ error: recommendationResponse.result });
        }

        if (recommendationResponse.status === 404) {
            return res.status(404).json({ error: recommendationResponse.result });
        }

        // If status is 200, just return the movies
        if (recommendationResponse.status === 200) {
            return res.status(200).json(recommendationResponse.result);
        }

        // In case something unexpected happens
        return res.status(500).json({ error: 'Unexpected error occurred' });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const postMovieToServer = async (req, res) => {
    try {
        const userId = req.headers["id"];

        const urlSegments = req.path.split('/');
        const movieId = urlSegments[urlSegments.length - 2];

        if (!userId || !movieId) {
            return res.status(400).json({ error: "Movie ID or user ID are missing" });
        }

        // Call the service to post the movie
        const postMovieResponse = await movieService.postMovieToServer(userId, movieId);

        // Check the response status and handle accordingly
        if (postMovieResponse.status === 400) {
            return res.status(400).json({ error: postMovieResponse.result });
        }

        if (postMovieResponse.status === 404) {
            return res.status(404).json({ error: postMovieResponse.result });
        }

        // If status is 200, return the success message
        if (postMovieResponse.status === 201 || postMovieResponse.status === 204) {
            return res.status(postMovieResponse.status).json({ message: postMovieResponse.result });
        }

        // In case something unexpected happens
        return res.status(500).json({ error: 'Unexpected error occurred' });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createMovie,
    getMoviesForUser,
    getMovie,
    replaceMovie,
    deleteMovie,
    searchMovies,
    getRecommendations,
    postMovieToServer
};
