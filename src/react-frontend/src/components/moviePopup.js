import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './moviePopup.css';

const MoviePopup = ({ movie, onClose }) =>
{
    const [categories, setCategories] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [recommendationsError, setRecommendationsError] = useState(null);
    const [darkMode, setDarkMode] = useState(() =>
    {
        const storedDarkMode = sessionStorage.getItem("darkMode");
        return storedDarkMode === "true";
    });

    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    useEffect(() =>
    {
        const handleDarkModeChange = (event) =>
        {
            setDarkMode(event.detail);
        };

        window.addEventListener('darkModeChange', handleDarkModeChange);
        return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
    }, [darkMode]);

    useEffect(() =>
    {
        const fetchRecommendations = async () =>
        {
            try
            {
                const response = await fetch(`/movies/${movie._id}/recommend`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok)
                {
                    if (response.status !== 404)
                    {
                        throw new Error('Failed to fetch recommendations');
                    }
                    setRecommendations([]);
                    setRecommendationsError(null);
                }

                const data = await response.json();
                if (data.error)
                {
                    setRecommendations([]);
                    setRecommendationsError(data.error);
                } else if (Array.isArray(data))
                {
                    setRecommendations(data);
                } else
                {
                    throw new Error("Unexpected recommendations format");
                }
                setCategoriesError(null);
            } catch (err)
            {
                setRecommendations([]);
                setRecommendationsError(err.message);
            } finally
            {
                setLoadingRecs(false);
            }
        };

        if (movie?._id)
        {
            fetchRecommendations();
        }
    }, [movie?._id, token]);

    const handleClick = () =>
    {
        fetch(`/movies/${movie._id}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error('Error fetching recommendations:', err));

        navigate(`/watch/${movie._id}`);
    };

    useEffect(() =>
    {
        const fetchCategoryNames = async () =>
        {
            if (!movie?.categories) return;

            try
            {
                if (!token)
                {
                    throw new Error('No authentication token found. Please log in again.');
                }
                const categoryPromises = movie.categories.map(async (categoryId) =>
                {
                    const response = await fetch(`/categories/${categoryId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    });

                    if (!response.ok)
                    {
                        throw new Error(`Failed to fetch category ${categoryId}`);
                    }
                    const data = await response.json();
                    return data.name;
                });

                const categoryNames = await Promise.all(categoryPromises);
                setCategories(categoryNames);
            } catch (err)
            {
                setCategoriesError(err.message);
                setCategories([]);
            }
        };

        fetchCategoryNames();
    }, [movie, token]);

    if (!movie) return null;

    return (
        <div className={`popup-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>×</button>

                <div className="movie-header">
                    <img src={`http://localhost:3001/${movie.picture}`} alt={movie.title} className="movie-poster" />
                    <div className="movie-info">
                        <h2>{movie.title}</h2>
                        <div className="metadata">
                            <p><strong>Categories:</strong>
                                {categoriesError ? (
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

                <div className="play-button-container">
                    <button onClick={handleClick} className="play-button">
                        Play Movie
                    </button>
                </div>
                <div className="recommendations-section">
                    <h3>Recommended Movies</h3>
                    {loadingRecs ? (
                        <div className="loading">Loading recommendations...</div>
                    ) : recommendationsError ? (
                        <div className="error">Error loading recommendations: {recommendationsError}</div>
                    ) : (
                        <div className="recommendations-list">
                            {recommendations.map(rec => (
                                <button
                                    key={rec._id}
                                    className="recommended-movie"
                                    onClick={() => navigate(`/watch/${rec._id}`)}
                                >
                                    <img
                                        src={`http://localhost:3001/${rec.picture}`}
                                        alt={rec.title}
                                        className="recommended-poster"
                                    />
                                    <div className="recommended-title">{rec.title}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MoviePopup;
