import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { EnhancedCard } from '../EnhancedCard'
import { Magnetic3DContainer } from '../Magnetic3DContainer'

export default function Payments () {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await api.get('/billing/payments')
        setPayments(res.data || [])
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  return (
    <main className='p-6 space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Payment Records
      </h2>

      {error && (
        <EnhancedCard className='border-red-500/20 text-red-400 p-4'>
          {error}
        </EnhancedCard>
      )}

      <Magnetic3DContainer>
        <EnhancedCard className='bg-slate-900/60 border-white/5 overflow-hidden'>
          {loading ? (
            <div className='p-8 text-center text-white/40'>
              Securing connection to ledger...
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm text-white/70'>
                <thead className='bg-white/5 uppercase text-[10px] tracking-widest text-white/40'>
                  <tr>
                    <th className='p-4'>User</th>
                    <th className='p-4'>Amount</th>
                    <th className='p-4'>Status</th>
                    <th className='p-4'>Date</th>
                    <th className='p-4'>Reference</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {payments.map(p => (
                    <tr
                      key={p.id}
                      className='hover:bg-white/5 transition-colors'
                    >
                      <td className='p-4 text-white font-medium'>
                        {p.user ? p.user.name : 'System'}
                        <div className='text-[10px] text-white/40'>
                          {p.user?.email}
                        </div>
                      </td>
                      <td className='p-4 font-mono text-emerald-400'>
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className='p-4'>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                            p.status === 'succeeded'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className='p-4 text-white/50'>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className='p-4 font-mono text-[10px] text-white/30'>
                        {p.providerId || 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan='5' className='p-8 text-center text-white/30'>
                        No transaction history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </EnhancedCard>
      </Magnetic3DContainer>
    </main>
  )
}
