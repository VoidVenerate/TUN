import React from 'react'
import './LagEventsFooter.css'

const LagEventsFooter = () => {
  return (
    <div className='LagFooter-container'>
      <picture>
        <source 
          media="(max-width: 768px)" 
          srcSet="/lagos-footer-mobile.png" 
        />
        <img 
          src="/lagos-footer-desktop.png" 
          alt="Experience Lagos Like Never Before" 
          className="lagos-footer-image"
        />
      </picture>
    </div>
  )
}

export default LagEventsFooter