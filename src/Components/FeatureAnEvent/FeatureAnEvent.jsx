import React from 'react'
import './FeatureAnEvent.css'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLast, ChevronLeft } from 'lucide-react'
import PromoCard from '../PromoCard/PromoCard'

const FeatureAnEvent = () => {
    const navigate = useNavigate()
  return (
    
    <div className='FeatureAnEvent-container'>
        <div className="FeatureAnEvent-header">
        <ChevronLeft onClick={() => navigate(-1)} />
        <h1 className="header-title">PROMOTE AN EVENT</h1>
        </div>
        <PromoCard title="Feature Your Event" subtitle = "Want more people to discover your event"/>
    </div>
  )
}

export default FeatureAnEvent