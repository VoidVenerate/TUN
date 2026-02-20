import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { ArrowLeft, Sparkles, Send, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ==========================================
// DESIGN TOKENS - Clean, No Glow
// ==========================================
const tokens = {
  colors: {
    background: '#0a0a0f',
    surface: {
      1: 'rgba(255, 255, 255, 0.03)',
      2: 'rgba(255, 255, 255, 0.06)',
      3: 'rgba(255, 255, 255, 0.09)',
    },
    primary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    accent: {
      cyan: '#0891b2',
      pink: '#db2777',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
      online: '#7c3aed',
    },
    error: '#dc2626',
    success: '#059669',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  },
}

// ==========================================
// KEYFRAME ANIMATIONS - No Glow Effects
// ==========================================
const GlobalStyles = () => (
  <style>{`
    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    
    .message-enter {
      animation: messageSlideIn 0.3s ease-out forwards;
    }
    
    .shake-animation {
      animation: shake 0.4s ease-in-out;
    }
    
    /* Custom scrollbar - minimal */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}</style>
)

// ==========================================
// COMPONENT STYLES - Clean & Professional
// ==========================================
const styles = {
  page: {
    minHeight: '100vh',
    background: tokens.colors.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
    color: tokens.colors.text.primary,
  },
  
  header: {
    width: '100%',
    maxWidth: '800px',
    padding: `${tokens.spacing.lg} ${tokens.spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: tokens.colors.background,
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.radii.md,
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: tokens.colors.text.secondary,
  },
  
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    flex: 1,
  },
  
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: tokens.colors.success,
  },
  
  headerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    margin: 0,
    color: tokens.colors.text.primary,
  },
  
  headerSubtitle: {
    fontSize: '13px',
    color: tokens.colors.text.online,
    marginLeft: 'auto',
  },
  
  chatWindow: {
    flex: 1,
    width: '100%',
    maxWidth: '800px',
    padding: `${tokens.spacing.lg}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
    overflowY: 'auto',
    minHeight: 'calc(100vh - 160px)',
    boxSizing: 'border-box',
    scrollBehavior: 'smooth',
  },
  
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: tokens.spacing.lg,
    opacity: 0.7,
  },
  
  emptyIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: tokens.radii.lg,
    background: tokens.colors.surface[2],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    color: tokens.colors.text.primary,
  },
  
  emptySubtitle: {
    fontSize: '14px',
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: '280px',
    lineHeight: 1.6,
    margin: 0,
  },
  
  suggestionChips: {
    display: 'flex',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '400px',
  },
  
  chip: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    background: tokens.colors.surface[1],
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: tokens.radii.full,
    fontSize: '13px',
    color: tokens.colors.text.secondary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  messageGroup: (role) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: role === 'user' ? 'flex-end' : 'flex-start',
    gap: tokens.spacing.xs,
    maxWidth: '75%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  }),
  
  messageBubble: (role) => ({
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: role === 'user' 
      ? tokens.colors.primary.main
      : tokens.colors.surface[1],
    color: tokens.colors.text.primary,
    fontSize: '15px',
    lineHeight: 1.6,
    border: role === 'user' 
      ? 'none' 
      : '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
    wordWrap: 'break-word',
    animation: 'messageSlideIn 0.3s ease-out',
  }),
  
  messageMeta: {
    fontSize: '11px',
    color: tokens.colors.text.muted,
    padding: `0 ${tokens.spacing.sm}`,
  },
  
  typingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    background: tokens.colors.surface[1],
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '18px 18px 18px 4px',
    width: 'fit-content',
  },
  
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  
  typingDot: (delay) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: tokens.colors.text.muted,
    animation: `typingBounce 1.4s infinite`,
    animationDelay: delay,
  }),
  
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
    borderRadius: tokens.radii.md,
    color: tokens.colors.error,
    fontSize: '14px',
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
    animation: 'shake 0.4s ease-in-out',
  },
  
  inputContainer: {
    width: '100%',
    maxWidth: '800px',
    padding: `${tokens.spacing.md} ${tokens.spacing.lg} ${tokens.spacing.xl}`,
    background: tokens.colors.background,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  
  inputWrapper: {
    display: 'flex',
    gap: tokens.spacing.md,
    alignItems: 'flex-end',
    padding: `${tokens.spacing.sm}`,
    background: tokens.colors.surface[1],
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: tokens.radii.xl,
    transition: 'border-color 0.2s ease',
  },
  
  inputWrapperFocused: {
    borderColor: tokens.colors.primary.main,
  },
  
  textarea: {
    flex: 1,
    resize: 'none',
    border: 'none',
    background: 'transparent',
    color: tokens.colors.text.primary,
    fontSize: '15px',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    outline: 'none',
    padding: `${tokens.spacing.md}`,
    minHeight: '24px',
    maxHeight: '120px',
  },
  
  sendButton: (loading, hasContent) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: tokens.radii.lg,
    background: loading || !hasContent 
      ? tokens.colors.surface[2] 
      : tokens.colors.primary.main,
    border: 'none',
    cursor: loading || !hasContent ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading || !hasContent ? 0.4 : 1,
  }),
  
  shortcutHint: {
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    fontSize: '12px',
    color: tokens.colors.text.muted,
    opacity: 0.6,
  },
}

// ==========================================
// MAIN COMPONENT
// ==========================================
const AIChatPage = () => {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, error])

  // Initialize session
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await axios.post(
          'https://lagos-turnup-ecy5.onrender.com/ai/session/anonymous'
        )
        setSessionId(res.data.session_id)
      } catch (error) {
        console.error('Failed to create session', error)
        setError('Failed to initialize chat session')
      }
    }
    createSession()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [input])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await axios.post(
        'https://lagos-turnup-ecy5.onrender.com/ai/chat/anonymous',
        { session_id: sessionId, message: userMessage.content },
        { headers: { 'Content-Type': 'application/json' } }
      )
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.reply,
        timestamp: new Date()
      }])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [input, loading, sessionId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (text) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  const suggestions = [
    "What's happening in Lagos this weekend?",
    "What's happening Outside Lagos this weekend?",
    "Best concerts in Lagos",
    "Family-friendly events",
    "Free events near me"
  ]

  return (
    <div style={styles.page}>
      <GlobalStyles />

      {/* Header */}
      <header style={styles.header}>
        <button 
          style={styles.backButton}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = tokens.colors.surface[1]
            e.currentTarget.style.color = tokens.colors.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = tokens.colors.text.secondary
          }}
        >
          <ArrowLeft size={18} />
        </button>
        
        <div style={styles.headerContent}>
          <div style={styles.statusIndicator} />
          <h1 style={styles.headerTitle}>TuL AI Guide</h1>
          <span style={styles.headerSubtitle}>Online</span>
        </div>
      </header>

      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconWrapper}>
              <Sparkles size={28} color={tokens.colors.text.secondary} />
            </div>
            <h2 style={styles.emptyTitle}>Discover Events Inside and Outside Lagos</h2>
            <p style={styles.emptySubtitle}>
              Your personal AI assistant for finding the best concerts, festivals, and experiences in and out Lagos.
            </p>
            <div style={styles.suggestionChips}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  style={styles.chip}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tokens.colors.surface[2]
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                    e.currentTarget.style.color = tokens.colors.text.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = tokens.colors.surface[1]
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.color = tokens.colors.text.secondary
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={styles.messageGroup(msg.role)}>
            <div style={styles.messageBubble(msg.role)}>
              {msg.content}
            </div>
            <span style={styles.messageMeta}>
              {formatTime(msg.timestamp || new Date())}
            </span>
          </div>
        ))}

        {loading && (
          <div style={styles.messageGroup('assistant')}>
            <div style={styles.typingContainer}>
              <div style={styles.typingIndicator}>
                <span style={styles.typingDot('0s')} />
                <span style={styles.typingDot('0.15s')} />
                <span style={styles.typingDot('0.3s')} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <div 
          style={{
            ...styles.inputWrapper,
            ...(isFocused ? styles.inputWrapperFocused : {}),
          }}
        >
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask about events in Lagos..."
            rows={1}
          />
          <button
            style={styles.sendButton(loading, input.trim().length > 0)}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>
        <div style={styles.shortcutHint}>
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  )
}

export default AIChatPage