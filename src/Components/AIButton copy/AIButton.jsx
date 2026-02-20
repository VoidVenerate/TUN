import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AIButton = () => {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => navigate('/chat')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 20px',
        background: hovered ? '#3a1a99' : '#5423D2',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        fontSize: '14px',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 6px 24px rgba(84,35,210,0.55)'
          : '0 4px 16px rgba(84,35,210,0.35)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#b39dfa',
          display: 'inline-block',
          animation: 'aiPulse 2s infinite',
        }} />
      </span>
      Ask AI
      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </button>
  )
}

export default AIButton