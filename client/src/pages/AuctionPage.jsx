import React, { useState, useEffect } from 'react'

const AuctionPage = ({ showToast }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Updated to match the new endpoint defined in server.js
    fetch('http://localhost:5000/api/auctions/list')
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch auctions:', err)
        setLoading(false)
      })
  }, [])

  if (loading)
    return <div className='text-white p-10'>Loading active auctions...</div>

  return (
    <div className='auction-page'>
      <h1 className='text-3xl font-bold mb-6'>Live Auctions</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {items.length > 0 ? (
          items.map(item => (
            <div
              key={item.id}
              className='bg-gray-800 p-4 rounded-lg border border-gray-700'
            >
              <img
                src={item.imagePath}
                alt={item.name}
                className='w-full h-48 object-cover rounded mb-4'
              />
              <h2 className='text-xl font-semibold'>{item.name}</h2>
              <p className='text-gray-400'>{item.description}</p>
              <div className='mt-4 flex justify-between items-center'>
                <span className='text-teal-400 font-bold'>
                  ${item.currentBid}
                </span>
                <button
                  onClick={() => showToast(`Placed bid on ${item.name}`)}
                  className='bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded text-white'
                >
                  Place Bid
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No active auctions found.</p>
        )}
      </div>
    </div>
  )
}

export default AuctionPage
