import React from 'react'
import vl from '../../assets/vl.svg'
import './Visit.css'
import { NavLink, useLocation } from 'react-router-dom'

const Visit = () => {
  return (
    <div className='visit-container'>
        <button>
          <NavLink
            to="/lagvisit"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            <img src={vl} />
            <div className="caption">
              <p>Discover the Vibrant Heartbeat of Lagos! From stunning Beaches and cultural landmarks to the hottest nightlife spots, find your next adventure in the city that never sleeps</p>
            </div>
          </NavLink>    
        </button>
    </div>
  )
}

export default Visit