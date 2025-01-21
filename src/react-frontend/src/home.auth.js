import React, { useEffect, useState } from 'react';
import './home.auth.css';

function HomeAuth() {
    const [movies, setMovies] = useState([]); // To store the list of all movie titles
    const [error, setError] = useState(null); // To handle errors

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const userId = localStorage.getItem('userId'); // Retrieve the user ID
        
                if (!userId) {
                    throw new Error('User ID not found. Please log in again.');
                }
        
                const response = await fetch('/movies', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': userId, // Include the user ID in the headers
                    },
                });
        
                if (response.ok) {
                    const data = await response.json();
        
                    // Extract movie titles
                    const categoryMovies = data.categories.flatMap((category) =>
                        category.movies.map((movie) => movie.title)
                    );
                    const watchedMovies = data.watchedMovies.map((movie) => movie.title);
        
                    setMovies([...categoryMovies, ...watchedMovies]);
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to fetch movies');
                }
            } catch (err) {
                setError(err.message);
            }
        };
        

        fetchMovies();
    }, []);

    return (
        <div className="home-auth">
            <nav className="navbar">
                <ul className="nav-list">
                    <li className="nav-item">
                        <button className="logout-button-navbar">Logout</button>
                    </li>
                </ul>
            </nav>
            <div className="home-container">
                <h1 className="welcome-message-home">Welcome Back! What will you watch today?</h1>
                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="movies-list">
                        <h2>All Movies:</h2>
                        {movies.length === 0 ? (
                            <p>Loading movies...</p>
                        ) : (
                            <ul>
                                {movies.map((title, index) => (
                                    <li key={index}>{title}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeAuth;
