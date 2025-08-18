import React, {useState} from 'react'
import Visit from '../../../Components/Visit/Visit'
import Le from '../../../assets/Le'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Footer from '../../../Components/Footer/Footer'

const ExploreLagos = () => {
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
    <div>
        <UserNavbar/>
        <Visit />
        <div className="LagEvents-header">
            <p style={{fontFamily: 'Rushon Ground'}}>Lagos Events</p>
        </div>
        <div className="Lag-Events">
            {[...Le, ...Le].map((event, index) => (
                <div key={`${event.id}-${Math.random()}`} className='event-card'>
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
        <Footer/>
    </div>
  )
}

export default ExploreLagos