const movieService = require("../services/movie");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/user')

// Helper to validate an array of ObjectId strings
const isValidArrayOfObjectIds = (arr) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.every((item) => mongoose.Types.ObjectId.isValid(item));
};

// Create a new movie
const createMovie = async (req, res) => {
  let { title, categories, actors, description, directors } = req.body;
  let picture = req.files?.picture?.[0];
  let video = req.files?.video?.[0];
  if (picture === undefined) {
    picture = '';
  }
  if (video === undefined) {
    video = '';
  }
  // Validate inputs
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Invalid or missing title" });
  }
  
  if (categories && !Array.isArray(categories)) {
    categories = [categories];
  }
  if (categories && !isValidArrayOfObjectIds(categories)) {
    return res.status(400).json({ error: "Invalid categories format" });
  }
  if (actors) {
    actors = Array.isArray(req.body.actors) ? req.body.actors : [req.body.actors];
  }
  if (directors) {
    directors = Array.isArray(req.body.directors) ? req.body.directors : [req.body.directors];
  }
  

  if (actors && (
    !Array.isArray(actors) || 
    !actors.every(item => typeof item === "string")
  )) {
    return res.status(400).json({ error: "Invalid actors format" });
  }

  if (directors && (
    !Array.isArray(directors) ||
    !directors.every(item => typeof item === "string")
  )) {
    return res.status(400).json({ error: "Invalid directors format" });
  }

  try {
    const newMovie = await movieService.createMovie(
      title,
      categories || [],
      actors || [],
      description,
      directors || [],
      picture,
      video
    );
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies();
    if (!movies) {
      return res.status(404).json({ error: "no movies found" });
    }
    res.status(200).json(movies);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get movies for a user (including random unwatched movies and recently watched)
const getMoviesForUser = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    // Check if the user exists in the database
    const movies = await movieService.getMoviesForUser(userId);
    if (!movies) {
      return res
        .status(404)
        .json({ error: "User not found or no movies found" });
    }

    // Return the movies for the user
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a movie by its ID
const getMovie = async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid or missing movie ID" });
  }

  try {
    const movie = await movieService.getMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an existing movie
const replaceMovie = async (req, res) => {
  const { id } = req.params;
  let { title, categories, actors, description, directors } = req.body;
  let picture = req.files?.picture?.[0];
  let video = req.files?.video?.[0];
  if (picture === undefined) {
    picture = '';
  }
  if (video === undefined) {
    video = '';
  }

  // Validate inputs
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid or missing movie ID" });
  }
  if (title && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "Invalid title" });
  }
  if (categories && !Array.isArray(categories)) {
    categories = [categories];
  }
  if (categories && !isValidArrayOfObjectIds(categories)) {
    return res.status(400).json({ error: "Invalid categories format" });
  }
  if (actors) {
    actors = Array.isArray(req.body.actors) ? req.body.actors : [req.body.actors];
  }
  if (directors) {
    directors = Array.isArray(req.body.directors) ? req.body.directors : [req.body.directors];
  }
  

  if (actors && (
    !Array.isArray(actors) || 
    !actors.every(item => typeof item === "string")
  )) {
    return res.status(400).json({ error: "Invalid actors format" });
  }

  if (directors && (
    !Array.isArray(directors) ||
    !directors.every(item => typeof item === "string")
  )) {
    return res.status(400).json({ error: "Invalid directors format" });
  }

  // Warning if all fields are empty
  // if (!title && (!categories || categories.length === 0)) {
  //   return res.status(400).json({
  //     message: "No valid fields provided. No changes were made.",
  //   });
  // }

  try {
    const updatedMovie = await movieService.replaceMovie(
      id, 
      title, 
      categories, 
      actors, 
      description, 
      directors,
      picture,
      video
    );

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a movie by its ID
const deleteMovie = async (req, res) => {
  try {
    // Extract the movie ID directly from the params
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Movie ID is missing" });
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
    return res.status(500).json({ error: "Unexpected error occurred" });
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Search for movie
const searchMovies = async (req, res) => {
  const { query } = req.params;

  // Validate input
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Invalid or missing search query" });
  }

  try {
    // Search for the movie
    const movies = await movieService.searchMovies(query);

    if (!movies || movies.length === 0) {
      return res
        .status(404)
        .json({ error: "No movies found matching the query" });
    }

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Recommend up to 10 movies
const getRecommendations = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const urlSegments = req.path.split("/");
    const movieId = urlSegments[urlSegments.length - 2];

    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is missing" });
    }

    // Call the recommendation service
    const recommendationResponse = await movieService.getRecommendations(
      userId,
      movieId
    );

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
    return res.status(500).json({ error: "Unexpected error occurred" });
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.userId) {
    throw new Error("Token does not contain user ID");
  }

  return decoded.userId;
};

const postMovieToServer = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const urlSegments = req.path.split("/");
    const movieId = urlSegments[urlSegments.length - 2];

        if (!movieId) {
            return res.status(400).json({ error: "Movie ID is missing" });
        }

		const user = await getUserById(userId); // Find the user by ID

		if (!user) {
			return res.status(404).json({ error: "UserId in invalid" });
		}

		if(user.watchedMovies.some(watchedMovie => { return watchedMovie._id.equals(movieId); })) {
			return res.status(204);
		}

		try {
			const authHeader = req.headers.authorization;
    
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
			}

			const token = authHeader.split(' ')[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			
			const userId = decoded.userId;
			
			const urlSegments = req.path.split('/');
			const movieId = urlSegments[urlSegments.length - 2];
		
			if (!userId || !movieId) {
				return res.status(400).json({ error: "Movie ID or user ID are missing" });
			}
		} catch (err) {
			return res.status(401).json({ error: "Invalid or expired token" });
		}

    // Call the service to post the movie
    const postMovieResponse = await movieService.postMovieToServer(
      userId,
      movieId
    );

    // Check the response status and handle accordingly
    if (postMovieResponse.status === 400) {
      return res.status(400).json({ error: postMovieResponse.result });
    }

    if (postMovieResponse.status === 404) {
      return res.status(404).json({ error: postMovieResponse.result });
    }

    // If status is 200, return the success message
    if (postMovieResponse.status === 201 || postMovieResponse.status === 204) {
      return res
        .status(postMovieResponse.status)
        .json({ message: postMovieResponse.result });
    }

    // In case something unexpected happens
    return res.status(500).json({ error: "Unexpected error occurred" });
  } catch (error) {
    if (error.message.includes("authorization header")) {
      return res.status(401).json({ error: error.message });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMoviesForUser,
  getMovie,
  replaceMovie,
  deleteMovie,
  searchMovies,
  getRecommendations,
  postMovieToServer,
};
