import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { EnhancedCard } from '../EnhancedCard'
import { Magnetic3DContainer } from '../Magnetic3DContainer'

export default function ManageUsers () {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users')
        setUsers(res.data)
      } catch (err) {
        console.error('Failed to fetch users', err)
      }
    }
    fetchUsers()
  }, [])

  const deleteUser = async id => {
    if (window.confirm('Delete this user? This action is permanent.')) {
      try {
        await api.delete(`/admin/users/${id}`)
        setUsers(users.filter(u => u.id !== id))
      } catch (err) {
        alert('Error deleting user')
      }
    }
  }

  return (
    <main className='p-6 space-y-8'>
      <h2 className='text-4xl font-bold text-white tracking-tight'>
        Manage Users
      </h2>

      <Magnetic3DContainer>
        <EnhancedCard className='bg-slate-900/60 border-white/5 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm text-white/70'>
              <thead className='bg-white/5 uppercase text-[10px] tracking-widest text-white/40'>
                <tr>
                  <th className='p-4'>Email</th>
                  <th className='p-4'>Name</th>
                  <th className='p-4'>Role</th>
                  <th className='p-4'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className='hover:bg-white/5 transition-colors'
                  >
                    <td className='p-4 text-white'>{user.email}</td>
                    <td className='p-4'>{user.name || '-'}</td>
                    <td className='p-4'>
                      <span className='px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20'>
                        {user.role}
                      </span>
                    </td>
                    <td className='p-4'>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className='text-red-400 hover:text-red-300 font-bold text-xs'
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      </Magnetic3DContainer>
    </main>
  )
}
