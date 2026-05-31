import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { EnhancedCard } from '../EnhancedCard'
import { Magnetic3DContainer } from '../Magnetic3DContainer'

const OtherAuctionsManager = () => {
  const [otherItems, setOtherItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    currentBid: '',
    minIncrement: '',
    endTime: '',
    image: null,
    imagePreview: ''
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOtherItems()
  }, [])

  const fetchOtherItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('/auctions')
      const now = Date.now()
      const processed = (Array.isArray(res.data) ? res.data : []).map(a => ({
        ...a,
        endTime:
          typeof a.endTime === 'string'
            ? new Date(a.endTime).getTime()
            : a.endTime,
        active:
          (typeof a.endTime === 'string'
            ? new Date(a.endTime).getTime()
            : a.endTime) > now
      }))
      setOtherItems(
        processed
          .filter(a => a.active)
          .sort((a, b) => a.endTime - b.endTime)
          .slice(1)
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='p-6 space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Other Auctions
      </h2>

      {loading ? (
        <div className='text-white/40'>Loading terminal...</div>
      ) : (
        <div className='grid gap-4'>
          {otherItems.map(item => (
            <Magnetic3DContainer key={item.id}>
              <EnhancedCard className='flex items-center gap-6 p-4'>
                <img
                  src={
                    item.imagePath
                      ? `http://localhost:5000${item.imagePath}`
                      : '/placeholder.jpg'
                  }
                  className='w-20 h-20 rounded-xl object-cover'
                  alt=''
                />
                <div className='flex-1'>
                  <h4 className='text-white font-bold'>{item.name}</h4>
                  <p className='text-xs text-white/50'>
                    Bid: ${item.currentBid} | Inc: ${item.minIncrement}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => openEditModal(item)}
                    className='px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-500'
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleForceEnd(item.id)}
                    className='px-4 py-2 bg-amber-600 rounded-lg text-xs font-bold text-white'
                  >
                    END
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className='px-4 py-2 bg-red-600 rounded-lg text-xs font-bold text-white'
                  >
                    DELETE
                  </button>
                </div>
              </EnhancedCard>
            </Magnetic3DContainer>
          ))}
        </div>
      )}

      {/* ... [Modal implementation using EnhancedCard] ... */}
    </main>
  )
}

export default OtherAuctionsManager
