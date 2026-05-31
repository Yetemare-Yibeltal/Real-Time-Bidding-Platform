import React, { useState, useEffect } from 'react'
import { EnhancedCard } from '../EnhancedCard'

const ColorSettings = () => {
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem('appAccentColor') || '#3b82f6'
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    localStorage.setItem('appAccentColor', accentColor)
  }, [accentColor])

  const resetColor = () => setAccentColor('#3b82f6')

  return (
    <EnhancedCard className='max-w-md mt-6 bg-slate-900/60 border-white/5'>
      <h3 className='text-white font-bold mb-4 flex items-center gap-2'>
        <i className='fas fa-palette text-blue-400'></i> Theme Configuration
      </h3>

      <div className='flex items-center gap-4'>
        <input
          type='color'
          value={accentColor}
          onChange={e => setAccentColor(e.target.value)}
          className='w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0'
        />
        <div className='flex-1'>
          <span className='font-mono text-white/70'>{accentColor}</span>
          <p className='text-[10px] text-white/30 uppercase tracking-widest'>
            Primary Accent
          </p>
        </div>
        <button
          onClick={resetColor}
          className='text-xs text-white/40 hover:text-white transition-colors'
        >
          RESET
        </button>
      </div>

      <div
        className='mt-6 w-full h-1 rounded-full transition-colors duration-500'
        style={{ backgroundColor: accentColor }}
      />
    </EnhancedCard>
  )
}

export default ColorSettings
