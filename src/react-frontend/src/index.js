import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css';
import HomeUnauth from './home.unauth';
// import HomeAuth from './home.auth';
import Login from './login';
import Signup from './signup';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* <Route path="/browse" element={<HomeAuth />} /> */}
            </Routes>
			<HomeUnauth />
		</BrowserRouter>
	</React.StrictMode>
);