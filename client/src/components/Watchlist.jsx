import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserData } from '../context/UserDataContext'
import { useAuctionSimulator } from '../hooks/useAuctionSimulator'
import { usePayment } from '../context/PaymentContext'
import { useAuth } from '../context/AuthContext'
import { formatUSD } from '../utils/helpers'
import { Magnetic3DContainer } from './Magnetic3DContainer'
import { EnhancedCard } from './EnhancedCard'

const WatchlistAuctionCard = ({ item, onBid, onRemove }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [bidAmount, setBidAmount] = useState(
    Number(item.currentBid || 0) + Number(item.minIncrement || 0)
  )
  const isExpired = new Date(item.endTime) <= new Date()

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = new Date(item.endTime) - new Date()
      if (remaining <= 0) {
        setTimeLeft('Expired')
        clearInterval(timer)
      } else {
        const h = Math.floor(remaining / 3600000)
        const m = Math.floor((remaining % 3600000) / 60000)
        const s = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${h}h ${m}m ${s}s`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [item.endTime])

  return (
    <Magnetic3DContainer>
      <EnhancedCard className='h-full flex flex-col group bg-slate-900/60 border-white/5'>
        <div className='relative overflow-hidden rounded-2xl mb-4'>
          <img
            src={
              item.imagePath
                ? `http://localhost:5000${item.imagePath}`
                : 'https://picsum.photos/id/1/300/200'
            }
            alt={item.name}
            className='w-full h-40 object-cover'
          />
          <button
            onClick={() => onRemove(item.id)}
            className='absolute top-3 right-3 bg-red-500/80 backdrop-blur text-white p-2 rounded-full hover:bg-red-600 transition-all'
          >
            <i className='fas fa-trash text-xs'></i>
          </button>
        </div>

        <div className='flex-1 space-y-3'>
          <h4 className='text-white font-bold text-lg'>{item.name}</h4>
          <div className='flex justify-between items-center bg-white/5 p-2 rounded-xl'>
            <span className='text-xs text-white/50'>Current Bid</span>
            <span className='text-emerald-400 font-bold font-mono'>
              {formatUSD(item.currentBid)}
            </span>
          </div>

          <div className='text-center font-mono text-white/40 text-sm py-2'>
            <i className='far fa-clock mr-2'></i> {timeLeft}
          </div>

          {!isExpired && (
            <div className='flex gap-2'>
              <input
                type='number'
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                className='w-full bg-white/5 rounded-lg p-2 text-white text-sm outline-none border border-white/10'
              />
              <button
                onClick={() => onBid(bidAmount)}
                className='bg-blue-600 px-4 rounded-lg text-white font-bold text-xs'
              >
                BID
              </button>
            </div>
          )}
        </div>
      </EnhancedCard>
    </Magnetic3DContainer>
  )
}

const Watchlist = () => {
  const { user } = useAuth()
  const { watchlist, removeFromWatchlist, addBid } = useUserData()
  const { placeBid } = useAuctionSimulator()
  const { openPayment } = usePayment()

  const handleBid = async (item, amount) => {
    if (!user) return
    const result = await placeBid(item.id, amount)
    if (result?.success) {
      addBid({ itemId: item.id, itemName: item.name, amount })
      alert('Bid placed successfully!')
    } else if (result?.needPayment) {
      openPayment(amount, item.id, 'bid_access')
    }
  }

  return (
    <div className='space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Your Watchlist
      </h2>
      {watchlist.length === 0 ? (
        <EnhancedCard className='text-center py-20 text-white/40'>
          Your watchlist is currently empty.
        </EnhancedCard>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {watchlist.map(item => (
            <WatchlistAuctionCard
              key={item.id}
              item={item}
              onBid={amt => handleBid(item, amt)}
              onRemove={removeFromWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Watchlist
