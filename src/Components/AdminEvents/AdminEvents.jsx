import React, { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import api from "../api";
import "./AdminEvents.css";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    footerButtons: null,
  });

  const navigate = useNavigate();

  const handleClick = (index, type, eventId) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null });
    } else {
      setActiveBtn({ index, type });
    }

    if (type === "details" && eventId) {
      navigate(`/editevent/${eventId}`);
    }
  };


  const handleAddNew = () => {
    navigate("/adminpromoteevent");
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`https://lagos-turnup.onrender.com/event/events`);
        console.log("API response:", res.data);

        const fetched = res.data.events || res.data;

        const normalized = fetched.map(e => {
          let flyerSrc = "/placeholder.png"; // fallback

          if (e.event_flyer) {
            // ✅ event_flyer is usually a relative path (safer to prefer this)
            flyerSrc = `https://lagos-turnup.onrender.com/${e.event_flyer.replace(/^\/?/, "")}`;
          } else if (e.flyer_url) {
            // ✅ fix common API bug: missing slash after domain
            flyerSrc = e.flyer_url.replace(/onrender\.com\/?uploads/, "onrender.com/uploads");

            // in case flyer_url is just a relative path without https://
            if (!flyerSrc.startsWith("http")) {
              flyerSrc = `https://lagos-turnup.onrender.com/${flyerSrc.replace(/^\/?/, "")}`;
            }
          }

          return {
            ...e,
            event_id: e.event_id || e.id,
            flyerSrc,
          };
        });

        setEvents(normalized);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        setError("Failed to fetch events.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, searchTerm]);



  // Sort events client-side by title
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.event_name || !b.event_name) return 0;
    return sortAsc
      ? a.event_name.localeCompare(b.event_name)
      : b.event_name.localeCompare(a.event_name);
  });

  // Delete event handler
  const handleConfirmDelete = async () => {
    if (!deleteEvent) return;
    try {
      await api.delete(
        `https://lagos-turnup.onrender.com/event/events/${deleteEvent.event_id}`,
        { headers: { "Content-Type": "application/json" } }
      );
      setModalFeedback({
        show: true,
        type: "success",
        title: "Success",
        message: "Event deleted successfully",
        footerButtons: (
          <button
            className="modal-close-btn"
            onClick={() => {
              setModalFeedback((prev) => ({ ...prev, show: false }));
              setDeleteEvent(null);
              setCurrentPage(1);
            }}
          >
            Close
          </button>
        ),
      });
      setEvents(events.filter(e => e.event_id !== deleteEvent.event_id));
    } catch (err) {
      setModalFeedback({
        show: true,
        type: "error",
        title: "Error",
        message: "Failed to delete event",
        footerButtons: (
          <button
            className="modal-close-btn"
            onClick={() => setModalFeedback((prev) => ({ ...prev, show: false }))}
          >
            Close
          </button>
        ),
      });
      console.error(err);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  if (error) return <p>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="adminEvents-header">
        <p style={{ fontFamily: "Rushon Ground" }}>Events</p>
        <button onClick={handleAddNew}>
          <Upload size={16} /> Upload Events
        </button>
      </div>

      {/* Search and sort */}
      <div className="search-sort-bar">
        <input
          type="text"
          placeholder="Search events by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSortAsc((prev) => !prev)}>
          Sort Title {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      <div className="admin-Events">
        {sortedEvents.length === 0 && <p>No events found.</p>}
        {sortedEvents.map((event, index) => (
          <div key={event.event_id || index} className="event-card">
            <div className="events">
              {event.event_flyer ? (
                <img src={event.flyerSrc} alt={event.event_name} loading="lazy" />
              ) : (
                <div style={{ width: "100%", height: "150px", background: "#ccc" }}>No image</div>
              )}
              <div className="event-txt">
                <h3>{event.event_name}</h3>
                <p>{event.location}</p>
              </div>
              <p>{event.description}</p>
              <div className="slider-btn">
                <button
                  className={activeBtn.index === index && activeBtn.type === "details" ? "active" : ""}
                  onClick={() => handleClick(index, "details", event.event_id)}
                >
                  Edit Event
                </button>

                {activeBtn.index === index && activeBtn.type === "details" && (
                  <div className="actions-dropdown">
                    <button onClick={() => setDetailsEvent(event)}>View Details</button>
                    <button onClick={() => setDeleteEvent(event)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        {pageNumbers.map((num) => (
          <button key={num} onClick={() => setCurrentPage(num)} className={num === currentPage ? "active-page" : ""}>
            {num}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => (totalPages ? Math.min(prev + 1, totalPages) : prev + 1))}
          disabled={totalPages ? currentPage === totalPages : false}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <Modal
        show={!!detailsEvent}
        title={detailsEvent?.event_name}
        onClose={() => setDetailsEvent(null)}
        message={
          detailsEvent ? (
            <>
              {detailsEvent.flyerSrc && (
                <img
                  src={detailsEvent.flyerSrc}
                  alt={detailsEvent.event_name}
                  style={{ maxWidth: "100%", marginBottom: 10 }}
                />
              )}
              <p><strong>Location:</strong> {detailsEvent.location}</p>
              <p><strong>Description:</strong> {detailsEvent.description}</p>
              <p><strong>Date:</strong> {detailsEvent.date || "N/A"}</p>
            </>
          ) : (
            ""
          )
        }
        footerButtons={
          <button className="modal-close-btn" onClick={() => setDetailsEvent(null)}>
            Close
          </button>
        }
      />

      <Modal
        show={!!deleteEvent}
        title="Confirm Delete"
        onClose={() => setDeleteEvent(null)}
        message={`Are you sure you want to delete the event "${deleteEvent?.event_name}"?`}
        footerButtons={
          <>
            <button className="modal-btn-danger" onClick={handleConfirmDelete}>
              Yes, Delete
            </button>
            <button className="modal-close-btn" onClick={() => setDeleteEvent(null)}>
              Cancel
            </button>
          </>
        }
      />

      <Modal
        show={modalFeedback.show}
        onClose={() => setModalFeedback((prev) => ({ ...prev, show: false }))}
        title={modalFeedback.title}
        message={modalFeedback.message}
        type={modalFeedback.type}
        footerButtons={modalFeedback.footerButtons}
      />
    </div>
  );
};

export default AdminEvents;
