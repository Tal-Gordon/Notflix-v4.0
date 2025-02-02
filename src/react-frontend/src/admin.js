import "./admin.css";
import { useState, useEffect, useCallback, memo } from "react";
import { Navbar, BUTTON_TYPES } from "./components/navbar";

const API_ENDPOINTS = {
  CATEGORIES: "/categories",
  MOVIES: "/movies/all",
};

const Admin = () =>
{
  const [state, setState] = useState({
    categories: [],
    movies: [],
    error: "",
    movieError: "",
  });

  const [formState, setFormState] = useState({
    category: { name: "", promoted: false, movieList: "" },
    movie: {
      title: "",
      categories: [],
      actors: "",
      directors: "",
      description: "",
      picture: null,
      video: null,
    },
    editingId: null,
    showModal: false,
    modalType: null,
  });

  const [darkMode, setDarkMode] = useState(() =>
  {
    const storedDarkMode = sessionStorage.getItem("darkMode");
    return storedDarkMode === "true";
  });

  const token = sessionStorage.getItem("token");

  useEffect(() =>
  {
    const handleDarkModeChange = (event) =>
    {
      setDarkMode(event.detail);
    };

    window.addEventListener('darkModeChange', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
  }, [darkMode]);

  const fetchData = useCallback(async (abortController) =>
  {
    try
    {
      const [categoriesRes, moviesRes] = await Promise.all([
        fetch(API_ENDPOINTS.CATEGORIES, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        }),
        fetch(API_ENDPOINTS.MOVIES, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        }),
      ]);

      const [categoriesData, moviesData] = await Promise.all([
        categoriesRes.json(),
        moviesRes.json(),
      ]);

      setState(prev => ({
        ...prev,
        categories: Array.isArray(categoriesData) ? categoriesData : [],
        movies: Array.isArray(moviesData) ? moviesData : [],
      }));
    } catch (error)
    {
      if (error.name === 'AbortError') return;
      setState(prev => ({ ...prev, error: "Failed to load data" }));
    }
  }, [token]);

  useEffect(() =>
  {
    const abortController = new AbortController();
    if (token) fetchData(abortController);
    return () => abortController.abort();
  }, [token, fetchData]);

  const handleModal = (type, item = null) =>
  {
    setFormState(prev => ({
      ...prev,
      modalType: type,
      showModal: Boolean(type),
      editingId: item?._id || null,
      [type === 'category' ? 'category' : 'movie']: type === 'category' ? {
        name: item?.name || "",
        promoted: item?.promoted || false,
        movieList: item?.movie_list?.join(", ") || ""
      } : {
        title: item?.title || "",
        categories: item?.categories || [],
        actors: item?.actors?.join(", ") || "",
        directors: item?.directors?.join(", ") || "",
        description: item?.description || "",
        picture: null,
        video: null,
      }
    }));
  };

  const handleCategory = async (e) =>
  {
    e.preventDefault();
    const { name, promoted, movieList } = formState.category;

    if (!name.trim())
    {
      setState(prev => ({ ...prev, error: "Name required" }));
      return;
    }

    try
    {
      const url = formState.editingId
        ? `${API_ENDPOINTS.CATEGORIES}/${formState.editingId}`
        : API_ENDPOINTS.CATEGORIES;

      const response = await fetch(url, {
        method: formState.editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          promoted,
          movie_list: movieList.split(",").map(id => id.trim()).filter(Boolean),
        }),
      });

      if (!response.ok)
      {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update category');
      }

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json'))
      {
        result = await response.json();
      } else
      {
        result = formState.editingId
          ? { _id: formState.editingId, name, promoted, movie_list: movieList.split(",").map(id => id.trim()) }
          : { _id: Date.now().toString(), name, promoted, movie_list: [] };
      }

      setState(prev => ({
        ...prev,
        categories: formState.editingId
          ? prev.categories.map(c => c._id === result._id ? result : c)
          : [...prev.categories, result],
      }));

      handleModal(null);
    } catch (error)
    {
      setState(prev => ({ ...prev, error: error.message }));
      console.log(error.message)
    }
  };

  const handleMovie = async (e) =>
  {
    e.preventDefault();
    const { movie } = formState;

    if (!movie.title.trim())
    {
      setState(prev => ({ ...prev, movieError: "Title required" }));
      return;
    }

    const formData = new FormData();
    formData.append("title", movie.title.trim());
    movie.categories.forEach(c => formData.append("categories", c));
    movie.actors.split(',').forEach(a => formData.append("actors", a.trim()));
    movie.directors.split(',').forEach(d => formData.append("directors", d.trim()));
    formData.append("description", movie.description);
    if (movie.picture) formData.append("picture", movie.picture);
    if (movie.video) formData.append("video", movie.video);

    try
    {
      const url = formState.editingId
        ? `/movies/${formState.editingId}`
        : "/movies";

      const response = await fetch(url, {
        method: formState.editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      setState(prev => ({
        ...prev,
        movies: formState.editingId
          ? prev.movies.map(m => m._id === result._id ? result : m)
          : [...prev.movies, result],
      }));

      handleModal(null);
    } catch (error)
    {
      setState(prev => ({ ...prev, movieError: error.message }));
    }
  };

  const handleDelete = async (type, id) =>
  {
    if (!window.confirm(`Delete this ${type}?`)) return;

    try
    {
      await fetch(`/${type}s/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setState(prev => ({
        ...prev,
        [type === 'category' ? 'categories' : 'movies']:
          prev[type === 'category' ? 'categories' : 'movies'].filter(i => i._id !== id)
      }));
    } catch (error)
    {
      setState(prev => ({
        ...prev,
        [type === 'category' ? 'error' : 'movieError']: error.message
      }));
    }
  };

  return (
    <div>
      <Navbar
        leftButtons={[BUTTON_TYPES.HOME]}
        rightButtons={[BUTTON_TYPES.LIGHTDARK, BUTTON_TYPES.LOGOUT]}
      />
      <div className={`split-screen ${darkMode ? 'dark-mode' : ''}`}>
        <div className={`left-panel ${darkMode ? 'dark-mode' : ''}`}>
          <h1>Categories</h1>
          <button className={`create-button ${darkMode ? 'dark-mode' : ''}`} onClick={() => handleModal('category')}>
            Create New Category
          </button>
          <div className={`categories-list ${darkMode ? 'dark-mode' : ''}`}>
            <h2 className={darkMode ? 'dark-mode' : ''}>Existing Categories</h2>
            <div className={`categories-container ${darkMode ? 'dark-mode' : ''}`}>
              {state.categories.map(category => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onEdit={() => handleModal('category', category)}
                  onDelete={() => handleDelete('category', category._id)}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`right-panel ${darkMode ? 'dark-mode' : ''}`}>
          <h1 className={darkMode ? 'dark-mode' : ''}>Movies</h1>
          <button className={`create-button ${darkMode ? 'dark-mode' : ''}`} onClick={() => handleModal('movie')}>
            Create New Movie
          </button>
          <div className={`movies-list-admin ${darkMode ? 'dark-mode' : ''}`}>
            <h2 className={darkMode ? 'dark-mode' : ''}>Existing Movies</h2>
            <div className={`movies-container-admin ${darkMode ? 'dark-mode' : ''}`}>
              {state.movies.map(movie => (
                <MovieItem
                  key={movie._id}
                  movie={movie}
                  onEdit={() => handleModal('movie', movie)}
                  onDelete={() => handleDelete('movie', movie._id)}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        </div>

        {formState.showModal && (
          <Modal
            type={formState.modalType}
            formState={formState}
            state={state}
            onClose={() => handleModal(null)}
            onSubmit={formState.modalType === 'category' ? handleCategory : handleMovie}
            setFormState={setFormState}
          />
        )}
      </div>
    </div>
  );
};

const CategoryItem = memo(({ category, onEdit, onDelete, darkMode }) => (
  <div className={`category-item-admin ${darkMode ? 'dark-mode' : ''}`}>
    <div className={`category-header ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className={darkMode ? 'dark-mode' : ''}>{category.name}</h3>
      <span className={`promoted-tag ${category.promoted ? 'active' : ''} ${darkMode ? 'dark-mode' : ''}`}>
        {category.promoted ? "Promoted" : "Regular"}
      </span>
    </div>
    <div className={`category-details ${darkMode ? 'dark-mode' : ''}`}>
      <p className={darkMode ? 'dark-mode' : ''}>Contains {category.movie_list.length} movies</p>
      <div className="category-actions">
        <button className={`button edit-button ${darkMode ? 'dark-mode' : ''}`} onClick={onEdit}>
          Edit
        </button>
        <button className={`button delete-button ${darkMode ? 'dark-mode' : ''}`} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  </div>
));

const MovieItem = memo(({ movie, onEdit, onDelete, darkMode }) =>
{
  const [categoryNames, setCategoryNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() =>
  {
    const fetchCategoryNames = async () =>
    {
      if (!movie?.categories?.length)
      {
        setLoading(false);
        return;
      }

      try
      {
        const names = await Promise.all(
          movie.categories.map(async (categoryId) =>
          {
            const response = await fetch(`/categories/${categoryId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            return data.name;
          })
        );
        setCategoryNames(names);
      } catch (error)
      {
        console.error("Error fetching categories:", error);
        setCategoryNames(["Error loading categories"]);
      } finally
      {
        setLoading(false);
      }
    };

    fetchCategoryNames();
  }, [movie?.categories, token]);

  return (
    <div className={`movie-item-admin ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`movie-media ${darkMode ? 'dark-mode' : ''}`}>
        {movie.picture && (
          <img
            src={`http://localhost:3001/${movie.picture}`}
            alt={movie.title}
            className={`movie-thumbnail ${darkMode ? 'dark-mode' : ''}`}
          />
        )}
      </div>
      <div className={`movie-info ${darkMode ? 'dark-mode' : ''}`}>
        <h3 className={darkMode ? 'dark-mode' : ''}>{movie.title}</h3>
        <div className="movie-stats">
          <div className="stat-item">
            <span className="stat-label">Categories:</span>
            <span className="stat-value">
              {loading ? "Loading..." : categoryNames.join(", ")}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Actors:</span>
            <span className="stat-value">
              {Array.isArray(movie.actors) ? movie.actors.join(", ") : ""}
            </span>
          </div>
        </div>
        <div className="movie-actions">
          <button className={`button edit-button ${darkMode ? 'dark-mode' : ''}`} onClick={onEdit}>
            Edit
          </button>
          <button className={`button delete-button ${darkMode ? 'dark-mode' : ''}`} onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

const MovieIdList = ({ ids }) =>
{
  const [movies, setMovies] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() =>
  {
    const fetchMovies = async () =>
    {
      const results = await Promise.all(
        ids.map(async (id) =>
        {
          try
          {
            const response = await fetch(`/movies/${id.trim()}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Movie not found');
            const data = await response.json();
            return { id, name: data.title, error: false };
          } catch (error)
          {
            return { id, name: null, error: true };
          }
        })
      );
      setMovies(results);
    };

    if (ids.length > 0) fetchMovies();
  }, [ids, token]);

  return (
    <div className="movie-id-results">
      {movies.map((movie) => (
        <div key={movie.id} className={`movie-id-result ${movie.error ? 'error' : ''}`}>
          {movie.error ? (
            <span>Invalid ID: {movie.id}</span>
          ) : (
            <div className="movie-id-info">
              <div className="movie-title">{movie.name}</div>
              <span className="movie-id">ID: {movie.id}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Modal = ({ type, formState, state, onClose, onSubmit, setFormState, darkMode }) =>
{

  const [currentIds, setCurrentIds] = useState([]);

  useEffect(() =>
  {
    if (formState.modalType === 'category')
    {
      const initialIds = formState.category.movieList
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
      setCurrentIds(initialIds);
    }
  }, [formState.modalType, formState.category.movieList]);

  const handleMovieIdsInput = (e) =>
  {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      category: { ...prev.category, movieList: value }
    }));

    const newIds = value.split(',')
      .map(id => id.trim())
      .filter(Boolean);
    setCurrentIds(newIds);
  };

  return (
    <div className={`modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-content ${darkMode ? 'dark-mode' : ''}`}>
        <h1 className={`modal-title ${darkMode ? 'dark-mode' : ''}`}>
          {formState.editingId ? `Edit ${type}` : `Create New ${type}`}
        </h1>
        <form onSubmit={onSubmit}>
          {type === 'category' ? (
            <>
              <input
                type="text"
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Category Name *"
                value={formState.category.name}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  category: { ...prev.category, name: e.target.value }
                }))}
                required
              />
              <div className="checkbox-container left-align">
                <label>
                  <input
                    type="checkbox"
                    checked={formState.category.promoted}
                    onChange={e => setFormState(prev => ({
                      ...prev,
                      category: { ...prev.category, promoted: e.target.checked }
                    }))}
                  />
                  Promoted
                </label>
              </div>
              <input
                type="text"
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Movie IDs (comma-separated)"
                value={formState.category.movieList}
                onChange={handleMovieIdsInput}
              />
              {currentIds.length > 0 && (
                <div className="movie-id-validation">
                  <MovieIdList ids={currentIds} />
                </div>
              )}
              {state.error && <div className="error-message">{state.error}</div>}
            </>
          ) : (
            <>
              <input
                type="text"
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Movie Title *"
                value={formState.movie.title}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  movie: { ...prev.movie, title: e.target.value }
                }))}
                required
              />
              <div className={`checkbox-container ${darkMode ? 'dark-mode' : ''}`}>
                {state.categories.map(category => (
                  <label key={category._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={category._id}
                      checked={formState.movie.categories.includes(category._id)}
                      onChange={e => setFormState(prev => ({
                        ...prev,
                        movie: {
                          ...prev.movie,
                          categories: e.target.checked
                            ? [...prev.movie.categories, category._id]
                            : prev.movie.categories.filter(id => id !== category._id)
                        }
                      }))}
                    />
                    <span className="checkmark"></span>
                    {category.name}
                  </label>
                ))}
              </div>
              <input
                type="text"
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Actors (comma-separated)"
                value={formState.movie.actors}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  movie: { ...prev.movie, actors: e.target.value }
                }))}
              />
              <input
                type="text"
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Directors (comma-separated)"
                value={formState.movie.directors}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  movie: { ...prev.movie, directors: e.target.value }
                }))}
              />
              <textarea
                className={`input-field ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Description"
                value={formState.movie.description}
                onChange={e => setFormState(prev => ({
                  ...prev,
                  movie: { ...prev.movie, description: e.target.value }
                }))}
              />
              <div className="file-inputs">
                <div className="file-input-group">
                  <label>Picture:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFormState(prev => ({
                      ...prev,
                      movie: { ...prev.movie, picture: e.target.files[0] }
                    }))}
                  />
                </div>
                <div className="file-input-group">
                  <label>Video:</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setFormState(prev => ({
                      ...prev,
                      movie: { ...prev.movie, video: e.target.files[0] }
                    }))}
                  />
                </div>
              </div>
              {state.movieError && <div className="error-message">{state.movieError}</div>}
            </>
          )}
          <div className={`modal-buttons ${darkMode ? 'dark-mode' : ''}`}>
            <button className={`modal-button ${darkMode ? 'dark-mode' : ''}`} type="submit">
              {formState.editingId ? "Update" : "Create"}
            </button>
            <button className={`modal-button cancel ${darkMode ? 'dark-mode' : ''}`} type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;