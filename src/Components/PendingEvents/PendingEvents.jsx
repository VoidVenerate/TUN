import React, { useEffect, useState } from "react";
import { Search,Check, Trash2  } from "lucide-react";
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

  // 🚀 Fetch only pending events
  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/event/events?pending=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching pending events:", err);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  // ✅ Approve event
  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.put(`/event/approve-event/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalInfo({
        show: true,
        title: "Event Approved",
        message: "Event successfully approved.",
        type: "success",
      });

      fetchPendingEvents();
    } catch (err) {
      console.error(err);
      setModalInfo({
        show: true,
        title: "Error",
        message: "Could not approve event.",
        type: "error",
      });
    }
  };

  // ❌ Reject (Delete) event
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.delete(`/event/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalInfo({
        show: true,
        title: "Event Rejected",
        message: "Event successfully deleted.",
        type: "success",
      });

      fetchPendingEvents();
    } catch (err) {
      console.error(err);
      setModalInfo({
        show: true,
        title: "Error",
        message: "Could not reject event.",
        type: "error",
      });
    }
  };

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
                <img 
                src={
                    event.flyer_url.startsWith('http')
                    ? event.flyer_url
                    : `https://lagos-turnup.onrender.com/${event.flyer_url}`
                } 
                alt={event.event_name} 
                />

                <h3>{event.event_name}</h3>
                <div className="event-txt">
                    <p>{event.venue}, {event.state}</p>
                    <p>{event.date} @ {event.time}</p>
                </div>
                <p>{event.event_description}</p>
                </div>
                <div className="event-actions">
                <button onClick={() => handleAccept(event.id)} className="approve-btn"><Check size={16} />Approve</button>
                <button onClick={() => handleReject(event.id)} className="reject-btn"><Trash2 size={16} /> Reject</button>
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
