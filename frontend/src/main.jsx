import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)))',
            color: 'var(--fallback-bc,oklch(var(--bc)))',
          },
          success: {
            iconTheme: {
              primary: 'var(--fallback-su,oklch(var(--su)))',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--fallback-er,oklch(var(--er)))',
              secondary: 'white',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
