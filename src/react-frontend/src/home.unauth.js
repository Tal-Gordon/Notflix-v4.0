import './home.unauth.css';
<<<<<<< HEAD
import { Link } from 'react-router-dom';

function HomeUnauth() {
    return (
        <>
=======

import { Link } from "react-router";

function HomeUnauth() {
    return (
        <body>
>>>>>>> origin/NK-115-User-pages
            <nav className="navbar">
                <ul className="nav-list">
                    <li className="nav-item">
                        <a className="nav-link" href="/">Home</a>
                    </li>
                </ul>
                <div>
                    <Link to="/login">
                        <button className="login-button-navbar">Login</button>
                    </Link>
                    <Link to="/signup">
                        <button className="login-button-navbar">Sign Up</button>
                    </Link>
                </div>
            </nav>
            <div className="home-container">
                <h1 className="welcome-message-home">We've been waiting for you. Are you ready?</h1>
            </div>
<<<<<<< HEAD
        </>
    );
=======
        </body>
        ); 
>>>>>>> origin/NK-115-User-pages
}

export default HomeUnauth;
