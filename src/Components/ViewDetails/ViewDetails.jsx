import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../RoleContext/RoleContext';
import './ViewDetails.css'; // ✅ Import the CSS file
import { ChevronLeft } from 'lucide-react';
import calendar from '../../assets/calendar.svg'
import clock from '../../assets/clock.svg'
import location from '../../assets/location.svg'

const ViewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rules } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `https://lagos-turnup-ecy5.onrender.com/event/events`,
          { params: { id } }
        );
        setEventData(res.data[0] || null);

        // Fetch similar events
        const similarRes = await axios.get(
          `https://lagos-turnup-ecy5.onrender.com/event/events`
        );
        // Exclude the current event
        const others = similarRes.data.filter(event => event.id !== id);

        // Shuffle the events
        const shuffled = others.sort(() => 0.5 - Math.random());

        // Pick 3 random ones
        const randomThree = shuffled.slice(0, 3);

        setSimilarEvents(randomThree);
      } catch (err) {
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="event-details-container">
        <div className="error-message">Event not found.</div>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      {/* Header */}
      <header className="event-details-header">
        <div className="header-left">
          <button 
          className="back-btn"
          onClick={() =>
            navigate(
              rules.role === 'sub-admin' || rules.role === 'super-admin'
                ? '/adminhome'
                : '/home'
            )
          }
        >
            <ChevronLeft />
          </button>
          <h1 className="page-title" style={{fontFamily:'Rushon Ground'}}>EVENT DETAILS</h1>
        </div>
        {eventData.is_featured && (
          <div className="featured-star">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="event-details-content">
        <div className="event-main-info">
          {/* Event Flyer */}
          <div className="event-flyer-section">
            {eventData.flyer_url ? (
              <img
                src={eventData.flyer_url}
                alt="Event Flyer"
                className="event-flyer"
              />
            ) : (
              <div className="flyer-placeholder">
                <div className="placeholder-icon">🖼️</div>
                <p>No flyer available</p>
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="event-info-section">
            <h2 className="event-title">{eventData.event_name}</h2>
            <p className="event-description">{eventData.event_description}</p>

            <div className="event-details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <img src={location} alt="" />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">{eventData.venue}, {eventData.state}</span>
                </div>
              </div>

              <div className="event-horizontal-line">
                <div className="detail-item">
                  <div className="detail-icon">
                    <img src={calendar} alt="calendar" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{formatDate(eventData.date)}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <img src={clock} alt="clock" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{eventData.time}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    🎭 {/* or an image for gate fee */}
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Gate Fee</span>
                    <span className="detail-value">{eventData.dress_code || 'Not Specified'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    📍 {/* or a location icon */}
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{eventData.state}</span>
                  </div>
                </div>
              </div>
              </div>


            <div className="no-additional-info">
              <span className="info-value">
                {eventData.contact_link ? (
                  <a 
                    href={eventData.contact_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='modal-close-btn-primary-info'
                  >
                    🔗 More Event Information
                  </a>
                ) : (
                  <div className="no">
                    <span>🔗No Additional Information</span>
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>

        <hr />

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="similar-events-section">
            <div className="similar-events-grid">
              {similarEvents.map((event, index) => (
                <div key={event.id || index} className="similar-event-card">
                  <div className="similar-event-image">
                    {event.flyer_url ? (
                      <img src={event.flyer_url} alt={event.event_name} onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setTimeout(() => {
                          navigate(`/viewdetails/${event.id}`);
                        }, 100); // tiny delay for smooth scroll
                      }} />
                    ) : (
                      <div className="similar-event-placeholder">
                        <span>🎉</span>
                      </div>
                    )}
                  </div>
                  <div className="similar-event-info">
                    <div className="similar-event-name-state">
                      <h4 className="similar-event-name"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/viewdetails/${event.id}`);
                          }, 100); // tiny delay for smooth scroll
                        }}>{event.event_name}</h4>
                      <p className="similar-event-location"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/viewdetails/${event.id}`);
                          }, 100); // tiny delay for smooth scroll
                        }}>{event.state}</p>
                    </div>
                    <p className='similar-event-desc'
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/viewdetails/${event.id}`);
                          }, 100); // tiny delay for smooth scroll
                        }}>{truncateWords(event.event_description, 17)}</p>
                    <div className="similar-event-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/viewdetails/${event.id}`);
                          }, 100); // tiny delay for smooth scroll
                        }}
                      >
                        View Details
                      </button>
                      <button className="buy-ticket-btn" disabled>
                        Buy Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDetails;
