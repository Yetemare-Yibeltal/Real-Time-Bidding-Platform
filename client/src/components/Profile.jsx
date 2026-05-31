import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { EnhancedCard } from './EnhancedCard'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const Profile = () => {
  const { user, logout, updateProfile, uploadAvatar } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [preview, setPreview] = useState(user?.avatar || user?.imagePath || '')
  const [file, setFile] = useState(null)

  // ... [Keep your handleSave, handleFileChange, handleUpload logic here] ...

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <h2 className='text-4xl font-bold text-white mb-8 tracking-tight'>
        Your Profile
      </h2>

      <Magnetic3DContainer>
        <EnhancedCard className='space-y-8'>
          {/* Avatar Section */}
          <div className='flex items-center gap-6'>
            <div className='relative group'>
              <img
                src={preview || `https://i.pravatar.cc/150?u=${user?.id}`}
                alt='avatar'
                className='w-24 h-24 rounded-full object-cover border-2 border-white/10'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-white/50 text-xs uppercase tracking-widest mb-2'>
                Update Avatar
              </label>
              <div className='flex gap-2'>
                <input
                  type='file'
                  onChange={handleFileChange}
                  className='text-sm text-white/50'
                />
                <button
                  onClick={handleUpload}
                  className='bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-blue-500'
                >
                  UPLOAD
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <AnimatePresence mode='wait'>
            {editing ? (
              <motion.div
                key='edit'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-4'
              >
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className='w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white'
                />
                <div className='flex gap-4'>
                  <button
                    onClick={handleSave}
                    className='bg-emerald-600 px-6 py-2 rounded-xl font-bold text-white'
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className='text-white/40'
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='view'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-6'
              >
                <div>
                  <p className='text-[10px] text-white/30 uppercase'>
                    Full Name
                  </p>
                  <p className='text-white font-medium'>{user?.name}</p>
                </div>
                <div>
                  <p className='text-[10px] text-white/30 uppercase'>Email</p>
                  <p className='text-white font-medium'>{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className='text-red-400 text-sm font-semibold hover:text-red-300'
                >
                  LOGOUT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </EnhancedCard>
      </Magnetic3DContainer>
    </div>
  )
}

export default Profile
