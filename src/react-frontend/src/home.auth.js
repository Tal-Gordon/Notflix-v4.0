import './home.auth.css';
import { BrowserRouter, Routes, Route, Link } from "react-router";

// Placeholder for components like Profile, Browse, etc.
function PlaceholderComponent({ text }) {
    return <div className="placeholder">{text}</div>;
}

function HomeAuth() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Placeholder for actual authenticated routes */}
                <Route path="/profile" element={<PlaceholderComponent text="Profile Page Placeholder" />} />
                <Route path="/browse" element={<PlaceholderComponent text="Browse Page Placeholder" />} />
            </Routes>
            <body>
                <nav className="navbar">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link className="nav-link" to="/browse">Browse</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/profile">Profile</Link>
                        </li>
                    </ul>
                    <div>
                        {/* Placeholder for user menu or logout functionality */}
                        <button className="logout-button-navbar">Logout</button>
                    </div>
                </nav>
                <div className="home-container">
                    <h1 className="welcome-message-home">Welcome Back! What will you watch today?</h1>
                    {/* Placeholder for authenticated user content, such as movie recommendations */}
                    <div className="recommendations-placeholder">
                        <h2>Your Recommendations</h2>
                        {/* Replace with a component to display movies/shows */}
                        <PlaceholderComponent text="Movie/Show Recommendations Placeholder" />
                    </div>
                </div>
            </body>
        </BrowserRouter>
    );
}

export default HomeAuth;
