import React from 'react'
import Club from '../../assets/Clubs.jpg'
import Hotel from '../../assets/Hotels.jpg'
import FoodSpot from '../../assets/Foods.jpg'
import Beach from '../../assets/Beaches.jpg'
import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './PlacesInLagos.css'

const PlacesInLagos = () => {
    const navigate = useNavigate()

    const handleGoBack = () => {
        navigate(-1)
    };

    return (
        <div className='PlacesInLagos-container'>
            <div className="PlacesInLagos-txt">
                <div className="discover-title-section">
                    <h2>Discover Lagos</h2>
                </div>
            </div>
            <div className="PlacesInLagos">
                <button>
                    <NavLink to="/clubs">
                        <img src={Club} alt="Clubs" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/hotels">
                        <img src={Hotel} alt="Hotels" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/foodspots">
                        <img src={FoodSpot} alt="Food Spots" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/beaches">
                        <img src={Beach} alt="Beaches" />
                    </NavLink>    
                </button>
            </div>
        </div>
    )
}

export default PlacesInLagos