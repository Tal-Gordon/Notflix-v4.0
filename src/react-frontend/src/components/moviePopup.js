import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './moviePopup.css';

const MoviePopup = ({ movie, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const token = sessionStorage.getItem('token');

    const handleClick = () => {
        navigate(`/watch/${movie._id}`);
    };

    useEffect(() => {
        // Since movie's categories are ids, we have to fetch the category names from the server
        const fetchCategoryNames = async () => {
            if (!movie?.categories) return;

            try {
                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }
                const categoryPromises = movie.categories.map(async (categoryId) => {
                    const response = await fetch(`/categories/${categoryId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    });
                    
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
    }, [movie, token]); // Run effect whenever movie changes

    if (!movie) return null;

    return (
        <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}> 
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

                <button onClick={handleClick} className="play-button">
                    Play Movie
                </button>
            </div>
        </div>
    );
};

export default MoviePopup;