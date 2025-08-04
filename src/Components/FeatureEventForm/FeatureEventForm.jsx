// FeatureEventForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../EventContext/EventContext';
import './FeatureEventForm.css';

const FeatureEventForm = () => {
  const navigate = useNavigate();

  // Get event data and updater from global context
  const { eventData, setEventData } = useEvent();

  // Local state for form error messages
  const [error, setError] = useState("");

  /**
   * Validate form inputs
   * - If user wants to feature event ("yes-feature") but has no contact info, return an error message
   */
  const validateForm = () => {
    if (eventData.featureChoice === "yes-feature" && !eventData.contactValue) {
      return 'Contact Information is needed';
    }
    return "";
  };

  /**
   * Handle navigation to review page
   * - Checks for validation errors before moving to /review
   */
  const handleNext = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError); // Show error if validation fails
      return;
    }
    navigate("/review"); // Go to review page if form is valid
  };

  return (
    // Form container
    <form 
      className="feature-event-container"
      onSubmit={(e) => {
        e.preventDefault(); // Prevent page reload
        handleNext(); // Proceed to next step if valid
      }}
    >

      {/* === Feature Choice Section === */}
      <div className="feature-section">
        <h2 className="feature-title">
          Feature your event on TurnUpLagos *
        </h2>
        <p className="feature-description">
          Want more eyes on your event? We'll reach out to discuss featuring options and pricing.
        </p>
        
        {/* Buttons for choosing Yes or No to feature */}
        <div className="feature-buttons">
          <button 
            type="button"
            className={eventData.featureChoice === 'no-feature' ? "feature-btn active" : "feature-btn"} 
            onClick={() => setEventData(prev => ({ ...prev, featureChoice: "no-feature" }))}
          >
            No, I do not want to feature my event
          </button>
          <button 
            type="button"
            className={eventData.featureChoice === 'yes-feature' ? "feature-btn active" : "feature-btn"} 
            onClick={() => setEventData(prev => ({ ...prev, featureChoice: "yes-feature" }))}
          >
            Yes, I want to feature my event
          </button>
        </div>
      </div>

      {/* === Contact Info Section (only visible if "Yes" is selected) === */}
      {eventData.featureChoice === "yes-feature" && (
        <div className="contact-section">
          <h3 className="contact-title">
            📧 We'll need a way to reach you *
          </h3>
          <p className="contact-description">
            Select your preferred contact method so we can discuss pricing and promotion details.
          </p>

          <div className="contact-form">
            {/* Dropdown for selecting contact method */}
            <div className="contact-group">
              <select 
                className="contact-select"
                value={eventData.contactMethod}
                onChange={(e) =>
                  setEventData(prev => ({ ...prev, contactMethod: e.target.value, contactValue: "" }))
                }
              >
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            {/* Input for entering contact value (depends on method selected) */}
            <input 
              className="contact-input" 
              placeholder={`Enter your ${eventData.contactMethod}`}
              value={eventData.contactValue}
              onChange={(e) =>
                setEventData(prev => ({ ...prev, contactValue: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {/* === Additional Info Section === */}
      <div className="additional-info-section">
        <h3 className="additional-title">Additional Information Link</h3>
        <p className="additional-description">
          Add any link that gives attendees more context — could be a WhatsApp group, ticket page, Linktree, or Snapchat link.
        </p>
        
        {/* Input for extra link */}
        <div className="additional-input-group">
          <input 
            type="url" 
            className="additional-input" 
            placeholder="Paste a link (WhatsApp, Linktree, etc.) or leave blank"
            value={eventData.link}
            onChange={(e) => setEventData(prev => ({ ...prev, link: e.target.value }))}
          />
        </div>
      </div>

      {/* === Error Message Display === */}
      {error && <p className="error-message">{error}</p>}

      {/* === Form Footer (Submit Button) === */}
      <div className="form-footer">
        <button type="submit" className="create-event-btn">
          Review
        </button>
      </div>
    </form>
  );
};

export default FeatureEventForm;
