import React from 'react'
import Club from '../../assets/Club.svg'
import Hotel from '../../assets/Hotel.svg'
import FoodSpot from '../../assets/FoodSpot.svg'
import Beach from '../../assets/Best-Beaches.jpg'
import { NavLink, useLocation } from 'react-router-dom'
import './PlacesInLagos.css'

const PlacesInLagos = () => {
  return (
    <div className='PlacesInLagos-container'>
        <div className="PlacesInLagos-txt">
            <h2 style={{fontFamily: 'Rushon Ground'}}>Discover Lagos</h2>
        </div>
        <div className="PlacesInLagos">
            <button>
                <NavLink
                    to="/clubs"
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Club} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/hotels"
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Hotel} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/foodspots"
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={FoodSpot} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/beaches"
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