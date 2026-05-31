import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../socket/socket'
import { EnhancedCard } from './EnhancedCard'

const Topbar = ({ user, onToggleAssist }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState([])
  const wrapperRef = useRef()

  // ... [Keep your existing socket useEffect logic here] ...

  return (
    <header className='col-span-12 h-20 flex items-center justify-between px-6 mb-4'>
      <EnhancedCard className='w-full h-full flex items-center justify-between px-6 py-2 bg-slate-900/60 border-white/5'>
        {/* Left: Search & AI Trigger */}
        <div className='flex items-center gap-4 w-1/3'>
          <input
            className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-white/30 focus:border-blue-500/50 outline-none'
            placeholder='Search auctions...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent('toggle-assist'))
            }
            className='p-3 text-blue-400 hover:bg-white/5 rounded-full transition-all'
          >
            <i className='fas fa-robot text-lg'></i>
          </button>
        </div>

        {/* Right: Profile & Notifications */}
        <div className='flex items-center gap-6' ref={wrapperRef}>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-white'>
              {user?.name || 'Guest'}
            </span>
            <img
              src={user?.avatar || 'https://i.pravatar.cc/40'}
              className='w-10 h-10 rounded-full border border-white/10'
              alt='Profile'
            />
          </div>

          <div className='relative'>
            <button
              onClick={() => setOpen(!open)}
              className='p-3 text-white/60 hover:text-white relative'
            >
              <i className='fas fa-bell'></i>
              {notifications.length > 0 && (
                <span className='absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping' />
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className='absolute right-0 mt-4 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl'
                >
                  <h4 className='text-white font-bold mb-4 px-2'>
                    Notifications
                  </h4>
                  <ul className='space-y-2 max-h-60 overflow-y-auto'>
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        className='p-3 bg-white/5 rounded-xl hover:bg-white/10 text-xs text-white/70'
                      >
                        {n.text}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </EnhancedCard>
    </header>
  )
}

export default Topbar
