import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Magnetic3DContainer>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='w-[400px] p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl'
        >
          <h2 className='text-3xl font-bold text-white mb-8 text-center tracking-tight'>
            Welcome <span className='gradient-text'>Back</span>
          </h2>

          {error && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className='bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm border border-red-500/20'
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <input
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors'
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors'
            />
            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]'
            >
              SIGN IN
            </button>
          </form>

          <p className='mt-8 text-center text-white/40 text-sm'>
            Don't have an account?{' '}
            <Link
              to='/register'
              className='text-blue-400 hover:text-blue-300 font-semibold transition-colors'
            >
              Register
            </Link>
          </p>
        </motion.div>
      </Magnetic3DContainer>
    </div>
  )
}

export default Login
