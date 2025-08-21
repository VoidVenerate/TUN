// === EventDetails.jsx ===
import React from "react";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

const EventDetails = () => {
  // Demo data (you can replace later with props or API data)
  const demoEvent = {
    flyerPreview: "https://via.placeholder.com/400x250.png?text=Event+Flyer",
    eventName: "TurnUp Lagos Concert",
    location: "Lagos, Nigeria",
    venue: "Eko Convention Center",
    date: "2025-09-15",
    time: "7:00 PM",
    dressCode: "All White",
    description:
      "Join us for the biggest music concert in Lagos featuring top local and international artists.",
    featureChoice: "yes-feature",
    contactMethod: "Email",
    contactValue: "info@turnuplagos.com",
    link: "www.turnuplagos.com",
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <NavLink to='/home'><ArrowLeft className="event-unique-back" /></NavLink>
        <h1 className="review-header-title" style={{ fontFamily: "Rushon Ground" }}>
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
            {demoEvent.flyerPreview ? (
              <img
                src={demoEvent.flyerPreview}
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
                <p className="review-value">{demoEvent.eventName}</p>
              </div>
              <div className="review-group">
                <label className="review-label">State</label>
                <p className="review-value">{demoEvent.location}</p>
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Venue</label>
                <p className="review-value">{demoEvent.venue}</p>
              </div>
              <div className="review-group">
                <label className="review-label">Date</label>
                <p className="review-value">{demoEvent.date}</p>
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label">Time</label>
                <p className="review-value">{demoEvent.time}</p>
              </div>
              <div className="review-group">
                <label className="review-label">Dress Code</label>
                <p className="review-value">{demoEvent.dressCode}</p>
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label">Event Description</label>
              <p className="review-value">{demoEvent.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature + Contact */}
      <div className="review-form">
        <div className="review-fields">
          <div className="toggle-group">
            <button className={demoEvent.featureChoice === "no-feature" ? "active" : ""}>
              No, I do not want to feature my event.
            </button>
            <button className={demoEvent.featureChoice === "yes-feature" ? "active" : ""}>
              Yes, I want to feature my event.
            </button>
          </div>

          {demoEvent.featureChoice === "yes-feature" && (
            <>
              <div className="review-group review-full">
                <label className="review-label">We'll need a way to reach you</label>
                <p className="review-value">{demoEvent.contactMethod}</p>
              </div>
              <div className="review-group review-full">
                <label className="review-label">Contact Value</label>
                <p className="review-value">{demoEvent.contactValue}</p>
              </div>
            </>
          )}

          <div className="review-group review-full">
            <label className="review-label">Additional Information Link</label>
            <p className="review-value">{demoEvent.link}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
