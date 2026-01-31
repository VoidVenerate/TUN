import React from 'react'
import './ContactNavbar.css'

const ContactNavbar = () => {
  return (
    <div className='contact-container'>
        <div className="contact">
            <picture className="contact-image-wrapper">
              <source
                media="(max-width: 768px)"
                srcSet="/contact-banner-mobile.png"
              />
              <img
                src="/contact-banner-desktop.png"
                alt="Get in Touch With Us Anytime"
                className="contact-image"
              />
            </picture>
        </div>
    </div>
  )
}

export default ContactNavbar