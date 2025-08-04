import React from 'react'
import './promote.css'
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
                <button><NavLink to='/promoteevent'>Promote an Event</NavLink></button>
                <button>Promote a Banner</button>
            </div>
        </div>
    </div>
  )
}

export default Promote