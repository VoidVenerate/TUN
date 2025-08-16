// EventDetailsContent.jsx
import React from 'react';

const EventDetailsContent = ({
  eventData,
  onBackDetails,
  onBackFeature,
  onSubmit,
  renderExtraButtons, // optional custom buttons to render
}) => {
  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          EVENT DETAILS
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
        {/* === Feature Choice inside details === */}
    <div className="review-group review-full">
      <label className="review-label">Feature Choice</label>
      <div className="toggle-group">
        <button className={eventData.featureChoice === 'no-feature' ? 'active' : ''}>
          No, I do not want to feature my event.
        </button>
        <button className={eventData.featureChoice === 'yes-feature' ? 'active' : ''}>
          Yes, I want to feature my event.
        </button>
      </div>
    </div>

    {/* Contact Method & Value if featuring */}
    {eventData.featureChoice === 'yes-feature' && (
      <>
        <div className="review-group review-full">
          <label className="review-label">We’ll need a way to reach you</label>
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

      {/* Footer Actions */}
      <footer className="review-footer">

        {/* Render any extra custom buttons */}
        {renderExtraButtons && renderExtraButtons()}
      </footer>
    </div>
  );
};

export default EventDetailsContent;
