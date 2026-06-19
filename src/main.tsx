import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';

// TODO: Replace with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "719607086494-ce2jtmghufn3jrkebkuuro23gh204p7q.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
