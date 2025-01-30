import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth, useLogout } from '../index';
import './navbar.css'

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

    const injectLeftRef = useRef(null);
    const injectRightRef = useRef(null);

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
            label: 'Account',
            action: () => navigate('/account'),
        },
        [BUTTON_TYPES.LIGHTDARK]: {
            label: isDarkMode ? '🌙' : '🌞',
            action: () => setIsDarkMode(!isDarkMode)
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
                    >
                        {btn.label}
                    </button>
                ))}
                {injectLeft && <div ref={injectLeftRef}>{injectLeft}</div>}
            </div>
            <div className="buttonGroup">
                {injectRight && <div ref={injectRightRef}>{injectRight}</div>}
                {resolvedRight.map((btn) => (
                    <button
                        key={btn.key}
                        onClick={btn.action}
                        className="navButton"
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