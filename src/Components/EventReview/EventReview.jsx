import React, { useState } from 'react';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import { useAuth } from '../RoleContext/RoleContext';
import axios from 'axios';
import './EventReview.css';

const EventReview = () => {
  const { eventData } = useEvent();
  const navigate = useNavigate();
  const { rules } = useAuth();

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
    footerButtons: ''
  });

  const [showFeatureDuration, setShowFeatureDuration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('event_name', eventData.eventName);
      formData.append('state', eventData.location);
      formData.append('venue', eventData.venue);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('dress_code', eventData.dresscode || '');
      formData.append('event_description', eventData.description || '');
      formData.append('is_featured', eventData.featureChoice === 'feature'); // ✅ match context

      // ✅ Only append if user selected a flyer
      if (eventData.flyer) {
        formData.append('event_flyer', eventData.flyer);
      }

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) headers.Authorization = `Bearer ${token}`;
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await axios.post(
        'https://lagos-turnup.onrender.com/event/events/create',
        formData,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        setModalInfo({
          show: true,
          title: 'Success!',
          message: 'Event submitted successfully.',
          subMessage:
            rules.role === 'sub-admin' || rules.role === 'super-admin'
              ? "Thanks for submitting your event. It's now live on TurnUpLagos!"
              : "Thanks for submitting your event. Our team will review it and publish it on TurnUpLagos within 24-48 hours. If featured, an agent will contact you to discuss payment and promotion. We'll notify you when your event goes live!",
          type: 'success',
          footerButtons: (
            <button
              className="modal-close-btn"
              onClick={() => {
                closeModal();
                navigate(
                  rules.role === 'sub-admin' || rules.role === 'super-admin'
                    ? '/adminhome'
                    : '/home'
                );
              }}
            >
              Close
            </button>
          ),
        });
      } else {
        throw new Error('Failed to submit event');
      }
    } catch (error) {
      console.error(error);
      setModalInfo({
        show: true,
        title: 'Error!',
        message: 'Failed to submit event.',
        subMessage:
          error.response?.data?.detail?.[0]?.msg ||
          error.response?.data?.message ||
          error.message ||
          'Please try again.',
        type: 'error',
        footerButtons: (
          <button className="modal-close-btn" onClick={closeModal}>
            Close
          </button>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          EVENT REVIEW
        </h1>
      </header>

      <div className="review-content">
        {/* Flyer Preview */}
        <div className="review-upload-section">
          <div className="review-upload-label">
            <span className="review-upload-text">Event Flyer</span>
            <div className="review-upload-description">Uploaded flyer preview.</div>
          </div>
          <div className="review-upload-area">
            {eventData.flyerPreview ? (
              <img src={eventData.flyerPreview} alt="Event Flyer" className="review-flyer-preview" />
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
                <p className="review-value">{eventData.dressCode || 'N/A'}</p>
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label">Event Description</label>
              <p className="review-value">{eventData.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggle + Contact */}
      <div className="review-form">
        <div className="review-fields">
          <div className="toggle-group">
            <button className={eventData.featureChoice === 'no-feature' ? 'active' : ''}>
              No, I do not want to feature my event.
            </button>
            <button className={eventData.featureChoice === 'yes-feature' ? 'active' : ''}>
              Yes, I want to feature my event.
            </button>
          </div>

          {eventData.featureChoice === 'yes-feature' && (
            <>
              <div className="review-group review-full">
                <label className="review-label">We'll need a way to reach you</label>
                <p className="review-value">{eventData.contactMethod}</p>
              </div>
              <div className="review-group review-full">
                <label className="review-label">Contact Value</label>
                <p className="review-value">{eventData.contactValue}</p>
              </div>

              {(rules.role === 'sub-admin' || rules.role === 'super-admin') && (
                <button
                  className="open-feature-duration-btn"
                  onClick={() => setShowFeatureDuration(true)}
                >
                  Set Feature Duration
                </button>
              )}
            </>
          )}

          <div className="review-group review-full">
            <label className="review-label">Additional Information Link</label>
            <p className="review-value">{eventData.link || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="review-footer">
        <button
          className="review-back-btn"
          onClick={() =>
            navigate(
              rules.role === 'sub-admin' || rules.role === 'super-admin'
                ? '/adminpromoteevent'
                : '/promoteevent'
            )
          }
        >
          ← Back to Details
        </button>

        <button
          className="review-back-btn"
          onClick={() =>
            navigate(
              rules.role === 'sub-admin' || rules.role === 'super-admin'
                ? '/adminfeatureevent'
                : '/featureevent'
            )
          }
        >
          ← Back to Feature
        </button>

        <button className="review-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Event'}
        </button>
      </footer>

      {/* Modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        type={modalInfo.type}
        footerButtons={modalInfo.footerButtons}
      />

      {/* Feature Duration Modal */}
      {showFeatureDuration && (
        <FeatureDuration role={rules.role} onClose={() => setShowFeatureDuration(false)} />
      )}
    </div>
  );
};

export default EventReview;
