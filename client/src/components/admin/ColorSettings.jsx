import React, { useState, useEffect } from 'react';

const ColorSettings = () => {
  const [accentColor, setAccentColor] = useState(localStorage.getItem('appAccentColor') || '#3b82f6');

  useEffect(() => {
    // Apply the color to CSS variables on the root element
    document.documentElement.style.setProperty('--accent', accentColor);
    // Also update hover variant (optional: make it slightly darker)
    const darker = shadeColor(accentColor, -20);
    document.documentElement.style.setProperty('--accent-hover', darker);
    localStorage.setItem('appAccentColor', accentColor);
  }, [accentColor]);

  // Helper to darken/lighten a hex color
  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    R = Math.min(255, Math.max(0, R + (R * percent) / 100));
    G = Math.min(255, Math.max(0, G + (G * percent) / 100));
    B = Math.min(255, Math.max(0, B + (B * percent) / 100));
    return `rgb(${R}, ${G}, ${B})`;
  };

  const resetColor = () => {
    setAccentColor('#3b82f6'); // default blue
  };

  return (
    <div className="settings-card" style={{ maxWidth: '500px', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '16px' }}>🎨 Color Settings (Admin only)</h3>
      <label style={{ display: 'block', marginBottom: '8px' }}>Primary Accent Color</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="color"
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
          style={{ width: '60px', height: '40px', cursor: 'pointer' }}
        />
        <span style={{ fontFamily: 'monospace' }}>{accentColor}</span>
        <button onClick={resetColor} className="theme-btn">Reset to Default</button>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
        This color will be used for buttons, active links, hover effects, and accent borders.
      </p>
      <div style={{ marginTop: '16px', backgroundColor: 'var(--accent)', width: '100%', height: '8px', borderRadius: '4px' }}></div>
    </div>
  );
};

export default ColorSettings;