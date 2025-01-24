import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './search';
import './home.auth.css';

function HomeAuth() {
    const [categories, setCategories] = useState([]);
    const [recentlyWatched, setRecentlyWatched] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userId = location.state?.userId;

        const fetchMovies = async () => {
            try {
                if (!userId) {
                    throw new Error('User ID not found. Please log in again.');
                }

                const response = await fetch('/movies', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'id': userId,
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    // Process categories
                    const categoryData = data.moviesByCategory.map((category) => ({
                        name: category.category.name,
                        movies: category.movies.map(movie => movie.title)
                    }));

                    // Process watched movies
                    const watchedMovies = data.recentlyWatched.map(movie => movie.title);

                    setCategories(categoryData);
                    setRecentlyWatched(watchedMovies);
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to fetch movies');
                }
            } catch (err) {
                setError(err.message || 'An unknown error occurred.');
            }
        };

        if (!isSearching) {
            fetchMovies();
        }
    }, [location.state?.userId, isSearching]);

    const handleSearch = async (query) => {
        if (!query) {
            setError(null);  // Clear error when search is empty
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/movies/search/${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'id': location.state?.userId,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
                setError(null);  // Only clear error on successful search
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Search failed');
            }
        } catch (err) {
            setError(err.message);  // Update error message but don't clear it
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="home-auth">
            <nav className="navbar2">
                <ul className="nav-list">
                    <li className="nav-item">
                        <SearchBar 
                            onSearch={handleSearch} 
                            userId={location.state?.userId}
                        />
                    </li>
                    <li className="nav-item">
                        <button className="logout-button-navbar" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="home-container">
                <div className="welcome-header">
                    <h1 className="welcome-message-home">Welcome Back! What will you watch today?</h1>
                </div>
                {error ? (
                    <div className="no-results-message">
                        No movies were found
                        {isSearching && <span style={{marginLeft: '10px'}}>🔍 Searching...</span>}
                    </div>  
                ) : (
                    <div className="movies-list">
                        {searchResults.length > 0 ? (
                            <>
                                <h2>Search Results</h2>
                                <ul className="movies-row">
                                    {searchResults.map((movie, index) => (
                                        <li key={index}>
                                            <button className="movie-item">
                                                {movie.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                {/* Render Categories */}
                                <h2>Movie Categories</h2>
                                {categories.length === 0 ? (
                                    <p>Loading categories...</p>
                                ) : (
                                    categories.map((category, index) => (
                                        <div key={index} className="category-section">
                                            <h3 className="category-title">{category.name}</h3>
                                            <ul className="movies-row">
                                                {category.movies.map((movie, idx) => (
                                                    <li key={`${index}-${idx}`}>
                                                        <button className="movie-item">
                                                            {movie}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                )}

                                {/* Render Watched Movies */}
                                <div className="watched-section">
                                    <h2 className="watched-title">Recently Watched Movies</h2>
                                    {recentlyWatched.length === 0 ? (
                                        <p>No recently watched movies</p>
                                    ) : (
                                        <ul className="watched-movies-list">
                                            {recentlyWatched.map((movie, index) => (
                                                <li key={index}>
                                                    <button className="watched-item">
                                                        {movie}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeAuth;