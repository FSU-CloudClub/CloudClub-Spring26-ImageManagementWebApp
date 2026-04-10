import React, { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import AWSNavbar from './components/navbar';
import HoverSidebar from './components/HoverSidebar';
import GlobalToast from './components/GlobalToast';

import WelcomeScreen from './screens/WelcomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import UploadScreen from './screens/UploadScreen';

import { NotificationProvider } from './components/NotificationContext';
import { loginComponents, loginFormFields, loginTheme, LoginStyles } from './screens/LoginPage';
import DemoLoginPage from './screens/DemoLoginPage';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const AuthenticatedApp = ({ signOut, user }) => (
  <div style={{ width: '100vw', minHeight: '100vh', background: '#f0f4f8' }}>
    <NotificationProvider>
      <GlobalToast />
      <BrowserRouter>
        <div style={{ display: 'flex' }}>
          <HoverSidebar signOut={signOut} />
          <div style={{ flexGrow: 1, marginLeft: '70px' }}>
            <AWSNavbar user={user} signOut={signOut} />
            <div className="container mt-5">
              <Routes>
                <Route path="/"        element={<WelcomeScreen user={user} signOut={signOut} />} />
                <Route path="/gallery" element={<GalleryScreen user={user} signOut={signOut} />} />
                <Route path="/upload"  element={<UploadScreen  user={user} signOut={signOut} />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </NotificationProvider>
  </div>
);

export default function App() {
  const [demoLoggedIn, setDemoLoggedIn] = useState(false);

  // ── Demo mode ─────────────────────────────────────────────────────────────
  if (IS_DEMO) {
    if (!demoLoggedIn) {
      return <DemoLoginPage onLogin={() => setDemoLoggedIn(true)} />;
    }
    return (
      <AuthenticatedApp
        signOut={() => setDemoLoggedIn(false)}
        user={{ username: 'demo-user' }}
      />
    );
  }

  // ── Real Cognito auth ─────────────────────────────────────────────────────
  return (
    <>
      <LoginStyles />
      <div className="sg-login-wrapper" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4f8',
      }}>
        <Authenticator
          theme={loginTheme}
          components={loginComponents}
          formFields={loginFormFields}
        >
          {({ signOut, user }) => (
            <AuthenticatedApp signOut={signOut} user={user} />
          )}
        </Authenticator>
      </div>
    </>
  );
}