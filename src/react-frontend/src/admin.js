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

  const token = sessionStorage.getItem("token");

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

      const result = await response.json();

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
      <div className="split-screen">
        <div className="left-panel">
          <h1>Categories</h1>
          <button className="create-button" onClick={() => handleModal('category')}>
            Create New Category
          </button>
          <div className="categories-list">
            <h2>Existing Categories</h2>
            <div className="categories-container">
              {state.categories.map(category => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onEdit={() => handleModal('category', category)}
                  onDelete={() => handleDelete('category', category._id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <h1>Movies</h1>
          <button className="create-button" onClick={() => handleModal('movie')}>
            Create New Movie
          </button>
          <div className="movies-list-admin">
            <h2>Existing Movies</h2>
            <div className="movies-container-admin">
              {state.movies.map(movie => (
                <MovieItem
                  key={movie._id}
                  movie={movie}
                  onEdit={() => handleModal('movie', movie)}
                  onDelete={() => handleDelete('movie', movie._id)}
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

const CategoryItem = memo(({ category, onEdit, onDelete }) => (
  <div className="category-item-admin">
    <div className="category-header">
      <h3>{category.name}</h3>
      <span className={`promoted-tag ${category.promoted ? 'active' : ''}`}>
        {category.promoted ? "Promoted" : "Regular"}
      </span>
    </div>
    <div className="category-details">
      <p>Contains {category.movie_list.length} movies</p>
      <div className="category-actions">
        <button className="button edit-button" onClick={onEdit}>
          Edit
        </button>
        <button className="button delete-button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  </div>
));

const MovieItem = memo(({ movie, onEdit, onDelete }) =>
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
    <div className="movie-item-admin">
      <div className="movie-media">
        {movie.picture && (
          <img
            src={`http://localhost:3001/${movie.picture}`}
            alt={movie.title}
            className="movie-thumbnail"
          />
        )}
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
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
          <button className="button edit-button" onClick={onEdit}>
            Edit
          </button>
          <button className="button delete-button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

const Modal = ({ type, formState, state, onClose, onSubmit, setFormState }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-content">
      <h1 className="modal-title">
        {formState.editingId ? `Edit ${type}` : `Create New ${type}`}
      </h1>
      <form onSubmit={onSubmit}>
        {type === 'category' ? (
          <>
            <input
              type="text"
              className="input-field"
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
              className="input-field"
              placeholder="Movie IDs (comma-separated)"
              value={formState.category.movieList}
              onChange={e => setFormState(prev => ({
                ...prev,
                category: { ...prev.category, movieList: e.target.value }
              }))}
            />
            {state.error && <div className="error-message">{state.error}</div>}
          </>
        ) : (
          <>
            <input
              type="text"
              className="input-field"
              placeholder="Movie Title *"
              value={formState.movie.title}
              onChange={e => setFormState(prev => ({
                ...prev,
                movie: { ...prev.movie, title: e.target.value }
              }))}
              required
            />
            <div className="category-checkboxes">
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
              className="input-field"
              placeholder="Actors (comma-separated)"
              value={formState.movie.actors}
              onChange={e => setFormState(prev => ({
                ...prev,
                movie: { ...prev.movie, actors: e.target.value }
              }))}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Directors (comma-separated)"
              value={formState.movie.directors}
              onChange={e => setFormState(prev => ({
                ...prev,
                movie: { ...prev.movie, directors: e.target.value }
              }))}
            />
            <textarea
              className="input-field"
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
        <div className="modal-buttons">
          <button className="modal-button" type="submit">
            {formState.editingId ? "Update" : "Create"}
          </button>
          <button className="modal-button cancel" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default Admin;