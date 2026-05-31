import React from 'react';
import { createPortal } from 'react-dom';
import AIChat from './AIChat';

export default function AIChatPortal({ open }) {
  if (typeof document === 'undefined') return null;
  const root = document.getElementById('ai-assist-root');
  if (!root) return null;
  return createPortal(
    open ? (
      <div style={{ position: 'fixed', right: 24, bottom: 96, zIndex: 3000 }}>
        <AIChat />
      </div>
    ) : null,
    root
  );
}
