import './signup.css';
import { useState } from 'react';

function Signup() {
    const [isAccountCreated, setIsAccountCreated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [picture, setPicture] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignup = async () => {
    const postUser = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    };
    // Conditionally add optional fields
    if (name) {
        requestBody.name = name;
    }
    if (surname) {
        requestBody.surname = surname;
    }
    if (picture) {
        requestBody.picture = picture;
    }

    // Update the body with the conditionally built object
    postUser.body = JSON.stringify(requestBody);
    try {
        const authResponse = await fetch('/tokens', postUser);
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
        setErrorMessage(error.message || 'An error occurred during login.'); // TODO: proper error managing
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
        />
        <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleSignup}>
            Login
        </button>
          {/* TODO: need an account? */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    )}
    </div>
    );  
}

export default Signup;
