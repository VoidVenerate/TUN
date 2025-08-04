import React from 'react'
import './FeatureAnEvent.css'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PromoCard from '../PromoCard/PromoCard'

const FeatureAnEvent = () => {
    const navigate = useNavigate()
    const handleBack = () => {
        navigate("/promoteevent")
    }
  return (
    
    <div className='FeatureAnEvent-container'>
        <div className="FeatureAnEvent-header">
            <button 
                type="button" 
                className="back-event-btn"
                onClick={handleBack}
                >
                <ArrowLeft className="back-arrow" />
            </button>
        <h1 className="header-title">PROMOTE AN EVENT</h1>
        </div>
        <PromoCard title="Feature Your Event" subtitle = "Want More People to discover your event"/>
    </div>
  )
}

export default FeatureAnEvent