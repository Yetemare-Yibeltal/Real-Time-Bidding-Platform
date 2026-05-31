import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const AuctionBox = ({ item, onBid, isLive, formatUSD }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const minNextBid =
    Number(item.currentBid || 0) + Number(item.minIncrement || 0)
  const [bidAmount, setBidAmount] = useState(minNextBid)
  const isExpired = new Date(item.endTime) <= new Date()

  useEffect(() => {
    setBidAmount(minNextBid)
    const timer = setInterval(() => {
      const remaining = new Date(item.endTime) - new Date()
      if (remaining <= 0) {
        setTimeLeft('Expired')
        clearInterval(timer)
      } else {
        const hours = Math.floor(remaining / 3600000)
        const mins = Math.floor((remaining % 3600000) / 60000)
        const secs = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${hours}h ${mins}m ${secs}s`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [item.endTime, minNextBid])

  return (
    <Magnetic3DContainer>
      <motion.div
        className={`relative glass-3d-card p-6 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden ${
          isLive ? 'border-blue-500/50 shadow-blue-500/20' : ''
        }`}
        whileHover={{ scale: 1.02 }}
      >
        {isLive && (
          <div className='absolute top-4 right-4 animate-pulse'>
            <span className='bg-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full border border-red-500/30 tracking-widest uppercase'>
              Live Now
            </span>
          </div>
        )}

        <div className='space-y-4'>
          <h3 className='text-xl font-bold text-white tracking-tight'>
            {item.name}
          </h3>
          <p className='text-white/60 text-sm leading-relaxed'>
            {item.description}
          </p>

          <div className='grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl'>
            <div>
              <p className='text-[10px] text-white/40 uppercase tracking-widest'>
                Current Bid
              </p>
              <p className='text-lg font-mono text-blue-400'>
                {formatUSD(item.currentBid)}
              </p>
            </div>
            <div>
              <p className='text-[10px] text-white/40 uppercase tracking-widest'>
                Minimum Next
              </p>
              <p className='text-lg font-mono text-emerald-400'>
                {formatUSD(minNextBid)}
              </p>
            </div>
          </div>

          {!isExpired ? (
            <div className='pt-4 border-t border-white/5 flex gap-2'>
              <input
                type='number'
                value={bidAmount}
                onChange={e => setBidAmount(Number(e.target.value))}
                className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500'
              />
              <button
                onClick={() => onBid(bidAmount)}
                className='bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all'
              >
                BID
              </button>
            </div>
          ) : (
            <div className='text-center py-4 text-white/30 italic uppercase tracking-widest text-xs border-t border-white/5'>
              Auction Ended
            </div>
          )}
        </div>
      </motion.div>
    </Magnetic3DContainer>
  )
}

export default AuctionBox
