import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Standard styles
import '@aws-amplify/ui-react/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// Components
import AWSNavbar from './components/navbar';
import HoverSidebar from './components/HoverSidebar';
import GlobalToast from './components/GlobalToast';
// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import UploadScreen from './screens/UploadScreen';
// Notification context — wraps the whole app so any screen can fire a toast
import { NotificationProvider } from './components/NotificationContext';

export default function App() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                /*
                 * NotificationProvider wraps everything inside the auth gate
                 * so toasts work on any authenticated screen.
                 * GlobalToast renders the actual toast overlay — only needed once.
                 */
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
            )}
        </Authenticator>
    );
}