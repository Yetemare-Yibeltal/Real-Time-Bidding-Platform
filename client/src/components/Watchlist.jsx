import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // ADDED: Missing Register Function
  const register = async userData => {
    const res = await api.post('/auth/register', userData)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }

  // ADDED: Missing Update Profile Function
  const updateProfile = async data => {
    const res = await api.put('/users/profile', data)
    setUser(res.data)
    return res.data
  }

  // ADDED: Missing Upload Avatar Function
  const uploadAvatar = async formData => {
    const res = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

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
        isAdmin: () => user?.role === 'admin'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
