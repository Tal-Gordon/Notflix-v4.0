import './home.unauth.css';
import { Navbar, BUTTON_TYPES } from './components/navbar';

function HomeUnauth() {
    return (
        <div>
            <Navbar 
                leftButtons={[]}
                rightButtons={[
                    BUTTON_TYPES.LIGHTDARK,
                    BUTTON_TYPES.LOGIN,
                    BUTTON_TYPES.SIGNUP
                ]}
            />
            <div className="home-container">
                <h1 className="welcome-message-home-unauth">We've been waiting for you. Are you ready?</h1>
            </div>
        </div>
        ); 
}

export default HomeUnauth;
