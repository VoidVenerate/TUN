import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../EventContext/EventContext';
import { useAuth } from '../RoleContext/RoleContext'; // Import useAuth hook
import './FeatureEventForm.css';

const FeatureEventForm = () => {
  const navigate = useNavigate();

  // Get event data and updater from global context
  const { eventData, setEventData } = useEvent();

  // Get rules (including role) from auth context
  const { rules } = useAuth();

  // Local state for form error messages
  const [error, setError] = useState("");

  // Validate form inputs
  const validateForm = () => {
    if (eventData.featureChoice === "yes-feature" && !eventData.contactValue) {
      return 'Contact Information is needed';
    }
    if (eventData.phoneNo === "no-feature") {
      const phone = eventData.phoneNo?.trim()
      const phoneRegex = /^\+?[0-9]{8,15}$/;

      if (!phone) {
        return 'Phone number is required'
      }
      if (!phoneRegex.test(phone)) {
        return 'Enter valid phone number'
      }
    } 
    return "";
  };

  // Handle navigation to review page or role-based page
  const handleNext = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Navigate based on role
    if (rules.role === 'sub-admin' || rules.role === 'super-admin') {
      navigate('/adminreviewevent'); // example admin feature review page
    } else {
      navigate('/review'); // example user feature review page
    }
  };

  return (
    <form
      className="feature-event-container"
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      {/* === Feature Choice Section === */}
      <div className="feature-section">
        <h2 className="feature-title">
          Feature your event on TurnUpLagos<span style={{color:"red"}}>*</span>
        </h2>
        <p className="feature-description">
          Want more eyes on your event? We'll reach out to discuss featuring options and pricing.
        </p>

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

      {/* === Contact Info Section === */}
      {eventData.featureChoice === "yes-feature" && (
        <div className="contact-section">
          <h3 className="contact-title">
            📧 We'll need a way to reach you<span style={{color:"red"}}>*</span>
          </h3>
          <p className="contact-description">
            Select your preferred contact method so we can discuss pricing and promotion details.
          </p>

          <div className="contact-form">
            <div className="contact-group">
              <select
                className="contact-select"
                value={eventData.contactMethod}
                onChange={(e) =>
                  setEventData(prev => ({ ...prev, contactMethod: e.target.value, contactValue: "" }))
                }
              >
                <option value="email">Email Address</option>
              </select>
            </div>

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
      <div className="contact-section">
        <h3 className="contact-title">
          Phone Number (for follow-up or confirmation)<span style={{color:"red"}}>*</span>
        </h3>
        <p className="contact-description">
          Your phone number helps us reach you if we need any clarification about your event.
        </p>

        <div className="contact-form">
          <input
            className="contact-input"
            placeholder={`Enter your phone number`}
            value={eventData.phoneNo}
            onChange={(e) =>
              setEventData(prev => ({ ...prev, phoneNo: e.target.value }))
            }
          />
        </div>
      </div>
      {/* === Additional Info Section === */}
      <div className="additional-info-section">
        <h3 className="additional-title">Additional Information Link</h3>
        <p className="additional-description">
          Add any link that gives attendees more context — could be a WhatsApp group, ticket page, Linktree, or Snapchat link.
        </p>

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
