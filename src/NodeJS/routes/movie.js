const express = require('express');
var router = express.Router();
const movieController = require('../controllers/movie');
const authMiddleware = require('../middleware/auth');

router.route('/')
    // Create a new movie
    .post(authMiddleware, movieController.createMovie)
    // Get a list of movies for a user
    .get(authMiddleware, movieController.getMoviesForUser);

router.route('/:id')
    // Get a movie by its ID
    .get(authMiddleware, movieController.getMovie)
    // Update a movie by its ID
    .put(authMiddleware, movieController.replaceMovie)
    // Delete a movie by its ID
    .delete(authMiddleware, movieController.deleteMovie);

router.route('/:id/recommend')
    // Get recommendations for movies
    .get(authMiddleware, movieController.getRecommendations)
    .post(authMiddleware, movieController.postMovieToServer);


router.route('/search/:query')
    // Search for movies
    .get(authMiddleware, movieController.searchMovies);

module.exports = router;
