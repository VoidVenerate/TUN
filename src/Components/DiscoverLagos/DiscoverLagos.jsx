import React from 'react'
import Club from '../../assets/Club.svg'
import Hotel from '../../assets/Hotel.svg'
import FoodSpot from '../../assets/FoodSpot.svg'
import Beach from '../../assets/Beach.svg'
import { NavLink, useLocation } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './DiscoverLagos.css'

const DiscoverLagos = () => {
    const handleAddNew = () => {
        navigate('/adminspots')
    };
    const navigate = useNavigate()
  return (
    <div className='DiscoverLagos-container'>
        <div className="PlacesInLagos-txt">
            <h2 style={{fontFamily: 'Rushon Ground'}}>Discover Lagos</h2>
            <button onClick={handleAddNew} ><Upload size={16}/>  Upload Location</button>
        </div>
        <div className="PlacesInLagos">
            <button>
                <NavLink
                    to="/adminclubs"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Club} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/adminhotels"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={Hotel} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/adminfoodspots"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    <img src={FoodSpot} />
                </NavLink>    
            </button>
            <button>
                <NavLink
                    to="/adminbeaches"
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

export default DiscoverLagos