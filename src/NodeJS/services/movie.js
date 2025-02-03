const Movie = require("../models/movie");
const User = require("../models/user");
const Category = require("../models/category");
const IdService = require("../services/globalId");
const mongoose = require("mongoose");
const net = require("net");
const path = require("path");
const fs = require("fs").promises;

// Create a new movie
const createMovie = async (
  title,
  categories,
  actors,
  description,
  directors,
  picture,
  video
) => {
  try {
    // Create the new movie
    const movie = new Movie({
      title: title,
      categories: categories || [],
      actors: actors || [],
      description: description || "",
      directors: directors || [],
    });

    // Generate global movie ID
    movie.id = await IdService.generateId();

    if (picture && picture !== '') {
      const uploadDir = "Media/Movies/Pictures";
      const fileExt = path.extname(picture.originalname);
      const fileName = `${movie._id}${fileExt}`;
      const filePath = path.join(uploadDir, fileName).replace(/\\/g, '/');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, picture.buffer);
      movie.picture = filePath;
    }

    if (video && video !== '') {
      const videoDir = "Media/Movies/Videos";
      const videoExt = path.extname(video.originalname);
      const videoName = `${movie.id}${videoExt}`;
      const videoPath = path.join(videoDir, videoName).replace(/\\/g, '/');

      await fs.mkdir(videoDir, { recursive: true });
      await fs.writeFile(videoPath, video.buffer);
      movie.video = videoPath;
    }

    // Save the movie
    await movie.save();

    // Add the movie to each category's movieList
    if (categories.length > 0) {
      await Category.updateMany(
        { _id: { $in: categories } },
        { $addToSet: { movie_list: movie._id } }
      );
    }

    return movie;
  } catch (error) {
    throw error;
  }
};

// Returns a object of two objects the first has an array of object, each of them has the category and a list of movies,
// the second has an array of movies.
const getMoviesForUser = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId).lean();
    if (!user) {
      return null;
    }

    const watchedMovies = user.watchedMovies;

    // Fetch promoted categories
    const promotedCategories = await Category.find({ promoted: true });

    const moviesByCategory = [];
    let recentlyWatched = [];

    // Get up to 20 random unwatched movies for each promoted category
    for (const category of promotedCategories) {
      const moviesInCategory = await Movie.find({
        categories: category._id,
        _id: { $nin: watchedMovies.map((movie) => movie.movieId) }, // Exclude watched movies
      }).lean();

      // Randomize the results and take up to 20 movies
      const randomMovies = moviesInCategory
        .sort(() => 0.5 - Math.random())
        .slice(0, 20);

      moviesByCategory.push({
        category: category,
        movies: randomMovies,
      });
    }

    // Get the last 20 watched movies and reshuffle them
    if (watchedMovies.length > 0) {
      // Fetch the full movie objects for the last 20 watched movie IDs
      const movieIds = watchedMovies.slice(-20); // Take the last 20 MongoDB ObjectIDs
      recentlyWatched = await Movie.find({ _id: { $in: movieIds } }).lean(); // Fetch movie objects from DB

      // Shuffle the movies randomly
      recentlyWatched = recentlyWatched.sort(() => 0.5 - Math.random());
    }
    return {
      moviesByCategory,
      recentlyWatched,
    };
  } catch (error) {
    throw error;
  }
};

// Get all movies
const getAllMovies = async () => {
  const movie = await Movie.find({}).lean();

  if (!movie) {
    return null;
  }

  return movie;
};

// Get a movie by its ID
const getMovieById = async (id) => {
  const movie = await Movie.findById(id);

  if (!movie) {
    return null;
  }

  return movie;
};

