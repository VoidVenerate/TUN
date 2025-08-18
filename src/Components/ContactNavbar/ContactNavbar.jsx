import React from 'react'
import './ContactNavbar.css'
import PromoCard from '../PromoCard/PromoCard'

const ContactNavbar = () => {
  return (
    <div className='contact-container'>
        <div className="contact">
            <PromoCard title="Get in Touch With Us Anytime" subtitle= "Write To Us" />
            
        </div>
    </div>
  )
}

export default ContactNavbar