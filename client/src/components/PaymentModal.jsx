import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedCard } from './EnhancedCard'

const PaymentModal = ({ modal, close, startCheckout }) => {
  return (
    <AnimatePresence>
      {modal?.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className='w-full max-w-sm'
          >
            <EnhancedCard className='border-blue-500/30 bg-slate-900/90'>
              <h3 className='text-xl font-bold text-white mb-4'>
                Payment Required
              </h3>
              <p className='text-white/60 mb-6 text-sm'>
                To place bids, you must pay a one-time access fee of
                <span className='text-white font-bold ml-1'>
                  ${modal.fee?.toFixed(2)}
                </span>
                .
              </p>

              {modal.error && (
                <div className='bg-red-500/20 text-red-200 p-3 rounded-lg text-xs mb-4 border border-red-500/20'>
                  {String(modal.error)}
                </div>
              )}

              <div className='flex gap-3 justify-end'>
                <button
                  onClick={close}
                  disabled={modal.pending}
                  className='px-4 py-2 text-white/50 hover:text-white transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={startCheckout}
                  disabled={modal.pending}
                  className='px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50'
                >
                  {modal.pending
                    ? 'Processing...'
                    : `Pay $${modal.fee?.toFixed(2)}`}
                </button>
              </div>
            </EnhancedCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PaymentModal
