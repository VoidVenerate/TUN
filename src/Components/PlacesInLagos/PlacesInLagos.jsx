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
        navigate(-1) // Goes back to previous page
    };

    const styles = {
        discoverTitleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            marginLeft:'3vw'
        },
        backButton: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.3s ease, transform 0.2s ease',
            color: '#fff',
            padding: '0'
        },
        h2: {
            fontFamily: 'Rushon Ground',
            margin: '0'
        }

    };

    return (
        <div className='PlacesInLagos-container'>
            <div className="PlacesInLagos-txt" style={{marginTop:'0px', paddingTop:'0px'}}>
                <div style={styles.discoverTitleSection}>
                    <button 
                        style={styles.backButton} 
                        onClick={handleGoBack}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={styles.h2}>Discover Lagos</h2>
                </div>
            </div>
            <div className="PlacesInLagos" style={{paddingTop:'0px',gap:"0px"}}>
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