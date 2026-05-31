import React from 'react'
import { motion } from 'framer-motion'
import { useUserData } from '../context/UserDataContext'
import { formatUSD } from '../utils/helpers'
import { Magnetic3DContainer } from './Magnetic3DContainer'
import { EnhancedCard } from './EnhancedCard'

const MyBids = () => {
  const { myBids } = useUserData()

  if (myBids.length === 0) {
    return (
      <EnhancedCard className='flex flex-col items-center justify-center py-20 text-white/50'>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <i className='fas fa-gavel text-5xl mb-4'></i>
        </motion.div>
        <p>No active bids found.</p>
      </EnhancedCard>
    )
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold text-white tracking-tight'>
        Your Bid History
      </h2>
      <div className='grid grid-cols-1 gap-4'>
        {myBids.map(bid => (
          <Magnetic3DContainer key={bid.id}>
            <EnhancedCard className='flex justify-between items-center transition-transform'>
              <div>
                <h3 className='text-lg font-bold text-white'>{bid.itemName}</h3>
                <p className='text-xs text-white/40 font-mono mt-1'>
                  Placed: {new Date(bid.timestamp).toLocaleString()}
                </p>
              </div>
              <div className='text-right'>
                <span className='block text-emerald-400 text-2xl font-black font-mono'>
                  {formatUSD(bid.amount)}
                </span>
                <span className='text-[10px] uppercase tracking-widest text-white/30'>
                  Bid Amount
                </span>
              </div>
            </EnhancedCard>
          </Magnetic3DContainer>
        ))}
      </div>
    </div>
  )
}

export default MyBids
