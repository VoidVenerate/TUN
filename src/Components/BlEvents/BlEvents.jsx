import React, {useState} from 'react'
import Ble from '../../assets/Ble'
import { NavLink } from 'react-router-dom'
import './BlEvents.css'

const BlEvents = () => {
    const [activeBtn, setActiveBtn] = useState({index: null, type: null})
      const handleClick = (index, type) => {
        if(activeBtn.index === index && activeBtn.type === type) {
          setActiveBtn({index:null, type:null})
        }
        else {
          setActiveBtn({index,type})
        }
      }
  return (
    <nav className='BlEvents-container'>
        <div className="BlEvents-header">
            <p style={{fontFamily: 'Rushon Ground'}}>Beyond Lagos</p>
            <button>
                <NavLink
                    to="/beyond"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    View More
                </NavLink>
            </button>
        </div>
        <div className="Bl-Events">
            {Ble.map((event, index) => (
                <div key={event.id} className='event-card'>
                    <div className="events">
                        <img src={event.image} alt={event.title} />
                        <div className="event-txt">
                            <h3>{event.title}</h3>
                            <p>{event.location}</p>
                        </div>
                        <p>{event.desciption}</p>
                        <div className="slider-btn">
                            <button
                                className={activeBtn.index === index && activeBtn.type === 'details' ? 'active' : ''}
                                onClick={() => handleClick(index, 'details')}
                                >
                                View Details
                            </button>

                            <button disabled className='buy-tickets-btn'>
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

export default BlEvents