// Update an existing movie
const replaceMovie = async (
  id,
  title,
  categories,
  actors,
  description,
  directors,
  picture,
  video
) => {
  try {
    const existingMovie = await Movie.findById(id);
    if (!existingMovie) {
      throw new Error("Movie not found");
    }

    const update = {};
    if (title !== undefined) update.title = title;
    if (categories !== undefined) {
      // Remove the movie from the previous categories
      await Category.updateMany(
        { movie_list: id },
        { $pull: { movie_list: id } }
      );

      // Add the movie to the new categories
      await Category.updateMany(
        { _id: { $in: categories } },
        { $addToSet: { movie_list: id } }
      );

      update.categories = categories;
      update.actors = actors;
      update.description = description;
      update.directors = directors;
    }

    if (picture && picture !== '') {
      const uploadDir = "Media/Movies/Pictures";
      const fileExt = path.extname(picture.originalname);
      const fileName = `${update._id}${fileExt}`;
      const filePath = path.join(uploadDir, fileName).replace(/\\/g, '/');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, picture.buffer);
      update.picture = filePath;
    }

    if (video && video !== '') {
      const videoDir = "Media/Movies/Videos";
      const videoExt = path.extname(video.originalname);
      const videoName = `${update.id}${videoExt}`;
      const videoPath = path.join(videoDir, videoName).replace(/\\/g, '/');

      await fs.mkdir(videoDir, { recursive: true });
      await fs.writeFile(videoPath, video.buffer);
      update.video = videoPath;
    }
    
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true } // Return the updated movie, and validate
    );
    

    if (!updatedMovie) {
      throw new Error("Movie not found");
    }

    return updatedMovie;
  } catch (error) {
    throw error;
  }
};

// Delete a movie by its ID
const deleteMovie = async (movieId) => {
  try {
    // Find movie that got passed and all users who watched it
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return { status: 404, result: "Movie not found" };
    }

    const usersWithMovie = await User.find({
      watchedMovies: { $elemMatch: { $eq: movieId } },
    }).lean();

    // Construct DELETE command for each user
    const deleteCommands = usersWithMovie.map(
      (user) => `delete ${user.id} ${movie.id}`
    );
    const errors = [];

    // Connect to the recommendation server
    const client = new net.Socket();
    const serverHost = process.env.HOST || "127.0.0.1";
    const serverPort = 12345;

    await new Promise((resolve, reject) => {
      client.connect(serverPort, serverHost, async () => {
        try {
          for (const command of deleteCommands) {
            // Send the command and wait for acknowledgment
            await new Promise((resolveCommand, rejectCommand) => {
              client.write(`${command}`, (err) => {
                if (err) {
                  return rejectCommand(
                    new Error("Failed to write to server: " + err.message)
                  );
                }
              });

              client.once("data", (data) => {
                const response = data.toString().trim();
                if (!response.startsWith("200")) {
                  errors.push(response);
                }
                resolveCommand();
              });
            });
          }
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          client.destroy();
        }
      });

      client.on("error", (err) => {
        reject(
          new Error(
            "Failed to connect to the recommendation server: " + err.message
          )
        );
      });
    });

    // Delete references in every user who watched this movie and every category that has that movie, and the movie itself
    await User.updateMany(
      { watchedMovies: { $elemMatch: { $eq: movieId } } },
      { $pull: { watchedMovies: movieId } }
    );
    await Category.updateMany(
      { movie_list: { $elemMatch: { $eq: movieId } } },
      { $pull: { movie_list: movieId } }
    );
    await Movie.findByIdAndDelete(movie._id);

    if (errors.some((error) => error.startsWith("400"))) {
      // At least one error starts with "400"
      return {
        status: 500,
        result: "Got 400 from the data server, how did we get here?",
        errors,
      };
    } else {
      return { status: 200, result: "Movie deleted successfully", errors };
    }
  } catch (error) {
    throw new Error("Failed to delete movie: " + error.message);
  }
};

// Posts a movie to the recommendation server
const postMovieToServer = async (userId, movieId) => {
  try {
    // Fetch the movie and user
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return { status: 404, result: "Movie not found" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, result: "User not found" };
    }

    // Open a TCP connection to the other server
    const serverHost = process.env.HOST || "127.0.0.1";
    const serverPort = 12345;

    let isPatching = false; // Variable to track if the request is a patch

    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.connect(serverPort, serverHost, () => {
        // Send the "post" command
        const postCommand = `post ${user.id} ${movie.id}`;
        client.write(postCommand);
      });

      client.on("data", async (data) => {
        const response = data.toString().trim(); // Get the response as a string

        // Handle response
        if (!isPatching && response.startsWith("400")) {
          isPatching = true;
          const patchCommand = `patch ${user.id} ${movie.id}`;
          client.write(patchCommand);
        } else if (!isPatching && response.startsWith("404")) {
          isPatching = true;
          const patchCommand = `patch ${user.id} ${movie.id}`;
          client.write(patchCommand);
        } else if (!isPatching && response.startsWith("201")) {
          if (!user.watchedMovies.includes(movieId)) {
            user.watchedMovies.push(movieId);
            await user.save();
          }
          resolve({ status: 201, result: "The user's movie got posted" });
          client.destroy();
        } else if (isPatching && response.startsWith("400")) {
          resolve({
            status: 400,
            result: "Bad request to the recommendation server",
          });
          client.destroy();
        } else if (isPatching && response.startsWith("404")) {
          resolve({ status: 404, result: "Could not patch movie" });
          client.destroy();
        } else if (isPatching && response.startsWith("204")) {
          if (!user.watchedMovies.includes(movieId)) {
            user.watchedMovies.push(movieId);
            await user.save();
          }
          resolve({ status: 204, result: "The user's movie got patched" });
          client.destroy();
        } else {
          resolve({ status: 500, result: "Unexpected server response" });
          client.destroy();
        }
      });

      client.on("error", (err) => {
        reject(
          new Error(
            "Failed to connect to the recommendation server: " + err.message
          )
        );
      });

      client.on("close", () => {});
    });
  } catch (error) {
    throw new Error("Failed to post to the cpp server: " + error.message);
  }
};

