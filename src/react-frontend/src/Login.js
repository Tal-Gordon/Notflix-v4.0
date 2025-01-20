import './login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const authRequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password }),
        };

        try {
            const authResponse = await fetch('/tokens', authRequestOptions);
            if (authResponse.ok) {
                // Mark user as authenticated and navigate to the authenticated home
                navigate('/browse');
            } else {
                const errorText = await authResponse.text();
                const errorObject = JSON.parse(errorText);
                const serverErrorMessage =
                    errorObject.message || errorObject.error || errorObject.description || 'Login failed.';
                setErrorMessage(serverErrorMessage);
            }
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred during login.');
        }
    };

    return (
        <div className="auth-container">
            <div className="login-form">
                <h1 className="login-title">Welcome back. <br />You have been missed.</h1>
                <input
                    type="text"
                    className="login-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="login-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="login-button" onClick={handleLogin}>
                    Login
                </button>
                {/* TODO: Add "Need an account?" sign-up link */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
        </div>
    );
}

export default Login;
