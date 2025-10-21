import React, { useState } from 'react';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import { useAuth } from '../RoleContext/RoleContext';
import axios from 'axios';
import './EventReview.css';
import { ChevronLeft } from 'lucide-react';

const EventReview = () => {
  const { eventData, setEventData } = useEvent();
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
    if (eventData.featureChoice === "yes-feature" && !eventData.featureDuration) {
      setShowFeatureDuration(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('event_name', eventData.eventName);
      formData.append('state', eventData.location);
      formData.append('venue', eventData.venue);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('dress_code', eventData.dressCode || '');
      formData.append('event_description', eventData.description || '');
      formData.append('is_featured', eventData.featureChoice === 'yes-feature');
      formData.append('feature_duration', eventData.featureDuration || '');
      formData.append('contact_method', eventData.contactMethod || '');
+     formData.append('contact_link', eventData.link || '');
+     formData.append('phone_no', eventData.phoneNo || '');

      if (eventData.flyer) formData.append('event_flyer', eventData.flyer);

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) headers.Authorization = `Bearer ${token}`;

      

      const response = await axios.post(
        'https://lagos-turnup.onrender.com/event/events/create',
        formData,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        setModalInfo({
          show: true,
          title: '',
          message: 'Event submitted successfully.',
          subMessage:
            rules.role === 'sub-admin' || rules.role === 'super-admin'
              ? "Thanks for submitting your event. It's now live on TurnUpLagos!"
              : "Thanks for submitting your event. Our team will review it and publish it within 24-48 hours.",
          type: 'success',
          footerButtons: (
            <>
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
              <button
                className="modal-close-btn"
                onClick={() => {
                  closeModal();
                  navigate('/adminpromoteevent');
                }}
              >
                Create Another Event
              </button>
            </>
          ),
        });
      } else throw new Error('Failed to submit event');
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

  const closeModal = () => setModalInfo(prev => ({ ...prev, show: false }));

  return (
    <div className="event-review">
      <header className="event-review__header">
        <h1 className="event-review__title" style={{ fontFamily: 'Rushon Ground' }}>
          <ChevronLeft size={24} onClick={() => navigate(-1)} /> EVENT REVIEW
        </h1>
      </header>

      <div className="event-review__content">
        {/* Flyer Preview */}
        <div className="event-review__upload">
          <div className="event-review__upload-label">
            <span className="event-review__upload-text">Event Flyer</span>
            <div className="event-review__upload-description">Uploaded flyer preview.</div>
          </div>
          <div className="event-review__upload-area">
            {eventData.flyerPreview ? (
              <img src={eventData.flyerPreview} alt="Event Flyer" className="event-review__flyer" />
            ) : (
              <div className="event-review__upload-placeholder">No flyer uploaded</div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="event-review__form">
          <div className="event-review__fields">
            <div className="event-review__row">
              <div className="event-review__group">
                <label className="event-review__label">Event Name</label>
                <p className="event-review__value">{eventData.eventName}</p>
              </div>
              <div className="event-review__group">
                <label className="event-review__label">State</label>
                <p className="event-review__value">{eventData.location}</p>
              </div>
            </div>

            <div className="event-review__row">
              <div className="event-review__group">
                <label className="event-review__label">Venue</label>
                <p className="event-review__value">{eventData.venue}</p>
              </div>
              <div className="event-review__group">
                <label className="event-review__label">Date</label>
                <p className="event-review__value">{eventData.date}</p>
              </div>
            </div>

            <div className="event-review__row">
              <div className="event-review__group">
                <label className="event-review__label">Time</label>
                <p className="event-review__value">{eventData.time}</p>
              </div>
              <div className="event-review__group">
                <label className="event-review__label">Gate Fee</label>
                <p className="event-review__value">{eventData.dressCode || 'N/A'}</p>
              </div>
            </div>

            <div className="event-review__group event-review__group--full">
              <label className="event-review__label">Event Description</label>
              <p className="event-review__value" style={{ height: '280px' }}>{eventData.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggle + Contact */}
      <div className="event-review__form">
        <div className="event-review__fields">
          <div className="event-review__toggle-group">
            <button className={eventData.featureChoice === 'no-feature' ? 'active' : ''}>
              No, I do not want to feature my event.
            </button>
            <button className={eventData.featureChoice === 'yes-feature' ? 'active' : ''}>
              Yes, I want to feature my event.
            </button>
          </div>

          {eventData.featureChoice === 'yes-feature' && (
            <>
              <div className="event-review__group event-review__group--full">
                <label className="event-review__label">We'll need a way to reach you</label>
                <p className="event-review__value">{eventData.contactMethod}</p>
              </div>
              <div className="event-review__group event-review__group--full">
                <label className="event-review__label">Contact Value</label>
                <p className="event-review__value">{eventData.contactValue}</p>
              </div>
            </>
          )}
          <div className="event-review__group event-review__group--full">
                <label className="event-review__label">Phone Number</label>
                <p className="event-review__value">{eventData.phoneNo}</p>
              </div>

          <div className="event-review__group event-review__group--full">
            <label className="event-review__label">Additional Information Link</label>
            <p className="event-review__value">{eventData.link || 'None'}</p>
          </div>
        </div>
      </div>

      <footer className="event-review__footer">
        <button
          className="event-review__btn--back"
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
          className="event-review__btn--back"
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

        <button
          className="event-review__btn--submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Event'}
        </button>
      </footer>

      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        type={modalInfo.type}
        footerButtons={modalInfo.footerButtons}
      />

      {showFeatureDuration && (
        <FeatureDuration
          role={rules.role}
          show={showFeatureDuration}
          onClose={() => setShowFeatureDuration(false)}
          onConfirm={(duration) => {
            setEventData(prev => ({ ...prev, featureDuration: duration }));
            setShowFeatureDuration(false);
            handleSubmit();
          }}
        />
      )}
    </div>
  );
};

export default EventReview;
