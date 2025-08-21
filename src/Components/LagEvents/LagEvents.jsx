import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import './LagEvents.css'
import Le from '../../assets/Le';

const LagEvents = ({ events }) => {
  const [activeBtn, setActiveBtn] = useState({ index: null, type: null })
  const handleClick = (index, type) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null })
    } else {
      setActiveBtn({ index, type })
    }
  }

  return (
    <nav className='LagEvents-container'>
        <div className="LagEvents-header">
            <p style={{ fontFamily: 'Rushon Ground' }}>Lagos Events</p>
            <button>
                <NavLink
                    to="/explore"
                    className={({ isActive }) => (isActive ? 'LagEvents-link active' : 'LagEvents-link view-more')}
                >
                    View More
                </NavLink>
            </button>
        </div>
        <div className="LagEvents-list">
            {Le.map((event, index) => (
                <div key={event.id} className='LagEvents-card'>
                    <div className="LagEvents-content">
                        <img src={event.image} alt={event.title} className="LagEvents-img" />
                        <div className="LagEvents-txt">
                            <h3 className="LagEvents-title">{event.title}</h3>
                            <p className="LagEvents-location">{event.location}</p>
                        </div>
                        <p className="LagEvents-desc">{event.desciption}</p>
                        <div className="LagEvents-btns">
                            <button
                                className={activeBtn.index === index && activeBtn.type === 'details' ? 'LagEvents-activeBtn' : ''}
                                onClick={() => handleClick(index, 'details')}

                                style={{fontSize: '13px'}}
                            >
                                <NavLink to='eventdetails' style={{color: '#fff', textDecoration: 'none'}}>View Details</NavLink>
                            </button>

                            <button disabled className='LagEvents-buyBtn' style={{fontSize: '12px'}}>
                                Buy Tickets
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </nav>
  )
}

export default LagEvents
