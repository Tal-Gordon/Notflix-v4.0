import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import HomeAuth from './home.auth';
import HomeUnauth from './home.unauth';
import Login from './login';
import Signup from './signup';
import VideoPlayer from './videoPlayer';

// Create a custom hook for authentication state
const useAuth = () =>
{
	// Use a reactive approach to track authentication
	const [isLoggedIn, setIsLoggedIn] = useState(() =>
		!!sessionStorage.getItem('token')
	);

	const login = useCallback((token) =>
	{
		sessionStorage.setItem('token', token);
		setIsLoggedIn(true);
	}, []);

	const logout = useCallback(() =>
	{
		sessionStorage.removeItem('token');
		setIsLoggedIn(false);
	}, []);

	return { isLoggedIn, login, logout };
};

// Protected Route Component
const ProtectedRoute = ({ children }) =>
{
	const { isLoggedIn } = useAuth();
	return isLoggedIn ? children : <Navigate replace to="/login" />;
};

// Public Route Component (for login/signup when already authenticated)
const PublicRoute = ({ children }) =>
{
	const { isLoggedIn } = useAuth();
	return isLoggedIn ? <Navigate replace to="/browse" /> : children;
};

const App = () =>
{
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<PublicRoute>
						<Login />
					</PublicRoute>
				}
			/>
			<Route
				path="/signup"
				element={
					<PublicRoute>
						<Signup />
					</PublicRoute>
				}
			/>
			<Route
				path="/browse"
				element={
					<ProtectedRoute>
						<HomeAuth />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/watch/:id"
				element={
					<ProtectedRoute>
						<VideoPlayer />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/"
				element={
					<PublicRoute>
						<HomeUnauth />
					</PublicRoute>
				}
			/>
		</Routes>
	);
};

// Login function (to be used in components)
export const useLogin = () =>
{
	const navigate = useNavigate();
	const { login } = useAuth();

	return (token) =>
	{
		login(token);
		navigate('/browse');
	};
};

// Logout function (to be used in components)
export const useLogout = () =>
{
	const navigate = useNavigate();
	const { logout } = useAuth();

	return () =>
	{
		logout();
		navigate('/');
	};
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);

export { useAuth };