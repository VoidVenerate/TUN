// ReviewPage.jsx
import React, { useState } from 'react';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import './EventReview.css';

const EventReview = () => {
  const { eventData } = useEvent();
  const navigate = useNavigate();

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: '', // 'success' or 'error'
  });

  const handleSubmit = () => {
    const success = true; // replace with real API result
    if (success) {
      setModalInfo({
        show: true,
        title: 'Success!',
        message: 'Event submitted successfully.',
        subMessage: "Thanks for submitting your event. Our team will review it and publish it on TurnUpLagos within 24-48 hours. If featured, an agent will contact you to discuss payment and promotion. We'll notify you when your event goes live!",
        type: 'success',
      });
    } else {
      setModalInfo({
        show: true,
        title: 'Error!',
        message: 'Failed to submit event.',
        type: 'error',
      });
    }
  };

  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{fontFamily: "Rushon Ground"}}>EVENT REVIEW</h1>
      </header>

      <div className="review-content">
        {/* === 1️⃣ Flyer Preview Card === */}
        <div className="review-upload-section">
          <div className="review-upload-label">
            <span className="review-upload-text">Event Flyer</span>
            <div className="review-upload-description">
              Uploaded flyer preview.
            </div>
          </div>
          <div className="review-upload-area">
            {eventData.flyerPreview ? (
              <img
                src={eventData.flyerPreview}
                alt="Event Flyer"
                className="review-flyer-preview"
              />
            ) : (
              <div className="review-upload-placeholder">
                No flyer uploaded
              </div>
            )}
          </div>
        </div>

        {/* === 2️⃣ Event Details Card === */}
        <div className="review-form">
          <div className="review-fields">
            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Event Name</label>
                <p className="review-value">{eventData.eventName}</p>
              </div>
              <div className="review-group">
                <label className="review-label">State</label>
                <p className="review-value">{eventData.location}</p>
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
                <p className="review-value">
                  {eventData.dressCode || 'N/A'}
                </p>
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label">Event Description</label>
              <p className="review-value">{eventData.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === 3️⃣ Feature Toggle + Contact Card === */}
      <div className="review-form">
        <div className="review-fields">
          {/* Toggle */}
          <div className="toggle-group">
            <button
              className={
                eventData.featureChoice === 'no-feature' ? 'active' : ''
              }
            >
              No, I do not want to feature my event.
            </button>
            <button
              className={
                eventData.featureChoice === 'yes-feature' ? 'active' : ''
              }
            >
              Yes, I want to feature my event.
            </button>
          </div>

          {/* Contact Method (only if featuring) */}
          {eventData.featureChoice === 'yes-feature' && (
            <>
              <div className="review-group review-full">
                <label className="review-label">
                  We’ll need a way to reach you
                </label>
                <p className="review-value">{eventData.contactMethod}</p>
              </div>
              <div className="review-group review-full">
                <label className="review-label">Contact Value</label>
                <p className="review-value">{eventData.contactValue}</p>
              </div>
            </>
          )}

          {/* Additional Link */}
          <div className="review-group review-full">
            <label className="review-label">Additional Information Link</label>
            <p className="review-value">{eventData.link || 'None'}</p>
          </div>
        </div>
      </div>

      {/* === 4️⃣ Footer Actions === */}
      <footer className="review-footer">
        <button
          className="review-back-btn"
          onClick={() => navigate('/promoteevent')}
        >
          ← Back to Details
        </button>
        <button
          className="review-back-btn"
          onClick={() => navigate('/featureevent')}
        >
          ← Back to Feature
        </button>
        <button className="review-submit-btn" onClick={handleSubmit}>
          Submit Event
        </button>
      </footer>

      {/* === Modal for feedback === */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        type={modalInfo.type}
      />
    </div>
  );
};

export default EventReview;
