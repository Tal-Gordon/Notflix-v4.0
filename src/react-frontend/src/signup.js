import './signup.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function Signup() {
    let navigate = useNavigate();
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
    };
    const requestBody = { username, password };

    if (name) {
        requestBody.name = name;
    }
    if (surname) {
        requestBody.surname = surname;
    }
    if (picture) {
        requestBody.picture = picture;
    }

    postUser.body = JSON.stringify(requestBody);
    try {
        const postResponse = await fetch('/users', postUser);
        if (postResponse.ok) {
            // User is created
            navigate("/browse")
        } else {
        // User is not authenticated
            const errorText = await postResponse.text(); // Get error message from server
            const errorObject = JSON.parse(errorText);
            const serverErrorMessage = errorObject.message || errorObject.error || errorObject.description || errorMessage; 
            setErrorMessage(serverErrorMessage);
        }
    } catch(error) {
        setErrorMessage(error.message || 'An error occurred during signup.'); // TODO: proper error managing
    };
};

return (
    <div className="input-container">
        <div className="signup-form">
            <h1 className="signup-title">Welcome to Notflix. The best is about to get better!</h1>
            <input
                type="text"
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="text"
                className="input-field"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                className="input-field"
                placeholder="Surname (optional)"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
            />
            {/* TODO: picture */}
            <button className="signup-button" onClick={handleSignup}>
                Sign Up
            </button>
            {/* TODO: need an account? */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    </div>
    );  
}

export default Signup;
