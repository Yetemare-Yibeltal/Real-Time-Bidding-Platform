import React from 'react'

export const EnhancedCard = ({ children, className = '' }) => {
  return (
    <div
      className={`p-6 rounded-2xl border bg-opacity-80 backdrop-blur-md shadow-xl ${className}`}
    >
      {children}
    </div>
  )
}
