import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Modal from "../Modal/Modal";
import api from "../api";
import "./PendingEvents.css";

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    subMessage: "",
    type: "",
  });

  const navigate = useNavigate();

  // 🚀 Fetch only pending events
  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/event/events?pending=true", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching pending events:", err);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  // 🔎 Filter by search
  const filteredEvents = events.filter((event) =>
    event.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📖 Pagination
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  return (
    <div className="pending-events-manager">
      {/* Header */}
      <div className="pendingEvents-header">
        <p>Pending Events</p>
      </div>

      {/* Search */}
      <div className="pending-events-controls">
        <div className="event-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Event list */}
      <div className="pending-Events">
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="events">
                <LazyLoadImage
                  src={
                    event.flyer_url?.includes("://") && event.flyer_url.includes(".com/")
                      ? event.flyer_url
                      : `https://lagos-turnup.onrender.com/${event.event_flyer?.replace(/^\//, "")}`
                  }
                  alt={event.event_name}
                  loading="lazy"
                  effect="blur"
                />
                <div className="event-txt">
                  <h3>{event.event_name}</h3>
                  <p>
                    {event.state} 
                  </p>
                </div>
                <p>{event.event_description}</p>
              </div>

              {/* ✅ Single Edit Button */}
              <div className="event-actions">
                <button onClick={() => navigate(`/takeaction/${event.id}`)}>
                  Take Action
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#ccc" }}>No pending events found.</p>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > eventsPerPage && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                indexOfLast < filteredEvents.length ? p + 1 : p
              )
            }
            disabled={indexOfLast >= filteredEvents.length}
          >
            Next Page
          </button>
        </div>
      )}

      {/* Modal */}
      {modalInfo.show && (
        <Modal
          show={modalInfo.show}
          title={modalInfo.title}
          message={modalInfo.message}
          subMessage={modalInfo.subMessage}
          type={modalInfo.type}
          onClose={() => setModalInfo({ ...modalInfo, show: false })}
        />
      )}
    </div>
  );
};

export default PendingEvents;
