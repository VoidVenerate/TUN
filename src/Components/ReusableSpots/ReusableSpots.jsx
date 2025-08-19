import React, { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import api from "../api";

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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    footerButtons: null,
  });

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

  const handleAddNew = () => {
    navigate(addPath);
  };

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `https://lagos-turnup.onrender.com/event/spots/type/${spotType}?page=${currentPage}&search=${searchTerm}`
        );
        console.log(`API response (${spotType}):`, res.data);

        const fetched = res.data.spots || res.data[spotType] || res.data;

        const normalized = fetched.map((s) => ({
          ...s,
          spot_id: s.spot_id || s.id,
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/${spotType}/${deleteTarget.spot_id}`);
      setModalFeedback({
        show: true,
        type: "success",
        title: "Success",
        message: `${spotType} deleted successfully`,
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
      setSpots(spots.filter((s) => s.spot_id !== deleteTarget.spot_id));
    } catch (err) {
      setModalFeedback({
        show: true,
        type: "error",
        title: "Error",
        message: `Failed to delete ${spotType}`,
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
        <p style={{ fontFamily: "Rushon Ground" }}>
          {spotType.charAt(0).toUpperCase() + spotType.slice(1)}s
        </p>
        <button onClick={handleAddNew}>
          <Upload size={16} /> Upload {spotType}
        </button>
      </div>

      {/* Search and sort */}
      <div className="search-sort-bar">
        <input
          type="text"
          placeholder={`Search ${spotType}s by name`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSortAsc((prev) => !prev)}>
          Sort Name {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      <div className="admin-Events">
        {sortedSpots.length === 0 && <p>No {spotType}s found.</p>}
        {sortedSpots.map((spot, index) => (
          <div key={spot.spot_id || index} className="event-card">
            <div className="events">
              {spot.flyerSrc ? (
                <img
                  src={spot.flyerSrc}
                  alt={spot.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
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
                <h3>{spot.name}</h3>
                <p>{spot.location}</p>
              </div>
              <p>{spot.description}</p>
              <div className="slider-btn">
                <button
                  className={
                    activeBtn.index === index && activeBtn.type === "details"
                      ? "active"
                      : ""
                  }
                  onClick={() => handleClick(index, "details", spot.spot_id)}
                >
                  Edit {spotType}
                </button>

                {activeBtn.index === index && activeBtn.type === "details" && (
                  <div className="actions-dropdown">
                    <button onClick={() => setDetailsSpot(spot)}>
                      View Details
                    </button>
                    <button onClick={() => setDeleteTarget(spot)}>
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
        show={!!detailsSpot}
        title={detailsSpot?.name}
        onClose={() => setDetailsSpot(null)}
        message={
          detailsSpot ? (
            <>
              {detailsSpot.flyerSrc && (
                <img
                  src={detailsSpot.flyerSrc}
                  alt={detailsSpot.name}
                  style={{ maxWidth: "100%", marginBottom: 10 }}
                />
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
          <button
            className="modal-close-btn"
            onClick={() => setDetailsSpot(null)}
          >
            Close
          </button>
        }
      />

      <Modal
        show={!!deleteTarget}
        title="Confirm Delete"
        onClose={() => setDeleteTarget(null)}
        message={`Are you sure you want to delete the ${spotType} "${deleteTarget?.name}"?`}
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

export default ReusableSpots;
