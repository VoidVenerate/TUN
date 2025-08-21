import React from 'react'
import './Promote.css'
import { NavLink } from 'react-router-dom'

const Promote = () => {
  return (
    <div className='promote-container'>
        <div className="promote">
            <div className="promote-field">
                <div className="promote-text">
                    <h2>Promote with us</h2>
                    <p>Showcase your events or banners to reach the right audience and make an impact today!</p>
                </div>
                <NavLink to='/promoteevent' className="promote-btn">Promote an Event</NavLink>
                <NavLink to='/promotebanner' className="promote-btn">Promote a Banner</NavLink>

            </div>
        </div>
    </div>
  )
}

export default Promote
