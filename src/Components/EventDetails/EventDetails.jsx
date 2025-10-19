// === EventDetails.jsx ===
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { useEvent } from "../EventContext/EventContext";
import api from "../api";

const EventDetails = () => {
  const { event_id } = useParams();
  const { eventData, setEventData } = useEvent();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!event_id) return;

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/event/events`, {
          params: { id: event_id },
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data[0];
        if (!data) throw new Error("Event not found");

        const normalizedData = {
          ...data,
          flyerPreview: data.flyer_url
            ? data.flyer_url
            : data.event_flyer
            ? `https://lagos-turnup.onrender.com/${data.event_flyer.replace(
                /^\//,
                ""
              )}`
            : "",
          featureChoice: data.is_featured ? "yes-feature" : "no-feature",
        };

        setEventData(normalizedData);
      } catch (err) {
        console.error("Failed to fetch event", err);
        setError("Could not load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [event_id, setEventData]);

  if (loading) {
    return <div className="review-container">Loading event details...</div>;
  }

  if (error) {
    return <div className="review-container">{error}</div>;
  }

  if (!eventData) {
    return <div className="review-container">No event found.</div>;
  }

  return (
    <div className="review-container">
      <header className="review-header">
        <NavLink to="/home">
          <ArrowLeft className="event-unique-back" />
        </NavLink>
        <h1
          className="review-header-title"
          style={{ fontFamily: "Rushon Ground" }}
        >
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
              <img
                src={eventData.flyerPreview}
                alt="Event Flyer"
                className="review-flyer-preview"
                onError={(e) => (e.target.src = "/placeholder.png")}
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
                <label className="review-label">Gate Fee</label>
                <p className="review-value">{eventData.dress_code}</p>
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label">Event Description</label>
              <p className="review-value">{eventData.event_description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature + Contact */}
      <div className="review-form">
        <div className="review-fields">
          <div className="toggle-group">
            <button
              className={eventData.featureChoice === "no-feature" ? "active" : ""}
              disabled
            >
              No, I do not want to feature my event.
            </button>
            <button
              className={eventData.featureChoice === "yes-feature" ? "active" : ""}
              disabled
            >
              Yes, I want to feature my event.
            </button>
          </div>

          {eventData.featureChoice === "yes-feature" && (
            <>
              <div className="review-group review-full">
                <label className="review-label">We'll need a way to reach you</label>
                <p className="review-value">{eventData.contact_method}</p>
              </div>
              <div className="review-group review-full">
                <label className="review-label">Contact Value</label>
                <p className="review-value">{eventData.contact_value}</p>
              </div>
            </>
          )}

          <div className="review-group review-full">
            <label className="review-label">Additional Information Link</label>
            <p className="review-value">{eventData.link}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
