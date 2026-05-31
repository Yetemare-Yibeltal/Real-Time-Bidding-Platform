import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className='w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full'
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='ml-4 text-white/50 tracking-widest uppercase text-sm'
        >
          Authenticating...
        </motion.p>
      </div>
    )
  }

  return user ? children : <Navigate to='/login' />
}

export default PrivateRoute
