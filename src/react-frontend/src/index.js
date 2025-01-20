import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import HomeUnauth from './home.unauth';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<HomeUnauth />
	</React.StrictMode>
);