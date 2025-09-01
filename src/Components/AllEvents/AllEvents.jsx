import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import './AllEvents.css'

const AllEvents = ({ stateFilter, limit, page = 1 }) => {
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        // just grab *all* events for that state
        const url = `https://lagos-turnup.onrender.com/event/events?state=${stateFilter}`
        const res = await axios.get(url)
        setAllEvents(res.data || [])
      } catch (err) {
        console.error("Error fetching events:", err)
      } finally {
        setLoading(false)
      }
    }

    if (stateFilter) fetchEvents()
  }, [stateFilter])

  if (loading) return <p>Loading events...</p>

  // client-side pagination
  const start = (page - 1) * limit
  const currentEvents = allEvents.slice(start, start + limit)

  return (
    <nav className='LagEvents-container'>
      <div className="LagEvents-header">
        <p style={{ fontFamily: 'Rushon Ground' }}>
          {stateFilter === "Lagos" ? "Lagos Events" : "Beyond Lagos Events"}
        </p>
        {Number(limit) === 9 && (
          <button>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                isActive ? 'LagEvents-link active' : 'LagEvents-link view-more'}
            >
              View More
            </NavLink>
          </button>
        )}
      </div>

      <div className="LagEvents-list">
        {currentEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          currentEvents.map((event) => (
            <div key={event.id} className='LagEvents-card'>
              <div className="LagEvents-content">
                <img src={event.flyer_url} alt={event.event_name} className="LagEvents-img" />
                <div className="LagEvents-txt">
                  <h3 className="LagEvents-title">{event.event_name}</h3>
                  <p className="LagEvents-location">{event.venue}</p>
                </div>
                <p className="LagEvents-desc">
                  {event.event_description.split(" ").slice(0, 15).join(" ") + '...'}
                </p>
                <div className="LagEvents-btns">
                  <button style={{fontSize: '13px'}}>
                    <NavLink to='/eventdetails' style={{color: '#fff', textDecoration: 'none'}}>View Details</NavLink>
                  </button>
                  <button disabled className='LagEvents-buyBtn' style={{fontSize: '12px'}}>
                    Buy Tickets
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </nav>
  )
}

export default AllEvents
