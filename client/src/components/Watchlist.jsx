import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { EnhancedCard } from './EnhancedCard'

export default function Watchlist () {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist')
      setItems(res.data)
    } catch (err) {
      console.error('Failed to fetch watchlist', err)
    }
  }

  return (
    <div className='p-6'>
      <h2 className='text-3xl font-bold text-white mb-6'>Your Watchlist</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {items.map(item => (
          <EnhancedCard key={item.id} className='p-4'>
            <h3 className='text-white font-bold'>{item.name}</h3>
            <p className='text-white/60'>Current Bid: ${item.currentBid}</p>
          </EnhancedCard>
        ))}
        {items.length === 0 && (
          <p className='text-white/40'>No items in your watchlist.</p>
        )}
      </div>
    </div>
  )
}
