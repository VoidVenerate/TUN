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
        const url = `https://lagos-turnup-ecy5.onrender.com/event/events?state=${stateFilter}&pending=false`
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

  const truncateText = (text, maxChars = 90) => {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars).trim() + "...";
  }

  // client-side pagination
  const start = (page - 1) * limit
  const currentEvents = allEvents.slice(start, start + limit)

  return (
    <nav className='LagEvents-container'>
      <div className="LagEvents-header">
        {Number(limit) === 18 && (
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
                    height={455} 
                    borderRadius={16} 
                    baseColor="#1e1e1e" 
                    highlightColor="#333" 
                  />

                  {/* Title */}
                  <div className="LagEvents-txt" style={{ marginTop: '10px' }}>
                    <Skeleton 
                      height={22} 
                      width="100%" 
                      borderRadius={4} 
                      baseColor="#1e1e1e" 
                      highlightColor="#333" 
                    />
                  </div>

                  {/* Description - 2 lines */}
                  <div style={{ marginTop: '8px' }}>
                    <Skeleton 
                      height={12} 
                      width="100%"
                      borderRadius={4} 
                      baseColor="#1e1e1e" 
                      highlightColor="#333" 
                      style={{ marginBottom: '4px' }}
                    />
                    <Skeleton 
                      height={12} 
                      width="85%"
                      borderRadius={4} 
                      baseColor="#1e1e1e" 
                      highlightColor="#333" 
                    />
                  </div>

                  {/* Buttons */}
                  <div className="LagEvents-btns" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <Skeleton height={40} width="48%" borderRadius={100} baseColor="#1e1e1e" highlightColor="#333" />
                    <Skeleton height={40} width="48%" borderRadius={100} baseColor="#1e1e1e" highlightColor="#333" />
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
                    }}>{event.event_name}</h3>
                  </div>
                  <p className="LagEvents-desc">
                    {truncateText(event.event_description, 90)}
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