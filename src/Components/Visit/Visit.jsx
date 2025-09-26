import React from 'react'
import vl from '../../assets/vl.png'
import './Visit.css'
import { NavLink } from 'react-router-dom'

const Visit = () => {
  return (
    <div className='visit-container'>
      <NavLink
        to="/lagvisit"
        className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
      >
        <img src={vl} alt="Visit Lagos" />
        <div className="caption">
          <p>
            Discover the Vibrant Heartbeat of Lagos! From stunning Beaches and cultural landmarks to the hottest nightlife spots, find your next adventure in the city that never sleeps
          </p>
        </div>
      </NavLink>    
    </div>
  )
}

export default Visit
