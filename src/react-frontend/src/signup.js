import './signup.css';
import { useState } from 'react';
import { useLogin } from './index'
import { Navbar, BUTTON_TYPES } from './components/navbar';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [picture, setPicture] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const login = useLogin();

    const handleSignup = async (event) => {
        event.preventDefault(); 
        if (!validateForm()) {
            return; // Prevent form submission if validation fails
        }

        const formData = new FormData();
        
        formData.append("username", username);
        formData.append("password", password);
        if (name) {
            formData.append("name", name);
        }
        if (surname) {
            formData.append("surname", surname);
        }
        if (picture) {
            formData.append('picture', picture);
        }

        try {
            const postResponse = await fetch('/users', {
                method: 'POST',
                body: formData,
            })
            if (postResponse.ok) {
                // User is created
                const data = await postResponse.json(); 
                login(data.token);
            } else {
                // User is not created
                const errorObject = JSON.parse(await postResponse.text());
                try {
                    let serverErrorMessage = "An unknown error occurred.";
                    if (errorObject && errorObject.errors && errorObject.errors.length > 0) {
                        const firstError = errorObject.errors[0];
                        serverErrorMessage = firstError.details || firstError.error || serverErrorMessage;
                    } else if (errorObject && (errorObject.message || errorObject.error || errorObject.description || errorObject.details)) {
                        serverErrorMessage = errorObject.message || errorObject.error || errorObject.description || errorObject.details || serverErrorMessage;
                    }
                
                    if (serverErrorMessage === "A user with this username already exists.") {
                        setUsernameError(serverErrorMessage);
                    } else {
                        setErrorMessage(serverErrorMessage);
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    console.error("Raw error text:", errorObject)
                    setErrorMessage("An error occurred while processing the server response.");
                }
            }
        } catch(error) {
            setErrorMessage(error.message || 'An error occurred during signup.');
        };
    };

    function validateForm() {
        let isValid = true;
        setUsernameError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setErrorMessage('');
    
        // Check if passwords match
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }

        // Check password length
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            isValid = false;
        } else {
            // Check password complexity
            const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;
            if (!regex.test(password)) {
                setPasswordError('Password must contain lowercase, uppercase, number, and special character');
                isValid = false;
            }
        }
        
        return isValid;
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSignup(event);
        }
    };

    return (
        <div>
            <Navbar 
                leftButtons={[
                    BUTTON_TYPES.HOME
                ]}
                rightButtons={[
                    BUTTON_TYPES.LOGIN
                ]}
            />
            <div className="input-container">
                <div className="signup-form">
                    <h1 className="signup-title">
                        Join our 'exclusive' club<br/>
                        of 12 active users (hi mom!) 🎉
                    </h1>
                    <form onSubmit={handleSignup}>
                        <input
                            type="text"
                            className={`signup-input ${usernameError ? 'error-adjacent' : ''}`}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            required
                        />
                        {usernameError && <div className="error-message">{usernameError}</div>}
                        <input
                            type="password"
                            className={`signup-input ${passwordError ? 'error-adjacent' : ''}`}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            required
                        />
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        <input
                            type="password"
                            className={`signup-input ${confirmPasswordError ? 'error-adjacent' : ''}`}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            required
                        />
                        {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
                        <input
                            type="text"
                            className="signup-input"
                            placeholder="Name (optional)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            className="signup-input"
                            placeholder="Surname (optional)"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                        <input
                            type="file"
                            name="myImage"
                            onChange={(event) => {
                                const file = event.target.files[0];
                                if (file && file.type.startsWith('image/')) {
                                    setPicture(file);
                                } else {
                                    alert("Please upload an image file.");
                                }
                            }}
                        />
                        {picture && (
                            <div>
                                <img
                                    alt="not found"
                                    width={"250px"}
                                    src={URL.createObjectURL(picture)}
                                />
                                <br /><br />
                                <button onClick={() => setPicture(null)}>Remove</button>
                            </div>
                        )}
                        <button className="signup-button" type="submit">
                            Sign Up
                        </button>
                        <h6 className="disclaimer">By clicking, you agree to our non-existent terms of service</h6>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                    </form>
                </div>
            </div>
        </div>
    );  
}

export default Signup;