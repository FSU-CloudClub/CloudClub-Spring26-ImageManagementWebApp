import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import './index.css';

export default function App() {
  return (
    // The Authenticator component handles login/signup automatically
    <Authenticator>
      {({ signOut, user }) => (
        // This div is rendered after the user successfully logs in
        <div className="login-container">
          {/* Display logged-in user's username */}
          <h1>Welcome, {user.username}!</h1>
          
          {/* Sign out button */}
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </Authenticator>
  );
}