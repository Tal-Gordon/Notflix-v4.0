import "./admin.css";
import { useState, useEffect } from "react";
import { Navbar, BUTTON_TYPES } from "./components/navbar";

function Admin() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [promoted, setPromoted] = useState(false);
  const [movieList, setMovieList] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [movies, setMovies] = useState([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [movieId, setMovieId] = useState("");
  const [movieCategories, setMovieCategories] = useState([]);
  const [movieActors, setMovieActors] = useState("");
  const [movieDirectors, setMovieDirectors] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [moviePicture, setMoviePicture] = useState(null);
  const [movieVideo, setMovieVideo] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [movieError, setMovieError] = useState("");

  const token = sessionStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }
        const [categoriesRes, moviesRes] = await Promise.all([
          fetch("/categories", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/movies/all", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        const response = await fetch("/movies", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // if (response.ok) {
        //   const data = await response.json();
        // }
        const data = await response.json();
        const categoriesData = await categoriesRes.json();
        const moviesData = await moviesRes.json();

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        if (Array.isArray(moviesData) == []) {
          console.log("no movies");
        }
        setMovies(Array.isArray(moviesData) ? moviesData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to load data");
        setMovies([]); // Ensure movies is always an array
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    const movieIds = movieList
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    const categoryData = {
      name: name.trim(),
      promoted,
      movie_list: movieIds,
    };

    try {
      const url = editingCategory
        ? `/categories/${editingCategory._id}`
        : "/categories";
      const method = editingCategory ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      const updatedResponse = await fetch("/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(await updatedResponse.json());

      setName("");
      setPromoted(false);
      setMovieList("");
      setEditingCategory(null);
      setShowModal(false);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const response = await fetch(`/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");
      setCategories(categories.filter((c) => c._id !== categoryId));
    } catch (error) {
      setErrorMessage(error.message || "Delete failed");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setPromoted(category.promoted);
    setMovieList(category.movie_list.join(", "));
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setName("");
    setPromoted(false);
    setMovieList("");
    setShowModal(true);
  };

  const handleMovieSubmit = async (event) => {
    event.preventDefault();
    setMovieError("");

    if (!movieTitle.trim()) {
      setMovieError("Title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", movieTitle.trim());
    formData.append("categories", JSON.stringify(movieCategories));
    formData.append(
      "actors",
      movieActors.split(",").map((actor) => actor.trim())
    );
    formData.append(
      "directors",
      movieDirectors.split(",").map((director) => director.trim())
    );
    formData.append("description", movieDescription);
    if (moviePicture) formData.append("picture", moviePicture);
    if (movieVideo) formData.append("video", movieVideo);

    try {
      const url = editingMovie ? `/movies/${editingMovie.id}` : "/movies";
      const method = editingMovie ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      const updatedResponse = await fetch("/movies");
      setMovies(await updatedResponse.json());

      resetMovieForm();
      setShowMovieModal(false);
    } catch (error) {
      setMovieError(error.message || "An error occurred");
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const response = await fetch(`/movies/${movieId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");
      setMovies(movies.filter((m) => m.id !== movieId));
    } catch (error) {
      setMovieError(error.message || "Delete failed");
    }
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setMovieTitle(movie.title);
    setMovieCategories(movie.categories);
    setMovieActors(movie.actors.join(", "));
    setMovieDirectors(movie.directors.join(", "));
    setMovieDescription(movie.description);
    setShowMovieModal(true);
  };

  const handleCreateMovie = () => {
    resetMovieForm();
    setShowMovieModal(true);
  };

  const resetMovieForm = () => {
    setEditingMovie(null);
    setMovieId("");
    setMovieTitle("");
    setMovieCategories([]);
    setMovieActors("");
    setMovieDirectors("");
    setMovieDescription("");
    setMoviePicture(null);
    setMovieVideo(null);
  };

  return (
    <div>
      <Navbar
        leftButtons={[BUTTON_TYPES.HOME]}
        rightButtons={[BUTTON_TYPES.LIGHTDARK, BUTTON_TYPES.LOGOUT]}
      />
      <div className="split-screen">
        <div className="left-panel">
          <h1>Categories</h1>
          <button className="create-button" onClick={handleCreate}>
            Create New Category
          </button>

          <div className="categories-list">
            <h2>Existing Categories</h2>
            <div className="categories-container">
              {categories.map((category) => (
                <div key={category._id} className="category-item">
                  <h3>{category.name}</h3>
                  <p>Promoted: {category.promoted ? "Yes" : "No"}</p>
                  <p>Movies: {category.movie_list.length} IDs</p>
                  <div className="category-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <h1>Movies</h1>
          <button className="create-button" onClick={handleCreateMovie}>
            Create New Movie
          </button>

          <div className="movies-list">
            <h2>Existing Movies</h2>
            <div className="movies-container">
              {movies.map((movie) => (
                <div key={movie.id} className="movie-item">
                  {movie.picture && (
                    <img
                      src={movie.picture}
                      alt={movie.title}
                      className="movie-thumbnail"
                    />
                  )}
                  <h3>{movie.title}</h3>
                  <p>ID: {movie.id}</p>
                  <p>Categories: {movie.categories.length}</p>
                  <p>Actors: {movie.actors.length}</p>
                  <div className="movie-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditMovie(movie)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showMovieModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMovieModal(false);
                resetMovieForm();
              }
            }}
          >
            <div className="modal-content">
              <h1 className="movie-title">
                {editingMovie ? "Edit Movie" : "Create New Movie"}
              </h1>
              <form onSubmit={handleMovieSubmit}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Movie Title *"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  required
                />

                <select
                  multiple
                  className="input-field"
                  value={movieCategories}
                  onChange={(e) =>
                    setMovieCategories(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="input-field"
                  placeholder="Actors (comma-separated)"
                  value={movieActors}
                  onChange={(e) => setMovieActors(e.target.value)}
                />

                <input
                  type="text"
                  className="input-field"
                  placeholder="Directors (comma-separated)"
                  value={movieDirectors}
                  onChange={(e) => setMovieDirectors(e.target.value)}
                />

                <textarea
                  className="input-field"
                  placeholder="Description"
                  value={movieDescription}
                  onChange={(e) => setMovieDescription(e.target.value)}
                />

                <div className="file-inputs">
                  <div className="file-input-group">
                    <label>Picture:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMoviePicture(e.target.files[0])}
                    />
                  </div>

                  <div className="file-input-group">
                    <label>Video:</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setMovieVideo(e.target.files[0])}
                    />
                  </div>
                </div>

                {movieError && (
                  <div className="error-message">{movieError}</div>
                )}

                <button className="movie-button" type="submit">
                  {editingMovie ? "Update Movie" : "Create Movie"}
                </button>
                <button
                  type="button"
                  className="movie-button cancel"
                  onClick={() => {
                    setShowMovieModal(false);
                    resetMovieForm();
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {showModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setEditingCategory(null);
                setName("");
                setPromoted(false);
                setMovieList("");
              }
            }}
          >
            <div className="modal-content">
              <h1 className="category-title">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h1>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Category Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="checkbox-container left-align">
                  <label>
                    <input
                      type="checkbox"
                      checked={promoted}
                      onChange={(e) => setPromoted(e.target.checked)}
                    />
                    Promoted
                  </label>
                </div>

                <input
                  type="text"
                  className="input-field"
                  placeholder="Movie IDs (comma-separated)"
                  value={movieList}
                  onChange={(e) => setMovieList(e.target.value)}
                />

                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                <button className="category-button" type="submit">
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
                <button
                  type="button"
                  className="category-button cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setName("");
                    setPromoted(false);
                    setMovieList("");
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
