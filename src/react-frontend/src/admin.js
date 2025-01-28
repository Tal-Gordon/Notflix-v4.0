import "./admin.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [promoted, setPromoted] = useState(false);
  const [movieList, setMovieList] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const categoriesContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setErrorMessage("Failed to load categories");
      }
    };
    fetchCategories();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      const updatedResponse = await fetch("/categories");
      setCategories(await updatedResponse.json());

      setName("");
      setPromoted(false);
      setMovieList("");
      setEditingCategory(null);

      if (!editingCategory) navigate("/success");
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
  };

  const handleScroll = (direction) => {
    const container = categoriesContainerRef.current;
    const scrollAmount = 300;

    if (container) {
      if (direction === "left") {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
      setScrollPosition(container.scrollLeft);
    }
  };

  return (
    <div className="input-container">
      <div className="category-form">
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

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button className="category-button" type="submit">
            {editingCategory ? "Update Category" : "Create Category"}
          </button>
          {editingCategory && (
            <button
              type="button"
              className="category-button cancel"
              onClick={() => {
                setEditingCategory(null);
                setName("");
                setPromoted(false);
                setMovieList("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div className="categories-list">
          <h2>Existing Categories</h2>
          <div className="slider-container">
            <button
              className="scroll-button left"
              onClick={() => handleScroll("left")}
              disabled={scrollPosition === 0}
            >
              ←
            </button>
            <div
              className="categories-container"
              ref={categoriesContainerRef}
              onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
            >
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
            <button
              className="scroll-button right"
              onClick={() => handleScroll("right")}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
