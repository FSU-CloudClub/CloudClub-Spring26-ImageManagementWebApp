import React, { useState } from 'react';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 28, height: 28, fill: 'white' }}>
    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const demoStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .sg-demo-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f0f4f8;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 2rem 1rem;
  }
  .sg-demo-branding {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .sg-demo-brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 0.4rem;
  }
  .sg-demo-cloud {
    width: 48px; height: 48px;
    background: #4f46e5;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(79,70,229,0.4);
  }
  .sg-demo-title {
    font-size: 36px;
    font-weight: 800;
    color: #1e1b4b;
    letter-spacing: -0.5px;
    margin: 0;
  }
  .sg-demo-subtitle {
    font-size: 15px;
    color: #6b7280;
    font-weight: 500;
    margin: 0;
  }
  .sg-demo-card {
    background: linear-gradient(180deg, #3b52e4 0%, #1e50d8 100%);
    border-radius: 24px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 40px rgba(79,70,229,0.3);
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .sg-demo-card-header {
    padding: 2rem 2rem 1.5rem;
    text-align: center;
  }
  .sg-demo-badge {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    letter-spacing: 0.06em;
    margin-top: 0.5rem;
  }
  .sg-demo-tabs {
    display: flex;
    background: rgba(0,0,0,0.15);
    padding: 6px;
    gap: 4px;
  }
  .sg-demo-tab {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    color: rgba(255,255,255,0.55);
  }
  .sg-demo-tab.active {
    background: #ffffff;
    color: #3730a3;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .sg-demo-tab:hover:not(.active) {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.85);
  }
  .sg-demo-form {
    padding: 1.5rem 2rem;
  }
  .sg-demo-label {
    display: block;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    letter-spacing: 0.02em;
    margin-bottom: 4px;
  }
  .sg-demo-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 12px;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    margin-bottom: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.15s;
  }
  .sg-demo-input::placeholder {
    color: rgba(255,255,255,0.4);
  }
  .sg-demo-input:focus {
    border-color: rgba(255,255,255,0.6);
    box-shadow: 0 0 0 2px rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.18);
  }
  .sg-demo-btn {
    width: 100%;
    padding: 11px;
    background: rgba(255,255,255,0.22);
    color: #ffffff;
    border: 1.5px solid rgba(255,255,255,0.5);
    border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.25rem;
  }
  .sg-demo-btn:hover {
    background: rgba(255,255,255,0.32);
    border-color: rgba(255,255,255,0.7);
  }
  .sg-demo-footer {
    padding: 0.75rem 2rem 1.5rem;
    text-align: center;
  }
  .sg-demo-footer p {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    margin: 0;
  }
  .sg-demo-toast {
    display: none;
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #1e1b4b;
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    padding: 12px 18px;
    border-radius: 10px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .sg-demo-toast.visible {
    display: block;
  }
`;

export default function DemoLoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSignIn = () => {
    if (email.length > 0 || password.length > 0) {
      onLogin();
    }
  };

  const handleCreateAccountClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSignIn();
  };

  return (
    <>
      <style>{demoStyles}</style>
      <div className="sg-demo-page">

        {/* Branding above card */}
        <div className="sg-demo-branding">
          <div className="sg-demo-brand-row">
            <div className="sg-demo-cloud">
              <CloudIcon />
            </div>
            <span className="sg-demo-title">SmartGallery</span>
          </div>
          <p className="sg-demo-subtitle">Welcome to FSU's AWS Cloud Club Project Demo</p>
        </div>

        {/* Card */}
        <div className="sg-demo-card">

          {/* Tabs */}
          <div className="sg-demo-tabs">
            <button
              className={`sg-demo-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`sg-demo-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={handleCreateAccountClick}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <div className="sg-demo-form">
            <label className="sg-demo-label">Email</label>
            <input
              className="sg-demo-input"
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <label className="sg-demo-label">Password</label>
            <input
              className="sg-demo-input"
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="sg-demo-btn" onClick={handleSignIn}>
              Sign in
            </button>
          </div>

          {/* Footer */}
          <div className="sg-demo-footer">
            <p>&copy; {new Date().getFullYear()} FSU AWS Cloud Club</p>
          </div>
        </div>

        {/* Toast */}
        <div className={`sg-demo-toast ${showToast ? 'visible' : ''}`}>
          Account creation is disabled in demo mode
        </div>
      </div>
    </>
  );
}