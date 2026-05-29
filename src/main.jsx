import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NewMessageProvider } from './context/NewMessageContext';
import App from './App';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NewMessageProvider>
          <App />
        </NewMessageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
