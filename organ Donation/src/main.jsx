import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ErrorProvider } from './context/ErrorContext.jsx';
import ToastContainer from './components/notifications/ToastContainer.jsx';
import ErrorToastContainer from './components/common/ErrorToastContainer.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
            {/* Notification toasts — top-right, for realtime organ/match alerts */}
            <ToastContainer />
            {/* Error toasts — bottom-right, for API errors and user feedback */}
            <ErrorToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
);
