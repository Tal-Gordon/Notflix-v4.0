import React, { useState, useRef, useEffect } from 'react';
import './search.css';

const SearchBar = ({ onSearch, userId }) => {
    const [query, setQuery] = useState('');
    const [isActive, setIsActive] = useState(false);
    const timeoutRef = useRef(null);
    const inputRef = useRef(null);
    // Focus the input when it becomes visible
    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);
    // Cleanup timeout on component unmount
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
                className="search-button"
                onClick={() => setIsActive(!isActive)}
            >
                🔍
            </button>
            {isActive && (
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search movies..."
                    value={query}
                    onChange={handleInputChange}
                    onBlur={() => !query && setIsActive(false)}
                />
            )}
        </div>
    );
};
export default SearchBar;