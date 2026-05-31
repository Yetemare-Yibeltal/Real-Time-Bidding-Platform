import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EnhancedCard } from './EnhancedCard'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [notifications, setNotifications] = useState(
    localStorage.getItem('notifications') !== 'false'
  )

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleNotifications = () => {
    const newVal = !notifications
    setNotifications(newVal)
    localStorage.setItem('notifications', newVal)
  }

  return (
    <div className='max-w-xl mx-auto py-10'>
      <h2 className='text-4xl font-bold text-white mb-8 tracking-tight'>
        System Preferences
      </h2>

      <Magnetic3DContainer>
        <EnhancedCard className='space-y-8'>
          {/* Theme Control */}
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-white font-bold'>Display Theme</h3>
              <p className='text-xs text-white/40'>
                Choose your preferred visual mode
              </p>
            </div>
            <div className='flex bg-white/5 rounded-xl p-1'>
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === t ? 'bg-blue-600 text-white' : 'text-white/40'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <hr className='border-white/5' />

          {/* Notification Control */}
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-white font-bold'>Email Notifications</h3>
              <p className='text-xs text-white/40'>
                Receive updates regarding your bids
              </p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-blue-600' : 'bg-white/10'
              }`}
            >
              <motion.div
                animate={{ x: notifications ? 24 : 0 }}
                className='w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5'
              />
            </button>
          </div>
        </EnhancedCard>
      </Magnetic3DContainer>
    </div>
  )
}

export default Settings
