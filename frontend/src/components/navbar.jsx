import React, { useState, useRef, useEffect } from 'react';
import '../styles/navbar.css';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';


const AWSNavbar = ({ user, signOut }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const email = user?.attributes?.email || user?.signInDetails?.loginId || '';
    const username = email ? email.split('@')[0] : 'there';

    // Close dropdown if user clicks anywhere outside of it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ padding: '12px 16px 0' }}>
            <div
                style={{
                    background: 'linear-gradient(90deg, #1e2a3a 0%, #2c3e55 100%)',
                    borderRadius: 16,
                    padding: '10px 20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Brand */}
                <div className="d-flex align-items-center gap-2">
                    <i
                        className="bi bi-cloud-fill"
                        style={{ fontSize: 26, color: '#60a5fa' }}
                    />
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            background: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.02em',
                        }}
                    >
                        SmartGallery
                    </span>
                </div>

                {/* User info + dropdown */}
                <div className="d-flex align-items-center gap-3" style={{ position: 'relative' }} ref={dropdownRef}>
                    <span
                        className="d-none d-md-block"
                        style={{ color: '#93c5fd', fontSize: '0.9rem', fontWeight: 500 }}
                    >
                        Hello, <strong style={{ color: '#bfdbfe' }}>{IS_DEMO ? 'Demo Guest' : user?.signInDetails?.loginId?.split('@')[0]}</strong>!
                    </span>

                    {/* Clickable person icon */}
                    <i
                        className="bi bi-person-circle fs-3"
                        style={{ color: '#60a5fa', cursor: 'pointer' }}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                    />

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                background: '#1e2a3a',
                                border: '1px solid #3b4f6b',
                                borderRadius: 10,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                minWidth: 180,
                                zIndex: 1000,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Email label at top of dropdown */}
                            <div
                                style={{
                                    padding: '10px 16px',
                                    borderBottom: '1px solid #3b4f6b',
                                    color: '#93c5fd',
                                    fontSize: '0.8rem',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {email}
                            </div>

                            {/* Sign out button */}
                            <button
                                onClick={() => { setDropdownOpen(false); signOut(); }}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    padding: '10px 16px',
                                    textAlign: 'left',
                                    color: '#f87171',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2c3e55'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <i className="bi bi-box-arrow-right" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AWSNavbar;