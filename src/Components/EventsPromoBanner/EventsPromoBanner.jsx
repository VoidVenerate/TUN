import React from 'react'
import './EventsPromoBanner.css'
import { NavLink } from 'react-router-dom'

const EventsPromoBanner = () => {
  return (
    <div className="promo-section">
      <NavLink to='/promoteevent' className="promo-banner-link">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/promo-banner-mobile.png" 
          />
          <img 
            src="/promo-banner-desktop.png" 
            alt="Promote Your Event" 
            className="promo-banner-image"
          />
        </picture>
      </NavLink>
    </div>
  )
}

export default EventsPromoBanner