import React from 'react'
import Club from '../../assets/Club.svg'
import Hotel from '../../assets/Hotel.svg'
import FoodSpot from '../../assets/FoodSpot.svg'
import Beach from '../../assets/Beach.svg'
import { NavLink, useLocation } from 'react-router-dom'
import './PlacesInLagos.css'

const PlacesInLagos = () => {
  return (
    <div className='PlacesInLagos-container'>
        <div className="PlacesInLagos">
            <div className="PlacesInLagos-txt">
                <h2 style={{fontFamily: 'Rushon Ground'}}>Discover Lagos</h2>
            </div>
            <button>
                <NavLink
                    to="/clubs"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Club} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/hotels"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Hotel} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/foodspots"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={FoodSpot} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/beaches"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Beach} />
                </NavLink>    
            </button>
        </div>
    </div>
  )
}

export default PlacesInLagos