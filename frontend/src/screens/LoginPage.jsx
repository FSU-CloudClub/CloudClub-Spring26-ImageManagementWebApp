import React from 'react';
import { View } from '@aws-amplify/ui-react';

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 28, height: 28, fill: 'white' }}>
    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .sg-login-wrapper [data-amplify-router] {
    background: linear-gradient(180deg, #3b52e4 0%, #1e50d8 100%) !important;
    border: none !important;
    box-shadow: 0 8px 40px rgba(79,70,229,0.3) !important;
    border-radius: 24px !important;
    overflow: hidden !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  .sg-login-wrapper [data-amplify-container] {
    width: 100% !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  /* ── Pill tab toggle ── */
  .sg-login-wrapper .amplify-tabs {
    background: rgba(0,0,0,0.15) !important;
    border-bottom: none !important;
    padding: 6px !important;
    margin: 0 !important;
    border-radius: 0 !important;
    gap: 4px !important;
  }
  .sg-login-wrapper .amplify-tabs__item {
    color: rgba(255,255,255,0.55) !important;
    font-weight: 600 !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 14px !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 8px 0 !important;
    flex: 1 !important;
    text-align: center !important;
    transition: all 0.2s ease !important;
    background: transparent !important;
  }
  .sg-login-wrapper .amplify-tabs__item--active {
    color: #3730a3 !important;
    background: #ffffff !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
  }
  .sg-login-wrapper .amplify-tabs__item:hover:not(.amplify-tabs__item--active) {
    color: rgba(255,255,255,0.85) !important;
    background: rgba(255,255,255,0.1) !important;
  }

  /* ── Labels ── */
  .sg-login-wrapper .amplify-label {
    color: rgba(255,255,255,0.9) !important;
    font-weight: 600 !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 13px !important;
    letter-spacing: 0.02em !important;
  }

  /* ── Inputs ── */
  .sg-login-wrapper .amplify-input {
    background: rgba(255,255,255,0.12) !important;
    border: 1px solid rgba(255,255,255,0.25) !important;
    border-radius: 12px !important;
    color: #ffffff !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 14px !important;
  }
  .sg-login-wrapper .amplify-input::placeholder {
    color: rgba(255,255,255,0.4) !important;
  }
  .sg-login-wrapper .amplify-input:focus {
    border-color: rgba(255,255,255,0.6) !important;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.15) !important;
    background: rgba(255,255,255,0.18) !important;
  }
  .sg-login-wrapper .amplify-field-group__control {
    background: rgba(255,255,255,0.12) !important;
    border: 1px solid rgba(255,255,255,0.25) !important;
    border-radius: 12px !important;
    color: #ffffff !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  .sg-login-wrapper .amplify-field-group__icon {
    color: rgba(255,255,255,0.6) !important;
  }

  /* ── Primary button ── */
  .sg-login-wrapper .amplify-button--primary {
    background: rgba(255,255,255,0.22) !important;
    color: #ffffff !important;
    border: 1.5px solid rgba(255,255,255,0.5) !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 15px !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    letter-spacing: 0.02em !important;
    transition: all 0.2s ease !important;
  }
  .sg-login-wrapper .amplify-button--primary:hover {
    background: rgba(255,255,255,0.32) !important;
    border-color: rgba(255,255,255,0.7) !important;
  }

  /* ── Link button ── */
  .sg-login-wrapper .amplify-button--link {
    color: rgba(255,255,255,0.75) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  .sg-login-wrapper .amplify-button--link:hover {
    color: #ffffff !important;
    background: transparent !important;
    text-decoration: underline !important;
  }

  .sg-login-wrapper .amplify-text {
    color: rgba(255,255,255,0.8) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
`;

export const LoginStyles = () => <style>{injectStyles}</style>;

export const loginComponents = {
  Header() {
    return (
      <div style={{
        padding: '2rem 2rem 1.5rem',
        textAlign: 'center',
        background: 'transparent',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '12px', marginBottom: '0.4rem',
        }}>
          <div style={{
            width: 48, height: 48,
            background: '#4f46e5',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 4px 16px rgba(79,70,229,0.4)'
          }}>
            <CloudIcon />
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '32px', fontWeight: 800,
            color: '#1e1b4b', letterSpacing: '-0.5px',
          }}>
            SmartGallery
          </span>
        </div>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '15px', color: '#6b7280',
          margin: 0, fontWeight: 500,
        }}>
          Welcome to FSU's AWS Cloud Club Project
        </p>
      </div>
    );
  },

  Footer() {
    return (
      <div style={{
        padding: '0.75rem 2rem 1.5rem',
        textAlign: 'center',
        background: 'transparent',
      }}>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          margin: 0,
        }}>
          &copy; {new Date().getFullYear()} FSU AWS Cloud Club
        </p>
      </div>
    );
  },
};

export const loginFormFields = {
  signIn: {
    username: {
      placeholder: 'Enter your Email',
      label: 'Email',
    },
    password: {
      placeholder: 'Enter your Password',
      label: 'Password',
    },
  },
  signUp: {
    username: {
      placeholder: 'Enter your Email',
      label: 'Email',
      order: 1,
    },
    password: {
      placeholder: 'Enter your Password',
      label: 'Password',
      order: 2,
    },
    confirm_password: {
      placeholder: 'Please confirm your Password',
      label: 'Confirm Password',
      order: 3,
    },
  },
};

export const loginTheme = {
  name: 'smartgallery-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10:  { value: '#eef2ff' },
          20:  { value: '#e0e7ff' },
          40:  { value: '#c7d2fe' },
          60:  { value: '#818cf8' },
          80:  { value: '#4f46e5' },
          90:  { value: '#4338ca' },
          100: { value: '#3730a3' },
        },
      },
    },
    fonts: {
      default: {
        variable: { value: "'Plus Jakarta Sans', sans-serif" },
        static:   { value: "'Plus Jakarta Sans', sans-serif" },
      },
    },
  },
};