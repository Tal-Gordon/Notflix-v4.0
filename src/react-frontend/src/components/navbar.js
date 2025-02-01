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
    LIGHTDARK: 'LIGHTDARK'
};

const Navbar = ({ leftButtons = [], rightButtons = [], injectLeft, injectRight }) => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const logout = useLogout();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [picture, setPicture] = useState(null);

    const injectLeftRef = useRef(null);
    const injectRightRef = useRef(null);

    
    useEffect(() => {
        const parseToken = () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setPicture(payload.picture || null);
                } catch (error) {
                    console.error('Error parsing token:', error);
                    setPicture(null);
                }
            } else {
                setPicture(null);
            }
        };
        parseToken();
    }, [isLoggedIn]);

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
                    backgroundImage: picture ? `url(http://localhost:3001/${picture})` : 'none',
                    backgroundColor: '#cccccc',
                }} />
            ),
            action: () => {},
        },
        [BUTTON_TYPES.LIGHTDARK]: {
            label: isDarkMode ? '🌙' : '🌞',
            action: () => {
                const newDarkMode = !isDarkMode;
                setIsDarkMode(newDarkMode);
                sessionStorage.setItem("darkMode", newDarkMode.toString());
                window.dispatchEvent(new CustomEvent('darkModeChange', { detail: newDarkMode }));
            }
        }
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