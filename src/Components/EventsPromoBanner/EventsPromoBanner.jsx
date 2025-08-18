import React from 'react'
import './EventsPromoBanner.css'

const EventsPromoBanner = () => {
  return (
    <div className="promo-section">
        <div className="gradient-banner">
            <h2>Got an Event? We've Got the Hype.</h2>
            <p style={ {paddingTop: '16px'}}>
                Reach thousands of partygoers, culture lovers, and city explorers who are always down for a good time. 
                <br />TurnUpLagos puts your event in the spotlight.
            </p>
            <button className="promo-btn">Promote Your Event</button>
        </div>
    </div>

  )
}

export default EventsPromoBanner