import React from 'react'
import Club from '../../assets/Club.svg'
import Hotel from '../../assets/Hotel.svg'
import FoodSpot from '../../assets/FoodSpot.svg'
import Beach from '../../assets/Best-Beaches.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import './DiscoverLagos.css'

const DiscoverLagos = () => {
    const navigate = useNavigate()

    const handleAddNew = () => {
        navigate('/adminspots')
    };

    return (
        <div className='DiscoverLagos-container'>
            <div className="DiscoverLagos-header">
                <h2>Discover Lagos</h2>
                <button className="upload-button" onClick={handleAddNew}>
                    <Upload size={16} />
                    Upload Location
                </button>
            </div>
            <div className="DiscoverLagos-grid">
                <button>
                    <NavLink to="/adminclubs">
                        <img src={Club} alt="Clubs" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/adminhotels">
                        <img src={Hotel} alt="Hotels" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/adminfoodspots">
                        <img src={FoodSpot} alt="Food Spots" />
                    </NavLink>    
                </button>
                <button>
                    <NavLink to="/adminbeaches">
                        <img src={Beach} alt="Beaches" />
                    </NavLink>    
                </button>
            </div>
        </div>
    )
}

export default DiscoverLagos