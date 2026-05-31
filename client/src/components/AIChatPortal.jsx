import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AIChat from './AIChat'

export default function AIChatPortal ({ open }) {
  if (typeof document === 'undefined') return null
  const root = document.getElementById('ai-assist-root')
  if (!root) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            zIndex: 3000,
            perspective: '1000px' // Enhances 3D depth for the portal container
          }}
        >
          <AIChat />
        </motion.div>
      )}
    </AnimatePresence>,
    root
  )
}
