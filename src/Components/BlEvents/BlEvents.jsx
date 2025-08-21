import React, { useState } from 'react';
import Ble from '../../assets/Ble';
import { NavLink } from 'react-router-dom';
import './BlEvents.css';

const BlEvents = () => {
  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const handleClick = (index, type) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null });
    } else {
      setActiveBtn({ index, type });
    }
  };

  return (
    <nav className="BlEvents-container">
      <div className="BlEvents-header">
        <p style={{ fontFamily: 'Rushon Ground' }}>Beyond Lagos</p>
        <button>
          <NavLink
            to="/beyond"
            className={({ isActive }) => (isActive ? 'BlEvents-link active' : 'BlEvents-link view-more'
            )}
          >
            View More
          </NavLink>
        </button>
      </div>
      <div className="BlEvents-list">
        {Ble.map((event, index) => (
          <div key={event.id} className="BlEvents-card">
            <div className="BlEvents-events">
                <img src={event.image} alt={event.title} className="BlEvents-img" />
                <div className="BlEvents-txt">
                    <h3 className="BlEvents-title">{event.title}</h3>
                    <p className="BlEvents-location">{event.location}</p>
                </div>
                <p className="BlEvents-desc">{event.desciption}</p>
                <div className="BlEvents-btns">
                    <button
                    className={
                        activeBtn.index === index && activeBtn.type === 'details'
                        ? 'active'
                        : ''
                    }
                    onClick={() => handleClick(index, 'details')}
                    style={{fontSize: '13px'}}
                    >
                        <NavLink to='/eventdetails' style={{color: '#fff', textDecoration: 'none'}}>View Details</NavLink>
                    </button>

                    <button disabled className="buy-tickets-btn"
                        style={{fontSize: '13px'}}
                    >
                    Buy Tickets
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default BlEvents;
