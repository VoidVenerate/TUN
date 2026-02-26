import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MessageCircle, Zap } from 'lucide-react'

const AIButton = () => {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Magnetic effect - track mouse position relative to button
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!buttonRef.current || !hovered) {
        setMousePosition({ x: 0, y: 0 })
        return
      }
      
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate distance from center (limited range)
      const deltaX = (e.clientX - centerX) / 8
      const deltaY = (e.clientY - centerY) / 8
      
      setMousePosition({ 
        x: Math.max(-8, Math.min(8, deltaX)), 
        y: Math.max(-8, Math.min(8, deltaY)) 
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [hovered])

  // Ripple effect on click
  const createRipple = (e) => {
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }

  const handleClick = (e) => {
    createRipple(e)
    setTimeout(() => navigate('/chat'), 200)
  }

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes sparkle-rotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .ai-button-container {
          animation: slide-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1s;
          opacity: 0;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: ripple-effect 0.6s ease-out;
          pointer-events: none;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div 
        className="ai-button-container"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
        }}
      >
        {/* Background glow effect */}
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #8b5cf6)',
            backgroundSize: '200% 200%',
            opacity: hovered ? 0.6 : 0.3,
            filter: 'blur(12px)',
            transition: 'opacity 0.3s ease',
            animation: hovered ? 'gradientShift 3s ease infinite' : 'none',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />

        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false)
            setMousePosition({ x: 0, y: 0 })
          }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 24px',
            background: hovered 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(124, 58, 237, 0.9))'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50px',
            fontSize: '15px',
            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            transform: `
              translate(${mousePosition.x}px, ${mousePosition.y}px) 
              scale(${pressed ? 0.95 : hovered ? 1.02 : 1})
            `,
            boxShadow: hovered
              ? '0 8px 32px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 4px 20px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Ripple effects */}
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              className="ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '20px',
                height: '20px',
                marginLeft: '-10px',
                marginTop: '-10px',
              }}
            />
          ))}

          {/* Icon container with animation */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Animated background ring */}
            <span
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'scale(1.2)' : 'scale(0.8)',
                transition: 'all 0.3s ease',
              }}
            />
            
            <Sparkles 
              size={18} 
              style={{
                animation: hovered ? 'sparkle-rotate 2s linear infinite' : 'none',
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))',
              }}
            />
            
            {/* Secondary floating sparkles */}
            {hovered && (
              <>
                <Zap 
                  size={10} 
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    opacity: 0.8,
                    animation: 'float 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '-6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#06b6d4',
                    animation: 'float 1.5s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
              </>
            )}
          </span>

          {/* Text with gradient effect */}
          <span className="gradient-text">
            Ask TUL
          </span>

          {/* Optional badge/indicator
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #0a0a0f',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          /> */}
        </button>

        {/* Tooltip on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: '0',
            marginBottom: '12px',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#fff',
            whiteSpace: 'nowrap',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            pointerEvents: 'none',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Get instant event recommendations
          <span
            style={{
              position: 'absolute',
              top: '100%',
              right: '24px',
              border: '6px solid transparent',
              borderTopColor: 'rgba(0, 0, 0, 0.8)',
            }}
          />
        </div>
      </div>
    </>
  )
}

export default AIButton