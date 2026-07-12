import React, { useMemo, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import "./AdminEvents.css";
import { useEvent } from "../EventContext/EventContext";
import placeholder from '../../assets/placeholder.png'
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Loader from "../Loader/Loader";
import SearchBar from "../SearchBar/SearchBar";
import { CalendarDays } from "lucide-react";
import { useAdminEvents } from "../../hooks/queries/useEvents";

const EVENTS_PER_PAGE = 6;

const normalizeUrl = (path) => {
  if (!path) return "/placeholder.png";
  let url = path.trim();
  url = url.replace(/\.comuploads/, ".com/uploads");
  if (!url.startsWith("http")) {
    url = `https://lagos-turnup-ecy5.onrender.com.com/${url.replace(/^\/?/, "")}`;
  }
  return url;
};

const AdminEvents = () => {
  const [currentPage, setCurrentPage] = useState(1);
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
  const { data: rawEvents = [], isLoading, isError } = useAdminEvents();

  const events = useMemo(
    () =>
      rawEvents.map((e) => ({
        ...e,
        event_id: e.event_id || e.id,
        flyerSrc: normalizeUrl(e.event_flyer || e.flyer_url || e.flyer || ""),
      })),
    [rawEvents]
  );

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    const q = searchTerm.toLowerCase();
    return events.filter((e) => e.event_name?.toLowerCase().includes(q));
  }, [events, searchTerm]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return sortAsc ? dateB - dateA : dateA - dateB;
    });
  }, [filteredEvents, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / EVENTS_PER_PAGE));

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return sortedEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [sortedEvents, currentPage]);

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h < 12 ? "AM" : "PM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
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

  if (isError) return <p>Failed to fetch events.</p>;
  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="adminEvents-header">
        <p style={{ fontFamily: "Rushon Ground" }}>Events</p>
        <div className="pending-events-controls">
          <SearchBar
            onSearch={(query) => {
              setSearchTerm(query);
              setCurrentPage(1);
            }}
          />
        </div>
        <button onClick={handleAddNew} className="button">
          <Upload size={16} /> Upload Events
        </button>
      </div>

      <div className="admin-Events">
        {paginatedEvents.length === 0 && <p>No events found.</p>}
        {paginatedEvents.map((event, index) => (
          <div key={event.event_id || index} className="event-card">
            <div className="events">
              {event.flyerSrc ? (
                <LazyLoadImage
                  src={event.flyerSrc}
                  alt={event.event_name}
                  loading="lazy"
                  effect="blur"
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
              <div className="LagEvents-txt">
                <h3>{event.event_name}</h3>
                <div className="LagEvents-date">
                  <CalendarDays size={16} />
                  <span>{formatDate(event.date)}</span>|<span>{formatTime(event.time)}</span>
                </div>
              </div>
              <p>{truncateWords(event.event_description, 17)}</p>
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
            Page{num}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

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
