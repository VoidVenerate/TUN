import React, {useState} from 'react'
import { NavLink, useLocation } from 'react-router-dom';
import './LagEvents.css'
import Le from '../../assets/Le';

const LagEvents = ({ events }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const cardsPerPage = 3;

//   const totalSets = Math.ceil(events.length / cardsPerPage);

//   const handleNext = () => {
//     if (currentIndex < totalSets - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   const currentEvents = events.slice(
//     currentIndex * cardsPerPage,
//     currentIndex * cardsPerPage + cardsPerPage
//   );
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
    <nav className='LagEvents-container'>
        <div className="LagEvents-header">
            <p style={{fontFamily: 'Rushon Ground'}}>Lagos Events</p>
            <button>
                <NavLink
                    to="/explore"
                    className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                    onClick={() => setMenuOpen(false)}
                >
                    View More
                </NavLink>
            </button>
        </div>
        <div className="Lag-Events">
            {Le.map((event, index) => (
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

export default LagEvents