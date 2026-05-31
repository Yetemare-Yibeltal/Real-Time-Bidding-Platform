import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute ({ children }) {
  const { user, loading } = useAuth()

  if (loading)
    return (
      <div className='flex h-screen w-full items-center justify-center bg-transparent'>
        {/* 3D Glassmorphism Loading Spinner */}
        <div className='glass-3d-card p-8 animate-pulse border border-white/20 rounded-2xl'>
          <div className='text-white text-xl font-bold tracking-widest uppercase'>
            Initializing Secure Access...
          </div>
        </div>
      </div>
    )

  if (!user) return <Navigate to='/login' />

  if (user.role !== 'admin') {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='glass-3d-card p-12 text-center border-red-500/30'>
          <h2 className='text-3xl font-bold text-red-400 mb-4'>
            Access Denied
          </h2>
          <p className='text-white/70'>Requires Administrative clearance.</p>
          <button
            onClick={() => (window.location.href = '/')}
            className='mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all'
          >
            Return to Safety
          </button>
        </div>
      </div>
    )
  }

  return children
}
