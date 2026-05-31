import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import { EnhancedCard } from './EnhancedCard'
import { Magnetic3DContainer } from './Magnetic3DContainer'

export default function ManageAuctions () {
  const [auctions, setAuctions] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      const res = await api.get('/admin/auctions')
      setAuctions(res.data)
    } catch (err) {
      console.error('Failed to fetch auctions', err)
    }
  }

  // ... [Keep handleSubmit, handleCreateAndPay, deleteAuction logic here] ...

  return (
    <main className='p-6 space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Manage Auctions
      </h2>

      {/* Input Terminal */}
      <Magnetic3DContainer>
        <EnhancedCard className='bg-slate-900/80 border-white/5'>
          <h3 className='text-white font-bold mb-6'>
            {editingId ? 'Edit Auction' : 'Create New Auction'}
          </h3>
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 gap-4'
          >
            <input
              className='bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none'
              placeholder='Item Name'
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className='bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none'
              type='number'
              placeholder='Current Bid ($)'
              value={form.currentBid}
              onChange={e => setForm({ ...form, currentBid: e.target.value })}
              required
            />
            <input
              className='bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none'
              type='number'
              placeholder='Min Increment ($)'
              value={form.minIncrement}
              onChange={e => setForm({ ...form, minIncrement: e.target.value })}
              required
            />
            <input
              className='bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none'
              type='datetime-local'
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.target.value })}
              required
            />
            <textarea
              className='md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none'
              placeholder='Description'
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows='2'
            />

            <div className='md:col-span-2 flex gap-4'>
              <button
                type='submit'
                className='bg-blue-600 px-6 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-all'
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type='button'
                onClick={handleCreateAndPay}
                className='bg-white/5 px-6 py-3 rounded-xl font-bold text-white hover:bg-white/10 transition-all'
              >
                Create & Pay ($5)
              </button>
            </div>
          </form>
        </EnhancedCard>
      </Magnetic3DContainer>

      {/* Auction List */}
      <div className='space-y-4'>
        {auctions.map(auction => (
          <EnhancedCard
            key={auction.id}
            className='flex items-center gap-6 p-4'
          >
            <img
              src={
                auction.imagePath
                  ? `http://localhost:5000${auction.imagePath}`
                  : '/placeholder.jpg'
              }
              className='w-16 h-16 rounded-lg object-cover'
              alt={auction.name}
            />
            <div className='flex-1'>
              <h4 className='text-white font-bold'>{auction.name}</h4>
              <p className='text-xs text-white/40'>
                ${auction.currentBid} •{' '}
                {new Date(auction.endTime).toLocaleDateString()}
              </p>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => editAuction(auction)}
                className='text-blue-400 hover:text-blue-300 px-3 py-1 text-sm'
              >
                EDIT
              </button>
              <button
                onClick={() => deleteAuction(auction.id)}
                className='text-red-400 hover:text-red-300 px-3 py-1 text-sm'
              >
                DELETE
              </button>
            </div>
          </EnhancedCard>
        ))}
      </div>
    </main>
  )
}
