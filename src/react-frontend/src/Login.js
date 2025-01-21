import './login.css';
import { useState } from 'react';

function Login() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleLogin = async () => {
        const authRequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        };
        try {
            const authResponse = await fetch('/tokens', authRequestOptions);
            if (authResponse.ok) {
            // User is authenticated
                setIsAuthenticated(true);
            } else {
            // User is not authenticated
                setIsAuthenticated(false);
                const errorText = await authResponse.text(); // Get error message from server
                const errorObject = JSON.parse(errorText);
                const serverErrorMessage = errorObject.message || errorObject.error || errorObject.description || errorMessage; 
                setErrorMessage(serverErrorMessage);
            }
        } catch(error) {
            setIsAuthenticated(false);
            setErrorMessage(error || 'An error occurred during login.');
        };
    };

    return (
        <div className="auth-container">
        {isAuthenticated ? (
            <h1 className="welcome-message">Welcome, User!</h1>
        ) : (
            <div className="login-form">
            <h1 className="login-title">Welcome back. <br/>You have been missed.</h1>
            <input
                type="text"
                className="login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button className="login-button" onClick={handleLogin}>
                Login
            </button>
            {/* TODO: need an account? */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
        )}
        </div>
    );  
}

export default Login;
