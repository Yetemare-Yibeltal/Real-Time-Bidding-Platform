import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

// Contexts
import { useAuth } from './context/AuthContext'
import { useUserData } from './context/UserDataContext'
import { PaymentProvider } from './context/PaymentContext'

// Hooks & Utils
import { useAuctionSimulator } from './hooks/useAuctionSimulator'
import { formatUSD } from './utils/helpers'
import api from './api/axios'

// Layout & UI Components
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import AIChatPortal from './components/AIChatPortal'

// Page Components
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AuctionPage from './pages/AuctionPage'
import MyBids from './components/MyBids'
import Watchlist from './components/Watchlist'
import Messages from './components/Messages'
import Profile from './components/Profile'
import Settings from './components/Settings'
import SearchResults from './pages/SearchResults'

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard'
import ManageUsers from './components/admin/ManageUsers'
import ManageAuctions from './components/admin/ManageAuctions'
import OtherAuctionsManager from './components/admin/OtherAuctionsManager'
import Billing from './components/admin/Billing'
import Payments from './components/admin/Payments'

function App () {
  const { user, logout, loading } = useAuth()
  const [toast, setToast] = useState({ message: '', visible: false })
  const [showAssist, setShowAssist] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const showToast = useCallback(msg => {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 2800)
  }, [])

  // Global Event Listeners
  useEffect(() => {
    const handleAssist = () => setShowAssist(s => !s)
    const handleSearch = e =>
      navigate(`/search?q=${encodeURIComponent(e?.detail?.query || '')}`)

    window.addEventListener('toggle-assist', handleAssist)
    window.addEventListener('topbar-search', handleSearch)

    return () => {
      window.removeEventListener('toggle-assist', handleAssist)
      window.removeEventListener('topbar-search', handleSearch)
    }
  }, [navigate])

  if (loading) return <div className='loading'>Initializing System...</div>

  return (
    <div className='app-container'>
      <PaymentProvider>
        {/* Only show global UI if authenticated */}
        {user && <Topbar user={user} />}

        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected Main Routes */}
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <AuctionPage showToast={showToast} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/my-bids'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <MyBids />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/watchlist'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <Watchlist />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/messages'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <Messages />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path='/search'
            element={
              <PrivateRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
                  <SearchResults />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path='/admin/*'
            element={
              <AdminRoute>
                <Layout user={user} logout={logout} showToast={showToast}>
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
                </Layout>
              </AdminRoute>
            }
          />
        </Routes>

        {showAssist && <AIChatPortal onClose={() => setShowAssist(false)} />}
        <Toast message={toast.message} visible={toast.visible} />
      </PaymentProvider>
    </div>
  )
}

// Layout wrapper keeps the Sidebar and Main Content structure uniform
const Layout = ({ children, user, logout, showToast }) => (
  <div className='layout-wrapper' style={{ display: 'flex', width: '100%' }}>
    <Sidebar user={user} logout={logout} showToast={showToast} />
    <main className='main-content' style={{ flex: 1 }}>
      {children}
    </main>
  </div>
)

export default App
