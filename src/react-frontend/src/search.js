import React, { useState, useRef, useEffect } from 'react';
import './search.css';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const storedDarkMode = sessionStorage.getItem("darkMode");
        return storedDarkMode === "true";
    });
    const timeoutRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleDarkModeChange = (event) => {
            setDarkMode(event.detail);            
        };

        window.addEventListener('darkModeChange', handleDarkModeChange);
        return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
    }, [darkMode]);

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            onSearch(newQuery);
        }, 500);
    };

    return (
        <div className={`search-container ${isActive ? 'active' : ''}`}>
            <button
                className={`search-button ${darkMode ? 'dark-mode' : ''}`}
                onClick={() => {
                    if (isActive) setQuery('');
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                    timeoutRef.current = setTimeout(() => {
                        onSearch('');
                    }, 500);
                    setIsActive(!isActive);
                }}
            >
                🔍
            </button>
            <input
                ref={inputRef}
                type="text"
                className={`search-input ${darkMode ? 'dark-mode' : ''}`}
                placeholder="Search movies..."
                value={query}
                onChange={handleInputChange}
                onBlur={() => !query && setIsActive(false)}
                style={isActive ? {padding: '0.75rem 1.25rem'} : {}}
            />
        </div>
    );
};

export default SearchBar;