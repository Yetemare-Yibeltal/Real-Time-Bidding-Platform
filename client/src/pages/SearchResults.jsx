import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { searchUsers } from '../api/api'
import { EnhancedCard } from '../components/EnhancedCard'
import { Magnetic3DContainer } from '../components/Magnetic3DContainer'

const useQuery = () => new URLSearchParams(useLocation().search)

const SearchResults = () => {
  const query = useQuery()
  const q = query.get('q') || query.get('search') || ''
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setError(null)
    searchUsers(q)
      .then(res => setResults(res.data || []))
      .catch(err => {
        console.error('searchUsers error', err)
        setError('Unable to reach search index.')
      })
      .finally(() => setLoading(false))
  }, [q])

  if (!q)
    return (
      <main className='p-12 text-center text-white/30'>
        <h2 className='text-2xl font-bold mb-2'>Search Portal</h2>
        <p>Enter a name or email to scan the system.</p>
      </main>
    )

  return (
    <main className='p-6 space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Results for "{q}"
      </h2>

      {loading && (
        <div className='text-white/40 animate-pulse'>Querying database...</div>
      )}
      {error && (
        <EnhancedCard className='border-red-500/20 text-red-400 p-4'>
          {error}
        </EnhancedCard>
      )}

      <div className='grid gap-4'>
        {results.map(u => (
          <Magnetic3DContainer key={u.id}>
            <EnhancedCard className='flex items-center gap-4 p-4 hover:bg-white/5 transition-all'>
              <img
                src={u.avatar || `https://i.pravatar.cc/48?u=${u.id}`}
                alt={u.name}
                className='w-12 h-12 rounded-lg object-cover border border-white/10'
              />
              <div>
                <div className='font-bold text-white'>{u.name}</div>
                <div className='text-xs text-white/50 font-mono'>{u.email}</div>
              </div>
            </EnhancedCard>
          </Magnetic3DContainer>
        ))}
        {!loading && results.length === 0 && (
          <div className='p-8 text-center text-white/20'>
            No matching entities found.
          </div>
        )}
      </div>
    </main>
  )
}

export default SearchResults