// Recommends up to 10 movies
const getRecommendations = async (userId, movieId) => {
  try {
    // Fetch the movie and user
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return { status: 404, result: "Movie not found" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, result: "User not found" };
    }

    // Open a TCP connection to the other server
    const client = new net.Socket();
    const serverHost = process.env.HOST || "127.0.0.1";
    const serverPort = 12345;

    return new Promise((resolve, reject) => {
      client.connect(serverPort, serverHost, () => {
        // Send the "recommend" command
        client.write(`get ${user.id} ${movie.id}`);
      });

      client.on("data", async (data) => {
        const response = data.toString().trim(); // Get the response as a string

				if (response.startsWith("400"))
				{
					resolve({
						status: 400,
						result: "Bad request to the recommendation server",
					});
				} else if (response.startsWith("404"))
				{
					resolve({ status: 404, result: "Nothing to recommend" });
				} else if (response.startsWith("200"))
				{
					try
					{
						const movieIds = response
							.split("\n\n")[1] // Extract IDs after the 200 OK line
							.split(" ") // Split by space
							.filter((id) => id.trim()); // Remove empty strings
							// Fetch movies by their global IDs
							const validMovies = await Movie.find({
								id: { $in: movieIds },
							}).lean();

							resolve({ status: 200, result: validMovies });
					} catch
					{
						resolve({ status: 404, result: "Recommendation not found" }); // In case no movies were returned, and second split fails
					}
				}

        client.destroy(); // Close the connection
      });

			client.on("error", (err) =>
			{
				reject(
					new Error(
						"Failed to connect to the recommendation server: " + err.message
					)
				);
			});
		});
	} catch (error)
	{
		throw new Error("Failed to fetch recommendation: " + error.message);
	}
};

// Searches for movies
const searchMovies = async (query) => {
  try {
    // Query by title, add if title contains query or query contains title
    const titleMatches = await Movie.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Title contains query
        { title: { $regex: `.*${query}.*`, $options: "i" } }, // Query contains title
      ],
    }).lean();

    // Query by category, add if query contains category
    const allCategories = await Category.find().lean();
    const matchingCategories = allCategories.filter((category) => {
      const categoryName = category.name.toLowerCase();
      const queryLower = query.toLowerCase();
      return queryLower.includes(categoryName);
    });

    let categoryMatches = [];
    if (matchingCategories.length > 0) {
      const categoryIds = matchingCategories.map((category) => category._id);
      categoryMatches = await Movie.find({
        categories: { $in: categoryIds },
      }).lean();
    }

    // Query by actors, add if query matches any actor
    const actorMatches = await Movie.find({
      actors: { $elemMatch: { $regex: query, $options: "i" } }, // Actor contains query
    }).lean();

    // Query by directors, add if query matches any director
    const directorMatches = await Movie.find({
      directors: { $elemMatch: { $regex: query, $options: "i" } }, // Director contains query
    }).lean();

    // Query by MongoDB ID, add if exactly equal
    const mongoIdMatches = mongoose.isValidObjectId(query)
      ? [await Movie.findById(query).lean()].filter(Boolean)
      : [];

    // Combine results in the order: title, category, MongoDB ID
    return [
      ...titleMatches,
      ...categoryMatches,
      ...actorMatches,
      ...directorMatches,
      ...mongoIdMatches,
    ];
  } catch (error) {
    throw new Error("Error while searching for movies");
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  replaceMovie,
  deleteMovie,
  getMoviesForUser,
  postMovieToServer,
  getRecommendations,
  searchMovies,
};
