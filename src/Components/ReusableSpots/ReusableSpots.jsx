import React, { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Modal from "../Modal/Modal";
import api from "../api";
import Loader from "../Loader/Loader";
import './ReusableSpots.css'

const ReusableSpots = ({ spotType, addPath, editPath }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const [detailsSpot, setDetailsSpot] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    footerButtons: null,
    onConfirm: null, // 🔑 for confirmation modals
  });

  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // ✅ Centralized URL normalization
  const normalizeUrl = (path) => {
    if (!path) return "/placeholder.png";
    let url = path.trim();
    url = url.replace(/\.comuploads/, ".com/uploads");
    if (!url.startsWith("http")) {
      url = `https://lagos-turnup.onrender.com/${url.replace(/^\/?/, "")}`;
    }
    return url;
  };

  const token = localStorage.getItem("token")

  const handleClick = (index, type, spotId) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null });
    } else {
      setActiveBtn({ index, type });
    }

    if (type === "details" && spotId) {
      navigate(`${editPath}/${spotId}`);
    }
  };

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `https://lagos-turnup.onrender.com/event/spots/type/${spotType}?page=${currentPage}&search=${searchTerm}`
        );

        const fetched = res.data.spots || res.data[spotType] || res.data;

        const normalized = fetched.map((s) => ({
          ...s,
          spot_id: s.spot_id || s.id,
          name: s.location_name,
          location: `${s.city}, ${s.state}`,
          description: s.additional_info,
          flyerSrc: normalizeUrl(s.cover_image || s.image || ""),
        }));

        setSpots(normalized);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        setError(`Failed to fetch ${spotType}s.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [spotType, currentPage, searchTerm]);

  // Sort spots by name
  const sortedSpots = [...spots].sort((a, b) => {
    if (!a.name || !b.name) return 0;
    return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  // 🔑 Delete handler with confirmation + inline removal
  const handleDelete = (spot_id) => {
    if (!spot_id) {
      setModalFeedback({
        show: true,
        title: "Error",
        type: "error",
        message: "No spot ID to delete.",
        footerButtons: (
          <button className="modal-close-btn" onClick={() => setModalFeedback((p) => ({ ...p, show: false }))}>
            Close
          </button>
        ),
      });
      return;
    }

    setModalFeedback({
      show: true,
      title: "",
      type: "duration",
      message: "Are you sure you want to delete this spot?",
      subMessage: 'This location will be permanently removed from Discover Lagos and will no longer be visible to users. This action cannot be undone.',
      footerButtons: (
        <>
          <button
            className="modal-btn-primary"
            onClick={async () => {
              setDeleting(true);
              try {
                await api.delete(`/event/spots/${spot_id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                } );
                setSpots((prev) => prev.filter((s) => s.spot_id !== spot_id));
                setModalFeedback({
                  show: true,
                  title: "Deleted",
                  type: "success",
                  message: "Spot deleted successfully.",
                  footerButtons: (
                    <button
                      className="modal-close-btn"
                      onClick={() => setModalFeedback((p) => ({ ...p, show: false }))}
                    >
                      Close
                    </button>
                  ),
                });
              } catch (err) {
                setModalFeedback({
                  show: true,
                  title: "Error",
                  type: "error",
                  message: "Failed to delete spot.",
                  footerButtons: (
                    <button
                      className="modal-close-btn"
                      onClick={() => setModalFeedback((p) => ({ ...p, show: false }))}
                    >
                      Close
                    </button>
                  ),
                });
              } finally {
                setDeleting(false);
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="modal-close-btn"
            onClick={() => setModalFeedback((p) => ({ ...p, show: false }))}
          >
            Cancel
          </button>
        </>
      ),
    });
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  if (error) return <p>{error}</p>;
  if (loading) return <Loader/>

  return (
    <div>
      <div className="adminEvents-header">
        <p style={{ fontFamily: "Rushon Ground" }}>
          {spotType.charAt(0).toUpperCase() + spotType.slice(1)}s
        </p>
        <button className="sort-bar" onClick={() => setSortAsc((prev) => !prev)}>
          Sort Name {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      <div className="admin-Events">
        {sortedSpots.length === 0 && <p>No {spotType}s found.</p>}
        {sortedSpots.map((spot, index) => (
          <div key={spot.spot_id || index} className="event-card">
            <div className="events">
              {spot.flyerSrc ? (
                <LazyLoadImage
                  src={spot.flyerSrc}
                  alt={spot.name}
                  loading="lazy"
                  effect="blur"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "150px", background: "#ccc" }}>No image</div>
              )}
              <div className="event-txt">
                <h3>{spot.name}</h3>
                <p>{spot.location}</p>
              </div>
              <p>{truncateWords(spot.description, 17)}</p>
              <div className="slider-btn">
                <button
                  className={activeBtn.index === index && activeBtn.type === "details" ? "active" : ""}
                  onClick={() => handleDelete(spot.spot_id)}
                  style={{
                    backgroundColor: "rgba(255, 60, 60, 0.1)",
                    color: "#ff3b30",
                    border: "0.5px solid rgba(255, 60, 60, 0.26)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size="16" style={{ marginRight: "10px" }} />
                  Delete {spotType}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
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
          onClick={() => setCurrentPage((p) => (totalPages ? Math.min(p + 1, totalPages) : p + 1))}
          disabled={totalPages ? currentPage === totalPages : false}
        >
          Next
        </button>
      </div>

      {/* Spot details modal */}
      <Modal
        show={!!detailsSpot}
        title={detailsSpot?.name}
        onClose={() => setDetailsSpot(null)}
        message={
          detailsSpot ? (
            <>
              {detailsSpot.flyerSrc && (
                <img src={detailsSpot.flyerSrc} alt={detailsSpot.name} style={{ maxWidth: "100%", marginBottom: 10 }} />
              )}
              <p>
                <strong>Location:</strong> {detailsSpot.location}
              </p>
              <p>
                <strong>Description:</strong> {detailsSpot.description}
              </p>
            </>
          ) : (
            ""
          )
        }
        footerButtons={
          <button className="modal-close-btn" onClick={() => setDetailsSpot(null)}>
            Close
          </button>
        }
      />

      {/* Delete + feedback modal */}
      <Modal
        show={modalFeedback.show}
        onClose={() => setModalFeedback((p) => ({ ...p, show: false }))}
        title={modalFeedback.title}
        message={modalFeedback.message}
        subMessage={modalFeedback.subMessage}
        type={modalFeedback.type}
        footerButtons={modalFeedback.footerButtons}
      />
    </div>
  );
};

export default ReusableSpots;
