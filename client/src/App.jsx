import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

// Contexts & Hooks
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'

import { PaymentProvider } from './context/PaymentContext'

// Components & Pages
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Toast from './components/Toast'
import AIChatPortal from './components/AIChatPortal'
import Messages from './components/Messages' 
import Profile from './components/Profile'
import Settings from './components/Settings'
import MyBids from './components/MyBids'
import Watchlist from './components/Watchlist'

// Pages
import AuctionPage from './pages/AuctionPage'
import SearchResults from './pages/SearchResults'

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard'
import ManageUsers from './components/admin/ManageUsers'
import ManageAuctions from './components/admin/ManageAuctions'
import OtherAuctionsManager from './components/admin/OtherAuctionsManager'
import Billing from './components/admin/Billing'
import Payments from './components/admin/Payments'

/**
 * Layout Wrapper: Centralizes the Sidebar and Main structure.
 */
const AppLayout = ({ children, user, logout, showToast }) => (
  <div
    className='layout-wrapper'
    style={{ display: 'flex', minHeight: '100vh' }}
  >
    <Sidebar showToast={showToast} user={user} logout={logout} />
    <main style={{ flex: 1, padding: '20px' }}>{children}</main>
  </div>
)

function App () {
  const { user, logout, loading } = useAuth()
  const [toast, setToast] = useState({ message: '', visible: false })
  const [showAssist, setShowAssist] = useState(false)
  const location = useLocation()

  const showToast = useCallback(msg => {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 2800)
  }, [])

  // Global Event Listener: Toggle Assist
  useEffect(() => {
    const handler = () => setShowAssist(s => !s)
    window.addEventListener('toggle-assist', handler)
    return () => window.removeEventListener('toggle-assist', handler)
  }, [])

  // Handle Query Params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const checkout = params.get('checkout')
    if (checkout === 'success') {
      showToast('✅ Payment successful')
      window.history.replaceState({}, document.title, location.pathname)
      setTimeout(() => window.location.reload(), 1000)
    } else if (checkout === 'cancel') {
      showToast('❌ Payment canceled')
      window.history.replaceState({}, document.title, location.pathname)
    }
  }, [location.search, showToast])

  if (loading) return <div className='loading'>Initializing...</div>

  return (
    <div className='app-container'>
      <PaymentProvider>
        <div className='global-accent-bar'></div>
        {user && <Topbar user={user} />}

        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected Routes */}
          <Route
            path='/'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <AuctionPage showToast={showToast} />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/my-bids'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <MyBids />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/watchlist'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <Watchlist />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/messages'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <Messages />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <Profile />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <Settings />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path='/search'
            element={
              <PrivateRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <SearchResults />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path='/admin/*'
            element={
              <AdminRoute>
                <AppLayout user={user} logout={logout} showToast={showToast}>
                  <Routes>
                    <Route path='' element={<AdminDashboard />} />
                    <Route path='users' element={<ManageUsers />} />
                    <Route path='auctions' element={<ManageAuctions />} />
                    <Route
                      path='other-auctions'
                      element={<OtherAuctionsManager />}
                    />
                    <Route path='billing' element={<Billing />} />
                    <Route path='payments' element={<Payments />} />
                  </Routes>
                </AppLayout>
              </AdminRoute>
            }
          />
        </Routes>

        <Toast message={toast.message} visible={toast.visible} />
        <AIChatPortal open={showAssist} onClose={() => setShowAssist(false)} />
      </PaymentProvider>
    </div>
  )
}

export default App
