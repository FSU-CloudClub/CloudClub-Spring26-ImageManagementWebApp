import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; // Standard Amplify UI styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Standard Bootstrap styles

// These imports are REQUIRED so the app knows where to find the custom components
import AWSNavbar from './components/navbar';
import HoverSidebar from './components/HoverSidebar';

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="login-container">
          {/* Custom components provided by the Navbar and Sidebar devs */}
          <AWSNavbar />
          <HoverSidebar />
          
          <div className="container mt-4">
            <h1>Welcome, {user.username}!</h1>
            <button className="btn btn-danger" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      )}
    </Authenticator>
  );
}
