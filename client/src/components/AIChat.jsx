import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useChatAssistant from '../hooks/useChatAssistant'
import { useAuth } from '../context/AuthContext'
import { Magnetic3DContainer } from './Magnetic3DContainer'

export default function AIChat () {
  const { messages, loading, error, sendMessage, reset } = useChatAssistant()
  const { user } = useAuth()
  const [input, setInput] = useState('')

  const onSubmit = async e => {
    e.preventDefault()
    if (!input.trim() || !user) return
    await sendMessage(input.trim())
    setInput('')
  }

  return (
    <Magnetic3DContainer>
      <motion.div
        className='glass-3d-card w-full max-w-lg p-6 rounded-3xl border border-white/20 shadow-2xl bg-white/5 backdrop-blur-2xl'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className='text-white/80 font-semibold mb-4 tracking-widest uppercase text-sm'>
          Auction Intelligence Unit
        </h2>

        <div className='h-[300px] overflow-y-auto mb-6 pr-2 space-y-4 scrollbar-thin'>
          {messages.length === 0 && (
            <p className='text-white/40 italic'>
              System ready. Awaiting your inquiry...
            </p>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-sm'
            >
              <strong className='text-blue-400 uppercase'>{m.role}: </strong>
              <span className='text-white/90'>{m.content}</span>
            </motion.div>
          ))}
          {loading && (
            <div className='text-blue-300 animate-pulse text-xs'>
              Computing response...
            </div>
          )}
        </div>

        {error && <div className='text-red-400 text-xs mb-4'>{error}</div>}

        <form onSubmit={onSubmit} className='flex gap-2'>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={user ? 'Ask about bids...' : 'Sign in required'}
            className='flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50'
            disabled={!user}
          />
          <button
            type='submit'
            disabled={loading || !user}
            className='px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all'
          >
            {loading ? '...' : 'SEND'}
          </button>
        </form>
      </motion.div>
    </Magnetic3DContainer>
  )
}
