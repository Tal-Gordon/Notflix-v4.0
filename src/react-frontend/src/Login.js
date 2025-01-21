import './login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function Login() {
    let navigate = useNavigate();
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
                navigate("/browse");
            } else {
            // User is not authenticated
                const errorText = await authResponse.text(); // Get error message from server
                const errorObject = JSON.parse(errorText);
                const serverErrorMessage = errorObject.message || errorObject.error || errorObject.description || errorMessage; 
                setErrorMessage(serverErrorMessage);
            }
        } catch(error) {
            setErrorMessage(error || 'An error occurred during login.');
        };
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="auth-container">
            <div className="login-form">
                <h1 className="login-title">Welcome back. <br/>You have been missed.</h1>
                <input
                    type="text"
                    className="login-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                />
                <input
                    type="password"
                    className="login-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                />
                <button className="login-button" onClick={handleLogin}>
                    Login
                </button>
                {/* TODO: need an account? */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
        </div>
    );  
}

export default Login;
