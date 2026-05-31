import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ message, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className='fixed bottom-8 right-8 z-[100]'
        >
          {/* Glassmorphic Toast Container */}
          <div className='bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3'>
            <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
            <p className='text-white text-sm font-medium tracking-wide'>
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
