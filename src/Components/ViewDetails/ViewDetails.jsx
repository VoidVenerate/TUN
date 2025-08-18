import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../RoleContext/RoleContext';


const ViewDetails = () => {
  const { id } = useParams(); // expects route like /viewevent/:id
  const navigate = useNavigate();
  const { rules } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://lagos-turnup.onrender.com/event/events/${id}`);
        setEventData(res.data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="review-container"><p>Loading...</p></div>;
  }

  if (!eventData) {
    return <div className="review-container"><p>Event not found.</p></div>;
  }

  return (
    <div className="review-container">
      {/* ===== HEADER ===== */}
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          EVENT DETAILS
        </h1>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="review-content">
        {/* Flyer Preview */}
        <div className="review-upload-section">
          <div className="review-upload-label">
            <span className="review-upload-text">Event Flyer</span>
            <div className="review-upload-description">Uploaded flyer preview.</div>
          </div>
          <div className="review-upload-area">
            {eventData.flyer_url ? (
              <img
                src={eventData.flyer_url}
                alt="Event Flyer"
                className="review-flyer-preview"
              />
            ) : (
              <div className="review-upload-placeholder">No flyer uploaded</div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="review-form">
          <div className="review-fields">
            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Event Name</label>
                <p className="review-value">{eventData.event_name}</p>
              </div>
              <div className="review-group">
                <label className="review-label">State</label>
                <p className="review-value">{eventData.state}</p>
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Venue</label>
                <p className="review-value">{eventData.venue}</p>
              </div>
              <div className="review-group">
                <label className="review-label">Date</label>
                <p className="review-value">{eventData.date}</p>
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Time</label>
                <p className="review-value">{eventData.time}</p>
              </div>
              <div className="review-group">
                <label className="review-label">Dress Code</label>
                <p className="review-value">{eventData.dress_code || 'N/A'}</p>
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label">Event Description</label>
              <p className="review-value">{eventData.event_description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Info */}
      <div className="review-form">
        <div className="review-fields">
          <div className="review-group review-full">
            <label className="review-label">Featured</label>
            <p className="review-value">
              {eventData.is_featured ? 'This event is featured' : 'Not featured'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="review-footer">
        <button
          className="review-back-btn"
          onClick={() =>
            navigate(
              rules.role === 'sub-admin' || rules.role === 'super-admin'
                ? '/adminhome'
                : '/home'
            )
          }
        >
          ← Back
        </button>
      </footer>
    </div>
  );
};

export default ViewDetails;
