import React, { use } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Standard styles
import '@aws-amplify/ui-react/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// These are your existing component files - make sure these paths are correct!
import AWSNavbar from './components/navbar';
import HoverSidebar from './components/HoverSidebar';
import WelcomeScreen from './screens/WelcomeScreen';
import Dashboard from './components/Dashboard';
import GalleryScreen from './screens/GalleryScreen';
import UploadScreen from './screens/UploadScreen';

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        /* The Router is inside the authenticated view. 
          This ensures the Login page shows up FIRST.
        */
        <BrowserRouter>
          <div style={{ display: 'flex' }}>
            
            <HoverSidebar signOut={signOut}/>

            <div style={{ flexGrow: 1, marginLeft: '70px' }}>
              <AWSNavbar user={user} signOut={signOut} />
              
              <div className="container mt-5">
                <Routes>
                  <Route path="/" element={<WelcomeScreen user={user} signOut={signOut} />}/>
                  
                  <Route path="/gallery" element={<GalleryScreen user={user} signOut={signOut}/>}/>

                  <Route path="/upload" element={<UploadScreen user={user} signOut={signOut}/>}/>
                 
                </Routes>
              </div>
            </div>

          </div>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}