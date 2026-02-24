import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'system-ui, sans-serif',
    color: '#fff',
  },
  header: {
    width: '100%',
    maxWidth: '720px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #222',
  },
  headerDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: '#5423D2',
    boxShadow: '0 0 8px #5423D2',
    animation: 'aiPulse 2s infinite',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    margin: 0,
    color: '#fff',
  },
  chatWindow: {
    flex: 1,
    width: '100%',
    maxWidth: '720px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    minHeight: 'calc(100vh - 140px)',
    boxSizing: 'border-box',
  },
  bubble: (role) => ({
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
  }),
  bubbleInner: (role) => ({
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: role === 'user' ? '#5423D2' : 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '1.6',
    border: role === 'assistant' ? '1px solid #333' : 'none',
    boxShadow: role === 'user' ? '0 0 12px rgba(84,35,210,0.35)' : 'none',
  }),
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #333',
    borderRadius: '18px 18px 18px 4px',
    width: 'fit-content',
  },
  dot: (delay) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#5423D2',
    animation: 'bounce 1.2s infinite',
    animationDelay: delay,
  }),
  errorBox: {
    maxWidth: '720px',
    width: '100%',
    padding: '0 20px',
    color: '#ff4d4f',
    fontSize: '13px',
    textAlign: 'center',
  },
  inputRow: {
    width: '100%',
    maxWidth: '720px',
    padding: '12px 20px 24px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    boxSizing: 'border-box',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '11px 14px',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    background: 'rgba(255,255,255,0.056)',
    color: '#fff',
    outline: 'none',
    lineHeight: '1.5',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    minHeight: '44px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  sendBtn: (loading) => ({
    padding: '10px 20px',
    background: loading ? '#3a1a99' : '#5423D2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'system-ui, sans-serif',
    transition: 'transform 0.2s, box-shadow 0.2s',
    height: '44px',
    whiteSpace: 'nowrap',
  }),
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
    fontSize: '15px',
    marginTop: '80px',
    gap: '10px',
  },
  emptyIcon: {
    width: '40px',
    height: '40px',
    color: '#5423D2',
    opacity: 0.6,
  },
}

const keyframes = `
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}
@keyframes aiPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
`

const AIChatPage = () => {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await axios.post(
          'https://lagos-turnup-ecy5.onrender.com/ai/session/anonymous'
        )
        setSessionId(res.data.session_id)
      } catch (error) {
        console.error('Failed to create session', error)
      }
    }
    createSession()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(
        'https://lagos-turnup-ecy5.onrender.com/ai/chat/anonymous',
        { session_id: sessionId, message: userMessage.content },
        { headers: { 'Content-Type': 'application/json' } }
      )
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      console.error(err)
      setError(err.response ? err.response.data?.message || 'Server error.' : 'Network error. Check your connection.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* Header */}
      <div style={styles.header}>
        <ArrowLeft
          size={22}
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', color: '#fff', flexShrink: 0, transition: 'npm opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        />
        <div style={styles.headerDot} />
        <p style={styles.headerTitle}>AI Assistant</p>
      </div>

      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Ask me anything about Lagos events...
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={styles.bubble(msg.role)}>
            <div style={styles.bubbleInner(msg.role)}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div>
            <div style={styles.typingIndicator}>
              <span style={styles.dot('0s')} />
              <span style={styles.dot('0.2s')} />
              <span style={styles.dot('0.4s')} />
            </div>
          </div>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div style={styles.inputRow}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          onFocus={e => {
            e.target.style.borderColor = '#5423D2'
            e.target.style.boxShadow = '0 0 8px #5423D2'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#333'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          style={styles.sendBtn(loading)}
          onClick={sendMessage}
          disabled={loading}
          onMouseEnter={e => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 4px 14px rgba(84,35,210,0.45)'
            }
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default AIChatPage