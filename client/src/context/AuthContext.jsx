import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Syncs user state with server
  const fetchUserSession = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchUserSession()
    else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // ... (Keep updateProfile and uploadAvatar logic)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        isAdmin: () => user?.role === 'admin' // Added helper for admin checks
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
