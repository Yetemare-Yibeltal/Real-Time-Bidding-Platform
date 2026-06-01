import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserDataProvider } from './context/UserDataContext'
import App from './App'
import './index.css'

/**
 * Global App Provider Wrapper
 * Cleans up the main entry point and improves readability.
 */
const AppProviders = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <UserDataProvider>{children}</UserDataProvider>
    </AuthProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
)
