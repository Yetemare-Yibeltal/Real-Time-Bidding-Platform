import React from 'react'
import { motion } from 'framer-motion'
import { EnhancedCard } from './EnhancedCard'

const Sidebar = ({ showToast }) => {
  const menuItems = [
    { name: 'All Auctions', icon: 'store', view: 'all-auctions' },
    { name: 'My Bids', icon: 'gavel', view: 'my-bids' },
    { name: 'Watchlist', icon: 'eye', view: 'watchlist' },
    { name: 'Messages', icon: 'envelope', view: 'messages' },
    { name: 'Profile', icon: 'user-circle', view: 'profile' },
    { name: 'Settings', icon: 'cog', view: 'settings' }
  ]

  return (
    <aside className='h-[85vh] w-64 flex flex-col gap-6'>
      <EnhancedCard className='flex flex-col h-full bg-slate-900/90 border-white/10'>
        <div className='mb-8'>
          <h1 className='text-xl font-bold text-white flex items-center gap-2'>
            <i className='fas fa-gavel text-blue-500'></i> BidMaster
          </h1>
          <p className='text-[10px] text-white/30 uppercase tracking-widest mt-1'>
            Auction Ecosystem
          </p>
        </div>

        <nav className='flex-1 flex flex-col gap-2'>
          {menuItems.map(item => (
            <motion.a
              key={item.name}
              whileHover={{ x: 5 }}
              href='#'
              onClick={e => {
                e.preventDefault()
                showToast(`Navigating to ${item.name}`)
              }}
              className='flex items-center gap-4 p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all'
            >
              <i className={`fas fa-${item.icon} w-5`}></i>
              <span className='font-medium text-sm'>{item.name}</span>
            </motion.a>
          ))}
        </nav>

        <button
          onClick={() => showToast('Logging out...')}
          className='mt-auto flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all'
        >
          <i className='fas fa-sign-out-alt'></i>
          <span className='text-sm font-bold'>LOGOUT</span>
        </button>
      </EnhancedCard>
    </aside>
  )
}

export default Sidebar
