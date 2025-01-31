import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, BUTTON_TYPES } from './components/navbar';
import './videoPlayer.css';

const VideoPlayer = () => {
    const { id } = useParams();
    const videoRef = useRef(null);
    const [movie, setMovie] = useState('');
    const [duration, setDuration] = useState('00:00');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = sessionStorage.getItem('token');

    const sampleVideo = '/videos/sample.mp4';

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const totalSeconds = videoRef.current.duration;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);
            setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    };

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                // Validate MongoDB ID format
                if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                    throw new Error(`Invalid movie ID format: ${id}`);
                }

                const response = await fetch(`/movies/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (!response.ok) throw new Error('Movie not found');
                
                const movieData = await response.json();
                setMovie(movieData);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.log(err.message)
                setMovie(null);
            }
            setLoading(false);
        };

        fetchMovie();
    }, [id, token]);

    if (loading) {
        return <div className="video-loading">Loading...</div>;
    }

    return (
        <div>
            <Navbar 
                leftButtons={[
                    BUTTON_TYPES.HOME
                ]}
                rightButtons={[
                    BUTTON_TYPES.LIGHTDARK,
                    BUTTON_TYPES.LOGOUT
                ]}
            />
            <div className="video-player-container">

                {error ? (
                    <div className="error-container">
                        <div className="error-message">
                            <h2>⚠️ Error Loading Movie</h2>
                            <p>{error}</p>
                            <p>Please check the movie ID and try again.</p>
                        </div>
                    </div>
                ) : (
                    movie && (
                        <>
                            <div className="video-wrapper">
                                <video 
                                    ref={videoRef}
                                    controls 
                                    className="browser-video-player"
                                    onLoadedMetadata={handleLoadedMetadata}
                                >
                                    <source src={`http://localhost:3001/${movie.video}` || sampleVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            <div className="video-info">
                                <h1>{movie.title}</h1>
                                {movie.description && <p>{movie.description}</p>}
                                <div className="metadata-vp">
                                    <span>Duration: {duration}</span>
                                    <span>Movie ID: {id}</span>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;