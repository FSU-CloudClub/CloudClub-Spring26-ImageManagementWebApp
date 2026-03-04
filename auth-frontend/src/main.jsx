// KEEP THESE - They are the "engine" of your React app
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// KEEP THESE - They allow your app to talk to AWS
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// FIX THESE - Use your Uppercase .env names and the "Phone: False" bypass
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      region: import.meta.env.VITE_AWS_REGION,
      loginWith: { 
        email: true,
        phone: false 
      },
    },
  },
});

// KEEP THIS - This is what actually puts the app on the screen
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)