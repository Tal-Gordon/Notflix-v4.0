import React, { useEffect, useState } from 'react';
import SearchBar from './search';
import './home.auth.css';
import MoviePopup from './components/moviePopup';
import { Navbar, BUTTON_TYPES } from './components/navbar';

function HomeAuth() {
    const [categories, setCategories] = useState([]);
    const [recentlyWatched, setRecentlyWatched] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        const storedDarkMode = sessionStorage.getItem("darkMode");
        return storedDarkMode === "true";
    });
    
    const token = sessionStorage.getItem('token');

    useEffect(() => {
            const handleDarkModeChange = (event) => {
                setDarkMode(event.detail);            
            };
    
            window.addEventListener('darkModeChange', handleDarkModeChange);
            return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
        }, [darkMode]);

    useEffect(() => {

        const fetchMovies = async () => {
            try {
                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/movies`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    const allMovies = [
                        ...data.moviesByCategory.flatMap(c => c.movies),
                        ...data.recentlyWatched
                    ];

                    const randomMovie = allMovies.length > 0 
                        ? allMovies[Math.floor(Math.random() * allMovies.length)]
                        : null;

                    // Process categories
                    const categoryData = data.moviesByCategory.map((category) => ({
                        name: category.category.name,
                        movies: category.movies.map(movie => ({
                            ...movie,
                            picture: movie?.picture || 'samplePicture.jpg',
                            video: movie?.video || 'sampleVideo.mp4'
                        }))
                    }));

                    const watchedMovies = data.recentlyWatched.map(movie => ({
                        ...movie,
                        picture: movie?.picture || 'samplePicture.jpg',
                        video: movie?.video || 'sampleVideo.mp4'
                    }));

                    setCategories(categoryData);
                    setRecentlyWatched(watchedMovies);
                    setFeaturedMovie({
                        ...randomMovie,
                        picture: randomMovie?.picture || 'samplePicture.jpg',
                        video: randomMovie?.video || 'sampleVideo.mp4'
                    });
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
    }, [isSearching, token]);

    const handleSearch = async (query) => {
        if (!query) {
            setError(null);  // Clear error when search is empty
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/movies/search/${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    return (
        <div>
            <Navbar 
                leftButtons={[
                    BUTTON_TYPES.HOME,
                    sessionStorage.getItem('admin') === 'true' && BUTTON_TYPES.ADMIN
                ]}
                rightButtons={[
                    BUTTON_TYPES.LIGHTDARK,
                    BUTTON_TYPES.LOGOUT,
                    BUTTON_TYPES.ACCOUNT
                ]}
                injectRight={
                    <SearchBar 
                        onSearch={handleSearch} 
                    />
                }
            /> 
            <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
                {/* <div className="welcome-header">
                    <h1 className="welcome-message-home-auth">
                        <span className="brand-highlight">Back so soon?</span><br/>
                        We didn't even clean up the popcorn crumbs!
                    </h1>
                </div> */}
                {error ? (
                    <div className={`no-results-message ${darkMode ? 'dark-mode' : ''}`}>
                        No movies were found
                        {isSearching && <span style={{marginLeft: '10px'}}>🔍 Searching...</span>}
                    </div>  
                ) : (
                    <div className="movies-list">
                        {searchResults.length > 0 ? (
                            <>
                                <h2>Search Results</h2>
                                <div className="movies-row-container">
                                    <ul className={`movies-row ${darkMode ? 'dark-mode' : ''}`}>
                                        <button 
                                            className={`scroll-button ${darkMode ? 'dark-mode' : ''} left`}
                                            onClick={() => {
                                                const container = document.querySelector('.movies-row');
                                                container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
                                            }}
                                        >
                                            <svg
                                                width="30"
                                                height="100%"
                                                viewBox="0 0 30 100"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <line x1="25" y1="22" x2="5" y2="52" stroke="white" strokeWidth="5" />
                                                <line x1="25" y1="80" x2="5" y2="50" stroke="white" strokeWidth="5" />
                                            </svg>
                                        </button>
                                        {searchResults.map((movie, index) => (
                                            <li key={index}>
                                                <button 
                                                    className="movie-item" 
                                                    onClick={() => setSelectedMovie(movie)}
                                                    style={{
                                                        backgroundImage: `url(${process.env.REACT_APP_MEDIA_URL}/${movie.picture})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                    >
                                                    <span>{movie.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                        <button 
                                            className="scroll-button right"
                                            onClick={() => {
                                                const container = document.querySelector('.movies-row');
                                                container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
                                            }}
                                        >
                                            <svg
                                                width="30"
                                                height="100%"
                                                viewBox="0 0 30 100"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <line x1="5" y1="22" x2="25" y2="52" stroke="white" strokeWidth="5" />
                                                <line x1="5" y1="80" x2="25" y2="50" stroke="white" strokeWidth="5" />
                                            </svg>
                                        </button>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <>
                                {featuredMovie && (
                                <div className="featured-video-container">
                                    <video 
                                        key={featuredMovie.video}
                                        autoPlay 
                                        controls
                                        loop
                                        className="featured-video"
                                    >
                                        <source 
                                            src={`${process.env.REACT_APP_MEDIA_URL}/${featuredMovie.video}`} 
                                            type="video/mp4" 
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="featured-video-overlay">
                                        <h2 className="featured-title">{featuredMovie.title}</h2>
                                    </div>
                                </div>
                                )}
                                {/* Render Categories */}
                                {categories.length === 0 ? (
                                    <p>Loading categories...</p>
                                ) : (
                                    categories.map((category, index) => (
                                        <div key={index} className={`category-section ${darkMode ? 'dark-mode' : ''}`}>
                                            <h3 className={`category-title ${darkMode ? 'dark-mode' : ''}`}>{category.name}</h3>
                                            <div className="movies-row-container">
                                                <ul className="movies-row">
                                                    <button 
                                                        className="scroll-button left"
                                                        onClick={() => {
                                                            const container = document.querySelector('.movies-row');
                                                            container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <svg
                                                            width="30"
                                                            height="100%"
                                                            viewBox="0 0 30 100"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <line x1="25" y1="22" x2="5" y2="52" stroke="white" strokeWidth="5" />
                                                            <line x1="25" y1="80" x2="5" y2="50" stroke="white" strokeWidth="5" />
                                                        </svg>
                                                    </button>
                                                {category.movies.map((movie, idx) => (
                                                    <li key={`${index}-${idx}`}>
                                                        <button 
                                                            className="movie-item" 
                                                            onClick={() => setSelectedMovie(movie)}
                                                            style={{
                                                                backgroundImage: `url(${process.env.REACT_APP_MEDIA_URL}/${movie.picture})`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center'
                                                            }}>
                                                            <span>{movie.title}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                                    <button 
                                                        className="scroll-button right"
                                                        onClick={() => {
                                                            const container = document.querySelector('.movies-row');
                                                            container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <svg
                                                            width="30"
                                                            height="100%"
                                                            viewBox="0 0 30 100"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <line x1="5" y1="22" x2="25" y2="52" stroke="white" strokeWidth="5" />
                                                            <line x1="5" y1="80" x2="25" y2="50" stroke="white" strokeWidth="5" />
                                                        </svg>
                                                    </button>
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Render Watched Movies */}
                                <div className={`watched-section ${darkMode ? 'dark-mode' : ''}`}>
                                    <h2 className={`watched-title ${darkMode ? 'dark-mode' : ''}`}>Recently Watched Movies</h2>
                                    {recentlyWatched.length === 0 ? (
                                        <p>No recently watched movies</p>
                                    ) : (
                                        <ul className={`watched-movies-list ${darkMode ? 'dark-mode' : ''}`}>
                                            {recentlyWatched.map((movie, index) => (
                                                <li key={index}>
                                                    <button 
                                                    className="watched-item" 
                                                    onClick={() => setSelectedMovie(movie)}
                                                    style={{
                                                        backgroundImage: `url(${process.env.REACT_APP_MEDIA_URL}/${movie.picture})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                    >
                                                        <span>{movie.title}</span>
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
                <MoviePopup 
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    />
            </div>
        </div>
    );
}

export default HomeAuth;