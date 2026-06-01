import React, { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
// Corrected: Go up one level to find the components in the parent folder
import { EnhancedCard } from '../EnhancedCard'
import { Magnetic3DContainer } from '../Magnetic3DContainer'

export default function Billing () {
  const [amount, setAmount] = useState('5.00')
  const [description, setDescription] = useState('Listing fee')
  const [seedMock, setSeedMock] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleCreate = async e => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return alert('Enter a valid amount')
    setLoading(true)
    try {
      const res = await api.post('/billing/create-session', {
        amount: num,
        description,
        seedMock
      })
      if (res.data?.url) window.location.href = res.data.url
      else alert('Unexpected response from server')
    } catch (err) {
      console.error('Create session error', err)
      alert('Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md mx-auto py-12'>
      <h2 className='text-3xl font-bold text-white mb-8'>Secure Checkout</h2>

      <Magnetic3DContainer>
        <EnhancedCard className='space-y-6'>
          <form onSubmit={handleCreate} className='space-y-4'>
            <div>
              <label className='block text-xs uppercase text-white/40 mb-2'>
                Amount (USD)
              </label>
              <input
                type='number'
                step='0.01'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none'
                required
              />
            </div>

            <div>
              <label className='block text-xs uppercase text-white/40 mb-2'>
                Description
              </label>
              <input
                type='text'
                value={description}
                onChange={e => setDescription(e.target.value)}
                className='w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500/50 outline-none'
              />
            </div>

            <label className='flex items-center gap-3 cursor-pointer group'>
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  seedMock ? 'bg-blue-600 border-blue-600' : 'border-white/20'
                }`}
              >
                {seedMock && (
                  <i className='fas fa-check text-[10px] text-white'></i>
                )}
              </div>
              <input
                type='checkbox'
                className='hidden'
                checked={seedMock}
                onChange={e => setSeedMock(e.target.checked)}
              />
              <span className='text-sm text-white/60 group-hover:text-white transition-colors'>
                Seed mock auctions after payment
              </span>
            </label>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50'
            >
              {loading ? 'INITIALIZING...' : 'PROCEED TO PAYMENT'}
            </button>
          </form>

          <p className='text-[10px] text-center text-white/20 uppercase tracking-widest mt-4'>
            Powered by Stripe Secure Gateway
          </p>
        </EnhancedCard>
      </Magnetic3DContainer>
    </div>
  )
}
