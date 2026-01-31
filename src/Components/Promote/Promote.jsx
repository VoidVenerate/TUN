import React, { useState } from 'react'
import './Promote.css'
import { useNavigate } from 'react-router-dom'

const Promote = () => {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const options = [
    { key: 'event', label: 'Promote an Event', path: '/promoteevent' },
    { key: 'banner', label: 'Promote a Banner', path: '/promotebanner' },
  ]

  const handleContinue = () => {
    const chosen = options.find(o => o.key === selected)
    if (chosen) navigate(chosen.path)
  }

  return (
    <div className='promote-container'>
      <div className="promote">
        <div className="promote-field">
          <div className="promote-text">
            <h2>Promote with us</h2>
            <p>Showcase your events or banners to reach the right audience and make an impact today!</p>
          </div>

          {options.map(option => (
            <button
              key={option.key}
              className={`promote-btn ${selected === option.key ? 'promote-btn--selected' : ''}`}
              onClick={() => setSelected(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          className={`promote-continue-btn ${selected ? 'promote-continue-btn--active' : ''}`}
          onClick={handleContinue}
          disabled={!selected}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default Promote