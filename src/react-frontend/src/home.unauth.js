import './home.unauth.css';
import { Navbar, BUTTON_TYPES } from './components/navbar';
import { useNavigate } from 'react-router-dom';

function HomeUnauth() {
    const navigate = useNavigate()

    const handleNavigate = () => {
        navigate('/signup');
    }
    return (
        <div>
            <Navbar 
                leftButtons={[]}
                rightButtons={[
                    BUTTON_TYPES.LOGIN,
                ]}
            />
            <div className="home-container">
                <div className="content-wrapper">
                    <h1 className="welcome-message-home-unauth">
                        <span>HemiHemi was taken,<br/>
                        so now we're stuck with Notflix</span>
                    </h1>
                    <h1>😅</h1>
                    <div className="feature-text">
                        <h3>But that's ok! We still got you! Come watch our "exclusive collection" of whatever videos 
                            we found on our hard drives!</h3>
                        <div className="selling-points">
                            <p>🎬 Curated content found in our laundry room</p>
                            <p>🍿 480p glory that'll strain your eyes</p>
                            <p>🛋️ Perfect for when you're bored of real streaming</p>
                        </div>
                    </div>
                    <div className="cta-section">
                        <button className="cta-button" onClick={handleNavigate}>
                            Start Pretending
                        </button>
                        <h6 className="disclaimer">...the styling's cool, right? (please say right)</h6>
                    </div>
                </div>
            </div>
        </div>
        ); 
}

export default HomeUnauth;
