import React, { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import api from "../api";
import "./AdminEvents.css";
import { useEvent } from "../EventContext/EventContext";
import placeholder from '../../assets/placeholder.png'

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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    footerButtons: null,
  });

  const { deleteEvent } = useEvent();
  const navigate = useNavigate();

  // ✅ Centralized URL normalization
  const normalizeUrl = (path) => {
    if (!path) return "/placeholder.png";

    let url = path.trim();

    // Fix broken domain+uploads (missing slash)
    url = url.replace(/\.comuploads/, ".com/uploads");

    // Handle relative paths (uploads/... or /uploads/...)
    if (!url.startsWith("http")) {
      url = `https://lagos-turnup.onrender.com/${url.replace(/^\/?/, "")}`;
    }

    return url;
  };

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };


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
        const res = await api.get(`https://lagos-turnup.onrender.com/event/events?pending=false`);
        console.log("API response:", res.data);

        const fetched = res.data.events || res.data;

        // ✅ cleaner mapping using normalizeUrl
        const normalized = fetched.map((e) => ({
          ...e,
          event_id: e.event_id || e.id,
          flyerSrc: normalizeUrl(
            e.event_flyer || e.flyer_url || e.flyer || "" // unify fields
          ),
        }));


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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.event_id);
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
              setDeleteTarget(null);
              setCurrentPage(1);
            }}
          >
            Close
          </button>
        ),
      });
      setEvents(events.filter((e) => e.event_id !== deleteTarget.event_id));
    } catch (err) {
      setModalFeedback({
        show: true,
        type: "error",
        title: "Error",
        message: "Failed to delete event",
        footerButtons: (
          <button
            className="modal-close-btn"
            onClick={() =>
              setModalFeedback((prev) => ({ ...prev, show: false }))
            }
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
              {event.flyerSrc ? (
                <img
                  src={event.flyerSrc}
                  alt={event.event_name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = placeholder }}
                />

              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "150px",
                    background: "#ccc",
                  }}
                >
                  No image
                </div>
              )}
              <div className="event-txt">
                <h3>{event.event_name}</h3>
                <p>{event.state}</p>
              </div>
              <p>{truncateWords(event.event_description,17)}</p>
              <div className="slider-btn">
                <button
                  className={
                    activeBtn.index === index && activeBtn.type === "details"
                      ? "active"
                      : ""
                  }
                  onClick={() => handleClick(index, "details", event.event_id)}
                >
                  Edit Event
                </button>

                {activeBtn.index === index && activeBtn.type === "details" && (
                  <div className="actions-dropdown">
                    <button onClick={() => setDetailsEvent(event)}>
                      View Details
                    </button>
                    <button onClick={() => setDeleteTarget(event)}>
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
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={num === currentPage ? "active-page" : ""}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              totalPages ? Math.min(prev + 1, totalPages) : prev + 1
            )
          }
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
              <p>
                <strong>Location:</strong> {detailsEvent.location}
              </p>
              <p>
                <strong>Description:</strong> {detailsEvent.description}
              </p>
              <p>
                <strong>Date:</strong> {detailsEvent.date || "N/A"}
              </p>
            </>
          ) : (
            ""
          )
        }
        footerButtons={
          <button
            className="modal-close-btn"
            onClick={() => setDetailsEvent(null)}
          >
            Close
          </button>
        }
      />

      <Modal
        show={!!deleteTarget}
        title="Confirm Delete"
        onClose={() => setDeleteTarget(null)}
        message={`Are you sure you want to delete the event "${deleteTarget?.event_name}"?`}
        footerButtons={
          <>
            <button className="modal-btn-danger" onClick={handleConfirmDelete}>
              Yes, Delete
            </button>
            <button
              className="modal-close-btn"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
          </>
        }
      />

      <Modal
        show={modalFeedback.show}
        onClose={() =>
          setModalFeedback((prev) => ({ ...prev, show: false }))
        }
        title={modalFeedback.title}
        message={modalFeedback.message}
        type={modalFeedback.type}
        footerButtons={modalFeedback.footerButtons}
      />
    </div>
  );
};

export default AdminEvents;
