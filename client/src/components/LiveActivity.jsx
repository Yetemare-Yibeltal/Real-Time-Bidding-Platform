import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../socket/socket'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const LiveActivity = ({ activities = [] }) => {
  const [activitiesState, setActivities] = useState(activities)

  useEffect(() => {
    const handler = payload => {
      const entry = {
        id: Date.now(),
        userName: payload.user?.name || 'Anonymous',
        auctionName: payload.auction?.name || `#${payload.itemId}`,
        amount: payload.newBid ?? payload.amount ?? 0,
        timeAgo: 'now'
      }
      setActivities(prev => [entry, ...prev].slice(0, 50))
    }
    socket.on('live_activity', handler)
    return () => socket.off('live_activity', handler)
  }, [])

  return (
    <Magnetic3DContainer>
      <motion.aside
        className='glass-3d-card w-full max-w-sm p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden'
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className='flex justify-between items-center mb-6'>
          <h4 className='text-white/80 font-bold tracking-widest uppercase text-xs'>
            Live Bidding
          </h4>
          <div className='flex items-center gap-2'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500'></span>
            </span>
            <span className='text-white/40 text-[10px] font-mono'>
              {activitiesState.length}
            </span>
          </div>
        </div>

        <ul className='space-y-4 h-[400px] overflow-y-auto pr-2 scrollbar-thin'>
          <AnimatePresence initial={false}>
            {activitiesState.map(a => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center'
              >
                <div className='w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300 font-bold'>
                  {(a.userName || 'U')
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div className='flex-1'>
                  <p className='text-xs text-white font-semibold'>
                    {a.userName}
                  </p>
                  <p className='text-[10px] text-white/40'>
                    on {a.auctionName}
                  </p>
                </div>
                <p className='text-emerald-400 font-mono font-bold text-xs'>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(a.amount)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </motion.aside>
    </Magnetic3DContainer>
  )
}

export default LiveActivity
