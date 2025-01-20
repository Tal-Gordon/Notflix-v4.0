import './home.unauth.css';
import Login from './login';
import { BrowserRouter, Routes, Route, Link } from "react-router";

function HomeUnauth() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
            <body>
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
            </body>
        </BrowserRouter>
        ); 
}

export default HomeUnauth;
