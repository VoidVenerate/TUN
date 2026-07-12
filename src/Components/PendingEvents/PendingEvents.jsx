import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Modal from "../Modal/Modal";
import "./PendingEvents.css";
import SearchBar from "../SearchBar/SearchBar";
import { usePendingEvents } from "../../hooks/queries/useEvents";

const PendingEvents = () => {
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
  const location = useLocation();
  const { data: events = [], isLoading, refetch } = usePendingEvents();

  useEffect(() => {
    if (location.state?.refresh) {
      refetch();
    }
  }, [location.state?.refresh, refetch]);

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        event.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [events, searchTerm]
  );

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  if (isLoading) {
    return <p style={{ color: "#ccc", padding: "2rem" }}>Loading pending events...</p>;
  }

  return (
    <div className="pending-events-manager">
      <div className="pendingEvents-header">
        <p style={{ fontFamily: "Rushon Ground" }}>Pending Events</p>
        <div className="pending-events-controls">
          <SearchBar
            onSearch={(query) => {
              setSearchTerm(query);
              setCurrentPage(1);
            }}
          />
        </div>
        <h4 onClick={() => navigate("/pendingBanner")}>Pending Banner</h4>
      </div>

      <div className="pending-Events">
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="events">
                <LazyLoadImage
                  src={
                    event.flyer_url?.includes("://") && event.flyer_url.includes(".com/")
                      ? event.flyer_url
                      : `https://lagos-turnup-ecy5.onrender.com/${event.event_flyer?.replace(/^\//, "")}`
                  }
                  alt={event.event_name}
                  loading="lazy"
                  effect="blur"
                />
                <div className="event-txt">
                  <h3>{event.event_name}</h3>
                  <p>{event.state}</p>
                </div>
                <p>{truncateWords(event.event_description, 15)}</p>
              </div>

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
