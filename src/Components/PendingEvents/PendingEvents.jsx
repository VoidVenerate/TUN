import React, {useEffect, useState} from 'react'
import './PendingEvents.css'
import api from '../api'

const PendingEvents = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1) // if your API sends this

    
    const [activeBtn, setActiveBtn] = useState({index: null, type: null})
      const handleClick = (index, type) => {
        if(activeBtn.index === index && activeBtn.type === type) {
          setActiveBtn({index:null, type:null})
        }
        else {
          setActiveBtn({index,type})
        }
      }
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await api.get(`https://lagos-turnup.onrender.com/event/admin/featured-requests`,
                    {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    }
                )
                setEvents(res.data)
                setTotalPages(res.data.totalPages)
            } catch (error) {
                setError('Failed to fetch Pending Events')
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    },[currentPage])

    if (loading) {
        <p>Loading Events...</p>
    }
    if (error) {
        <p>Error Loading Events</p>
    }
  return (
    <div>
        <div className="pendingEvents-header">
        <p style={{ fontFamily: 'Rushon Ground' }}>Pending Events</p>
        </div>

        <div className="pending-Events">
        {events.map((event, index) => (
            <div key={`${event.id}`} className='event-card'>
            <div className="events">
                <img src={event.image} alt={event.title} />
                <div className="event-txt">
                <h3>{event.title}</h3>
                <p>{event.location}</p>
                </div>
                <p>{event.description}</p>
                <div className="slider-btn">
                <button
                    className={activeBtn.index === index && activeBtn.type === 'details' ? 'active' : ''}
                    onClick={() => handleClick(index, 'details')}
                >
                    Take Action
                </button>
                </div>
            </div>
            </div>
        ))}
        </div>

        {/* Pagination */}
        <div className="pagination-controls">
        <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
        >
            Previous
        </button>

        <span>Page {currentPage} {totalPages ? `of ${totalPages}` : ''}</span>

        <button
            onClick={() => setCurrentPage(prev => totalPages ? Math.min(prev + 1, totalPages) : prev + 1)}
            disabled={totalPages ? currentPage === totalPages : false}
        >
            Next
        </button>
        </div>
    </div>
    );

}

export default PendingEvents