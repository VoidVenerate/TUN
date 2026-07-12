import React, { useEffect, useMemo, useState } from "react";
import { Upload, Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Modal from "../Modal/Modal";
import Loader from "../Loader/Loader";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdminSpotsByType, useDeleteSpot } from "../../hooks/queries/useSpots";

const ReusableSpots = ({ spotType, addPath, editPath }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [sortAsc, setSortAsc] = useState(true);

  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const [detailsSpot, setDetailsSpot] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    footerButtons: null,
    onConfirm: null,
  });

  const [deleting, setDeleting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useAdminSpotsByType({
    spotType,
    page: currentPage,
    search: debouncedSearch,
  });
  const deleteSpotMutation = useDeleteSpot(spotType);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const normalizeUrl = (path) => {
    if (!path) return "/placeholder.png";
    let url = path.trim();
    url = url.replace(/\.comuploads/, ".com/uploads");
    if (!url.startsWith("http")) {
      url = `https://lagos-turnup-ecy5.onrender.com/${url.replace(/^\/?/, "")}`;
    }
    return url;
  };

  const spots = useMemo(
    () =>
      (data?.data ?? []).map((s) => ({
        ...s,
        spot_id: s.spot_id || s.id,
        name: s.location_name,
        location: `${s.city}, ${s.state}`,
        description: s.additional_info,
        flyerSrc: normalizeUrl(s.cover_image || s.image || ""),
      })),
    [data?.data]
  );

  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading;
  const error = isError ? `Failed to fetch ${spotType}s.` : null;

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

  const truncateText = (text, maxChars = 90) => {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars).trim() + "...";
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedSpots = useMemo(() => {
    return [...spots].sort((a, b) => {
      if (!a.name || !b.name) return 0;
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  }, [spots, sortAsc]);

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
                await deleteSpotMutation.mutateAsync(spot_id);
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

  // Internal styles
  const styles = {
    adminEventsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '0 5rem',
    },
    sortBar: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    adminEvents: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      width: '90%',
      minHeight: '300px',
      marginLeft: '5rem',
    },
    eventCard: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    events: {
      backgroundColor: '#111',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      width: '100%',
      padding: '0.8rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },
    eventsImg: {
      width: '100%',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '1rem',
      backgroundColor: '#1a1a1a',
    },
    eventTxt: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '0.5rem',
    },
    eventTxtH3: {
      fontSize: '1.2rem',
      margin: 0,
      fontWeight: 'bold',
      color: 'white',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      paddingRight: '0.5rem',
    },
    eventTxtP: {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#999',
      margin: 0,
      flexShrink: 0,
    },
    eventDescription: {
      fontSize: '0.85rem',
      color: '#aaa',
      lineHeight: '1.6',
      width: '100%',
      margin: '0 0 1rem 0',
      textAlign: 'left',
    },
    sliderBtn: {
      display: 'flex',
      gap: '0.5rem',
      width: '100%',
      marginTop: '0.5rem',
    },
    editButton: {
      backgroundColor: 'rgba(84, 35, 210, 0.1)',
      color: '#a78bfa',
      border: '0.5px solid rgba(167, 139, 250, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 60, 60, 0.1)',
      color: '#ff3b30',
      border: '0.5px solid rgba(255, 60, 60, 0.26)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
    },
    paginationControls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '32px',
      paddingBottom: '2rem',
      flexWrap: 'wrap',
    },
    paginationButton: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '80px',
    },
    paginationButtonDisabled: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'not-allowed',
      minWidth: '80px',
      opacity: 0.4,
    },
    paginationButtonActive: {
      backgroundColor: '#5423D2',
      color: '#fff',
      border: '1px solid #5423D2',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '40px',
    },
    noImagePlaceholder: {
      width: '100%',
      height: '400px',
      background: '#ccc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      marginBottom: '1rem',
    },
  };

  // Responsive adjustments
  const getResponsiveStyles = () => {
    if (windowWidth <= 480) {
      return {
        adminEventsHeader: { ...styles.adminEventsHeader, padding: '0 1rem', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' },
        adminEvents: { ...styles.adminEvents, gridTemplateColumns: '1fr', gap: '1rem', marginLeft: '1rem' },
        eventsImg: { ...styles.eventsImg, height: '200px' },
        noImagePlaceholder: { ...styles.noImagePlaceholder, height: '200px' },
      };
    } else if (windowWidth <= 900) {
      return {
        adminEventsHeader: { ...styles.adminEventsHeader, padding: '0 2rem' },
        adminEvents: { ...styles.adminEvents, gridTemplateColumns: 'repeat(2, 1fr)', marginLeft: '2rem' },
        eventsImg: { ...styles.eventsImg, height: '250px' },
        noImagePlaceholder: { ...styles.noImagePlaceholder, height: '250px' },
      };
    } else if (windowWidth <= 1024) {
      return {
        adminEventsHeader: { ...styles.adminEventsHeader, padding: '0 3rem' },
        adminEvents: { ...styles.adminEvents, marginLeft: '3rem' },
        eventsImg: { ...styles.eventsImg, height: '300px' },
        noImagePlaceholder: { ...styles.noImagePlaceholder, height: '300px' },
      };
    }
    return {};
  };

  const responsiveStyles = getResponsiveStyles();

  if (error) return <p>{error}</p>;
  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ ...styles.adminEventsHeader, ...responsiveStyles.adminEventsHeader }}>
        <p style={{ fontFamily: "Rushon Ground", margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {spotType.charAt(0).toUpperCase() + spotType.slice(1)}s
        </p>
        <button 
          style={styles.sortBar} 
          onClick={() => setSortAsc((prev) => !prev)}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#333';
            e.target.style.borderColor = '#5423D2';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#1a1a1a';
            e.target.style.borderColor = '#333';
          }}
        >
          Sort Name {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      <div style={{ ...styles.adminEvents, ...responsiveStyles.adminEvents }}>
        {sortedSpots.length === 0 && <p>No {spotType}s found.</p>}
        {sortedSpots.map((spot, index) => (
          <div key={spot.spot_id || index} style={styles.eventCard}>
            <div 
              style={styles.events}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }}
              onClick={() => navigate(`/adminspotdetails/${spot.spot_id}`)}
            >
              {spot.flyerSrc ? (
                <img
                  src={spot.flyerSrc}
                  alt={spot.name}
                  loading="lazy"
                  style={{ ...styles.eventsImg, ...responsiveStyles.eventsImg }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
              ) : (
                <div style={{ ...styles.noImagePlaceholder, ...responsiveStyles.noImagePlaceholder }}>
                  No image
                </div>
              )}
              <div style={styles.eventTxt}>
                <h3 style={styles.eventTxtH3}>{spot.name}</h3>
                <p style={styles.eventTxtP}>{spot.location}</p>
              </div>
              <p style={styles.eventDescription}>
                {truncateText(spot.description) || 'No description available'}
              </p>
              <div style={styles.sliderBtn}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${editPath}/${spot.spot_id}`);
                  }}
                  style={styles.editButton}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(84, 35, 210, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(84, 35, 210, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Edit3 size="16" style={{ marginRight: "10px" }} />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(spot.spot_id);
                  }}
                  style={styles.deleteButton}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 60, 60, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 60, 60, 0.1)';
                    e.target.style.transform = 'translateY(0)';
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
      <div style={styles.paginationControls}>
        <button 
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} 
          disabled={currentPage === 1}
          style={currentPage === 1 ? styles.paginationButtonDisabled : styles.paginationButton}
          onMouseOver={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = '#333';
              e.target.style.borderColor = '#5423D2';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = '#1a1a1a';
              e.target.style.borderColor = '#333';
            }
          }}
        >
          Previous
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            style={num === currentPage ? styles.paginationButtonActive : styles.paginationButton}
            onMouseOver={(e) => {
              if (num !== currentPage) {
                e.target.style.backgroundColor = '#333';
                e.target.style.borderColor = '#5423D2';
              }
            }}
            onMouseOut={(e) => {
              if (num !== currentPage) {
                e.target.style.backgroundColor = '#1a1a1a';
                e.target.style.borderColor = '#333';
              }
            }}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => (totalPages ? Math.min(p + 1, totalPages) : p + 1))}
          disabled={totalPages ? currentPage === totalPages : false}
          style={totalPages && currentPage === totalPages ? styles.paginationButtonDisabled : styles.paginationButton}
          onMouseOver={(e) => {
            if (!totalPages || currentPage !== totalPages) {
              e.target.style.backgroundColor = '#333';
              e.target.style.borderColor = '#5423D2';
            }
          }}
          onMouseOut={(e) => {
            if (!totalPages || currentPage !== totalPages) {
              e.target.style.backgroundColor = '#1a1a1a';
              e.target.style.borderColor = '#333';
            }
          }}
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