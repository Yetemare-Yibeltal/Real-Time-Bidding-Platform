import React, { useEffect, useRef, useState } from 'react'
import { Messages } from './components/Messages'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import socket, { onNewMessage } from '../socket/socket'
import { useAuth } from '../context/AuthContext'
import { Magnetic3DContainer } from './Magnetic3DContainer'

const Messages = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [body, setBody] = useState('')
  const messagesContainerRef = useRef(null)

  // ... [Keep your existing fetchMessages, searchUsers, and socket logic here] ...

  return (
    <div className='flex h-screen p-6 gap-6'>
      {/* Sidebar - 3D Magnetic Container */}
      <aside className='w-1/3 max-w-sm'>
        <Magnetic3DContainer>
          <motion.div className='glass-3d-card h-[80vh] p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden'>
            <h2 className='text-white font-bold mb-6 tracking-widest uppercase text-sm'>
              Conversations
            </h2>
            {/* Thread List... */}
          </motion.div>
        </Magnetic3DContainer>
      </aside>

      {/* Main Chat - 3D Glassmorphic Interface */}
      <section className='flex-1'>
        <Magnetic3DContainer>
          <motion.div
            className='glass-3d-card h-[80vh] p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {selectedThread ? (
              <>
                <div className='border-b border-white/10 pb-4 mb-4'>
                  <h3 className='text-white font-bold'>Chat with Partner</h3>
                </div>

                <div
                  ref={messagesContainerRef}
                  className='flex-1 overflow-y-auto space-y-4 scrollbar-thin'
                >
                  <AnimatePresence>
                    {currentThreadMessages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl max-w-[70%] ${
                          msg.senderId === user.id
                            ? 'bg-blue-600 ml-auto'
                            : 'bg-white/10'
                        }`}
                      >
                        <p className='text-sm text-white'>{msg.content}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleSend} className='mt-4 flex gap-2'>
                  <input
                    className='flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none'
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder='Type a message...'
                  />
                  <button className='bg-blue-600 px-6 py-3 rounded-xl text-white font-bold'>
                    SEND
                  </button>
                </form>
              </>
            ) : (
              <div className='flex items-center justify-center h-full text-white/30 italic'>
                Select a conversation to begin
              </div>
            )}
          </motion.div>
        </Magnetic3DContainer>
      </section>
    </div>
  )
}
export default Messages