import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { EnhancedCard } from './EnhancedCard'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-6'>
      <Magnetic3DContainer>
        <EnhancedCard className='w-full max-w-sm border-blue-500/20 bg-slate-900/80 backdrop-blur-2xl'>
          <h2 className='text-2xl font-bold text-white mb-6 text-center tracking-tight'>
            Create Account
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-red-500/10 text-red-400 p-3 rounded-xl text-sm mb-4 border border-red-500/20 text-center'
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <input
              type='text'
              placeholder='Full Name'
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-blue-500/50 outline-none'
            />
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-blue-500/50 outline-none'
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-blue-500/50 outline-none'
            />

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20'
            >
              REGISTER
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-white/40'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-blue-400 hover:text-blue-300 font-bold'
            >
              Login
            </Link>
          </p>
        </EnhancedCard>
      </Magnetic3DContainer>
    </div>
  )
}

export default Register
