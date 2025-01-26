import React, { useState, useEffect } from 'react';
import './moviePopup.css';

const MoviePopup = ({ movie, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Since movie's categories are ids, we have to fetch the category names from the server
        const fetchCategoryNames = async () => {
            if (!movie?.categories) return;

            try {
                const categoryPromises = movie.categories.map(async (categoryId) => {
                    const response = await fetch(`/categories/${categoryId}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch category ${categoryId}`);
                    }
                    const data = await response.json();
                    return data.name;
                });

                const categoryNames = await Promise.all(categoryPromises);
                setCategories(categoryNames);
            } catch (err) {
                setError(err.message);
                setCategories([]);
            }
        };

        fetchCategoryNames();
    }, [movie]); // Run effect whenever movie changes

    if (!movie) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>×</button>

                <div className="movie-header">
                    <img src={`http://localhost:3001/${movie.picture}`} alt={movie.title} className="movie-poster" />
                    <div className="movie-info">
                        <h2>{movie.title}</h2>
                        <div className="metadata">
                            <p><strong>Categories:</strong> 
                                {error ? (
                                    <span className="error">Error loading categories</span>
                                ) : (
                                    categories.length > 0 ? categories.join(', ') : 'Loading...'
                                )}
                            </p>
                            <p><strong>Directed by:</strong> {movie.directors.join(', ')}</p>
                            <p><strong>Starring:</strong> {movie.actors.join(', ')}</p>
                        </div>
                    </div>
                </div>

                <div className="movie-description">
                    <p>{movie.description}</p>
                </div>

                <a href={`http://localhost:3001/${movie.video}`} className="play-button">
                    Play Movie
                </a>
            </div>
        </div>
    );
};

export default MoviePopup;