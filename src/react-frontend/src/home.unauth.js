import './home.unauth.css';

import { Link } from "react-router";

function HomeUnauth() {
    return (
        <div>
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
        </div>
        ); 
}

export default HomeUnauth;
