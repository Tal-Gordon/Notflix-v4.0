import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth, useLogout } from '../index';
import './navbar.css';

const BUTTON_TYPES = {
    HOME: 'HOME',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SIGNUP: 'SIGNUP',
    ACCOUNT: 'ACCOUNT',
    LIGHTDARK: 'LIGHTDARK',
    ADMIN: 'ADMIN'
};

const Navbar = ({ leftButtons = [], rightButtons = [], injectLeft, injectRight }) => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const logout = useLogout();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const storedDarkMode = sessionStorage.getItem("darkMode");
        return storedDarkMode === "true";
    });
    const [picture, setPicture] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    const injectLeftRef = useRef(null);
    const injectRightRef = useRef(null);
    const accountButtonRef = useRef(null);
    
    useEffect(() => {
        const parseToken = () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setPicture(payload.picture || null);
                    setUserId(payload.userId);
                } catch (error) {
                    console.error('Error parsing token:', error);
                    setPicture(null);
                    setUserId(null);
                }
            } else {
                setPicture(null);
                setUserId(null);
            }
        };
        parseToken();
    }, [isLoggedIn]);

    useEffect(() => {
        if (showAccountInfo && accountButtonRef.current) {
            const buttonRect = accountButtonRef.current.getBoundingClientRect();
            const popupWidth = 200; // Match your popup's width
            const viewportWidth = window.innerWidth;
            const scrollY = window.scrollY;
    
            // Calculate horizontal position with boundary check
            let left = buttonRect.left + (buttonRect.width / 2);
            const leftSpace = left - popupWidth/2;
            const rightSpace = viewportWidth - (left + popupWidth/2);
    
            // Adjust for left boundary
            if (leftSpace < 10) { // 10px buffer
                left = popupWidth/2 + 10;
            }
            // Adjust for right boundary
            else if (rightSpace < 10) { // 10px buffer
                left = viewportWidth - popupWidth/2 - 10;
            }
    
            // Calculate vertical position with boundary check
            const popupHeight = 200; // Approximate popup height
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const top = spaceBelow > popupHeight + 10 ? // 10px buffer
                buttonRect.bottom + scrollY + 10 : 
                buttonRect.top + scrollY - popupHeight - 10;
    
            setPopupPosition({
                top,
                left: Math.max(popupWidth/2 + 10, Math.min(left, viewportWidth - popupWidth/2 - 10)),
                positionVertical: spaceBelow > popupHeight + 10 ? 'below' : 'above'
            });
        }
    }, [showAccountInfo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAccountInfo && accountButtonRef.current && 
                !accountButtonRef.current.contains(event.target) && 
                !event.target.closest('.account-popup')) {
                setShowAccountInfo(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAccountInfo]);

    useEffect(() => {
        if (showAccountInfo && userId) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const data = await response.json();
                    setUserData(data);
                    setError(null);
                } catch (err) {
                    setError(err.message);
                    setUserData(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [showAccountInfo, userId]);

    const BUTTON_CONFIG = {
        [BUTTON_TYPES.HOME]: {
            label: 'Home',
            action: () => { isLoggedIn ? navigate('/browse') : navigate('/') }
        },
        [BUTTON_TYPES.LOGIN]: {
            label: 'Login',
            action: () => navigate('/login'),
        },
        [BUTTON_TYPES.LOGOUT]: {
            label: 'Logout',
            action: logout,
        },
        [BUTTON_TYPES.SIGNUP]: {
            label: 'Sign Up',
            action: () => navigate('/signup'),
        },
        [BUTTON_TYPES.ACCOUNT]: {
            label: (
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '100%',
                    backgroundSize: 'cover',
                    backgroundImage: picture ? `url(${process.env.REACT_APP_MEDIA_URL}/${picture})` : 'none',
                    backgroundColor: '#cccccc',
                }} />
            ),
            action: () => setShowAccountInfo(prev => !prev),
        },
        [BUTTON_TYPES.LIGHTDARK]: {
            label: isDarkMode ? '🌙' : '🌞',
            action: () => {
                const newDarkMode = !isDarkMode;
                setIsDarkMode(newDarkMode);
                sessionStorage.setItem("darkMode", newDarkMode.toString());
                window.dispatchEvent(new CustomEvent('darkModeChange', { detail: newDarkMode }));
            }
        },
        [BUTTON_TYPES.ADMIN]: {
            label: 'Admin',
            action: () => navigate('/admin'),
        },
    };

    const resolveButtons = (buttonTypes, side) => {
        return buttonTypes
            .map(type => {
                const config = BUTTON_CONFIG[type];
                if (!config) {
                    console.warn(`Unknown button type: ${type}`);
                    return null;
                }
                return {
                    ...config,
                    type,
                    key: `${side}-${type}-${Math.random()}`
                };
            })
            .filter(Boolean);
    };

    useEffect(() => {
        if (injectLeftRef.current) {
            const el = injectLeftRef.current;
            el.addEventListener('mouseover', () => {
                el.style.backgroundColor = '#e0e0e0';
                el.style.transform = 'translateY(-1px)';
            });
            el.addEventListener('mouseout', () => {
                el.style.backgroundColor = '#f0f0f0';
                el.style.transform = 'translateY(0px)';
            });
        }
        if (injectRightRef.current) {
            const el = injectRightRef.current;
            el.addEventListener('mouseover', () => {
                el.style.borderRadius = "8px";
                el.style.backgroundColor = '#e0e0e0';
                el.style.transform = 'translateY(-1px)';
            });
            el.addEventListener('mouseout', () => {
                el.style.backgroundColor = '#f0f0f0';
                el.style.transform = 'translateY(0px)';
            });
        }
    }, []);

    const resolvedLeft = resolveButtons(leftButtons, 'left');
    const resolvedRight = resolveButtons(rightButtons, 'right');

    return (
        <nav className={`navbar ${isDarkMode ? 'dark' : ''}`}>
            <div className="buttonGroup">
                {resolvedLeft.map((btn) => (
                    <button
                    key={btn.key}
                    ref={btn.type === BUTTON_TYPES.ACCOUNT ? accountButtonRef : null}
                    onClick={btn.action}
                    className="navButton"
                    style={btn.type === BUTTON_TYPES.ACCOUNT ? {
                        padding: 0,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    } : {}}
                >
                        {btn.label}
                    </button>
                ))}
                {injectLeft && <div>{injectLeft}</div>}
            </div>
            <div className="buttonGroup">
                {injectRight && <div>{injectRight}</div>}
                {resolvedRight.map((btn) => (
                    <button
                        key={btn.key}
                        ref={btn.type === BUTTON_TYPES.ACCOUNT ? accountButtonRef : null}
                        onClick={btn.action}
                        className="navButton"
                        style={btn.type === BUTTON_TYPES.ACCOUNT ? {
                            padding: 0,
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        } : {}}
                    >
                        {btn.label}
                    </button>
                ))}
                {showAccountInfo && (
                <div 
                    className="account-popup"
                    style={{
                        top: popupPosition.top,
                        left: popupPosition.left,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div 
                        className="account-popup-arrow" 
                        style={{
                            marginLeft: '60px'
                        }} />
                    <div className="account-popup-content">
                        {loading ? (
                            <div>Loading...</div>
                        ) : error ? (
                            <div>Error: {error}</div>
                        ) : userData ? (
                            <>
                                <img 
                                    src={`${process.env.REACT_APP_MEDIA_URL}/${userData.picture}`} 
                                    alt="Profile"
                                    className="account-popup-image"
                                />
                                <div>Username: {userData.username}</div>
                                {userData.isAdmin ? <div>User type: Admin</div> : <div>User type: User</div>}
                                {userData.name && <div>Name: {userData.name}</div>}
                                {userData.surname && <div>Surname: {userData.surname}</div>}
                            </>
                        ) : null}
                    </div>
                </div>
            )}
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    leftButtons: PropTypes.arrayOf(PropTypes.oneOf(Object.values(BUTTON_TYPES))),
    rightButtons: PropTypes.arrayOf(PropTypes.oneOf(Object.values(BUTTON_TYPES))),
    injectLeft: PropTypes.node,
    injectRight: PropTypes.node
};

export { Navbar, BUTTON_TYPES };