import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import ColorSettings from './ColorSettings'
import { useAuctionSimulator } from '../../hooks/useAuctionSimulator'
import { EnhancedCard } from '../EnhancedCard'
import { Magnetic3DContainer } from '../Magnetic3DContainer'

export default function AdminDashboard () {
  const [stats, setStats] = useState({ users: 0, auctions: 0, bids: 0 })
  const { liveItem, refreshAuctions } = useAuctionSimulator()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null
  })
  const [adding, setAdding] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  // ... [Keep your handleAddSubmit, handleDeleteLive, and seedMockAuctions logic here] ...

  return (
    <main className='space-y-8 p-6'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Admin Dashboard
      </h2>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[
          { label: 'Total Users', val: stats.users },
          { label: 'Active Auctions', val: stats.auctions },
          { label: 'Total Bids', val: stats.bids }
        ].map((stat, i) => (
          <Magnetic3DContainer key={i}>
            <EnhancedCard className='text-center py-8'>
              <h3 className='text-white/50 text-xs uppercase tracking-widest'>
                {stat.label}
              </h3>
              <p className='text-5xl font-black text-blue-400 mt-2'>
                {stat.val}
              </p>
            </EnhancedCard>
          </Magnetic3DContainer>
        ))}
      </div>

      {/* Admin Actions */}
      <EnhancedCard className='p-8'>
        <h3 className='text-white font-bold mb-6'>System Controls</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { to: '/admin/users', text: 'Manage Users' },
            { to: '/admin/auctions', text: 'Manage Auctions' },
            { to: '/admin/other-auctions', text: 'Other Items' }
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className='bg-white/5 border border-white/10 p-4 rounded-xl text-center text-sm font-bold text-white hover:bg-blue-600 transition-colors'
            >
              {link.text}
            </Link>
          ))}
          <button
            onClick={seedMockAuctions}
            className='bg-emerald-900/30 border border-emerald-500/20 p-4 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all'
          >
            🌱 Seed Mock Data
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className='bg-blue-600 p-4 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all'
          >
            + Add Product
          </button>
        </div>
      </EnhancedCard>

      <ColorSettings />

      {/* ... [Modals would be wrapped in the same glassmorphic EnhancedCard design] ... */}
    </main>
  )
}
