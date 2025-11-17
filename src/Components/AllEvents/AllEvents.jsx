import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './AllEvents.css'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const AllEvents = ({ stateFilter, limit, page = 1 }) => {
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        // just grab *all* events for that state
        const url = `https://lagos-turnup.onrender.com/event/events?state=${stateFilter}&pending=false`
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

  const truncateWords = (text, maxWords = 1) => {
    if(!text) return "";
    const words = text.split(" ")
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "..."
  }
  

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
         {loading ? (
            [...Array(limit)].map((_, idx) => (
              <div key={idx} className='LagEvents-card'>
                <div className="LagEvents-content">
                  {/* Fake image */}
                  <Skeleton 
                    height={150} 
                    borderRadius={8} 
                    baseColor="#1e1e1e" 
                    highlightColor="#333" 
                  />

                  {/* Title + venue */}
                  <div className="LagEvents-txt" style={{ marginTop: '10px' }}>
                    <Skeleton 
                      height={20} 
                      width="70%" 
                      borderRadius={4} 
                      baseColor="#1e1e1e" 
                      highlightColor="#333" 
                    />
                    <Skeleton 
                      height={15} 
                      width="50%" 
                      borderRadius={4} 
                      baseColor="#1e1e1e" 
                      highlightColor="#333" 
                    />
                  </div>

                  {/* Description */}
                  <Skeleton 
                    count={2} 
                    height={12} 
                    style={{ marginTop: '8px' }} 
                    baseColor="#1e1e1e" 
                    highlightColor="#333" 
                  />

                  {/* Buttons */}
                  <div className="LagEvents-btns" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <Skeleton height={30} width={100} borderRadius={6} baseColor="#1e1e1e" highlightColor="#333" />
                    <Skeleton height={30} width={80} borderRadius={6} baseColor="#1e1e1e" highlightColor="#333" />
                  </div>
                </div>
              </div>
            ))
          ): (
          currentEvents.map((event) => (
            <NavLink 
              key={event.id} 
              to={`/viewdetails/${event.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="LagEvents-card-link"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className='LagEvents-card'>
                <div className="LagEvents-content">
                  <LazyLoadImage 
                    src={event.flyer_url} 
                    alt={event.event_name} 
                    effect='blur' 
                    className="LagEvents-img" 
                  />
                  <div className="LagEvents-txt">
                    <h3 className="LagEvents-title" onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      navigate(`/viewdetails/${event.id}`);
                    }}>{truncateWords(event.event_name, 1)}</h3>
                    <p className="LagEvents-location">{event.venue.split(" ").slice(0,4).join(" ") + "..."}</p>
                  </div>
                  <p className="LagEvents-desc">
                    {event.event_description.split(" ").slice(0, 15).join(" ") + '...'}
                  </p>

                  <div className="LagEvents-btns">
                    <button style={{fontSize: '13px'}} type='button'>
                      <NavLink to={`/viewdetails/${event.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{color: '#fff', textDecoration: 'none'}}>View Details</NavLink>
                    </button>
                    <button 
                      disabled 
                      onClick={(e) => e.preventDefault()} 
                      className='LagEvents-buyBtn' 
                      style={{ fontSize: '12px' }}
                      type='button'
                    >
                      Buy Tickets
                    </button>
                  </div>
                </div>
              </div>
            </NavLink>
          ))
        )}
      </div>
    </nav>
  )
}

export default AllEvents
