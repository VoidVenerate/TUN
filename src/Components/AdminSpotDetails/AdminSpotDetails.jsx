import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminSpotDetails.css';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import Modal from '../Modal/Modal';

const AdminSpotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spotData, setSpotData] = useState(null);
  const [similarSpots, setSimilarSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spotCount, setSpotCount] = useState(3);
  const [deleting, setDeleting] = useState(false);
  
  const [modalFeedback, setModalFeedback] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
    subMessage: '',
    footerButtons: null,
  });

  const token = localStorage.getItem('token');

  // Dynamic spot count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1800) {
        setSpotCount(5);
      } else if (window.innerWidth >= 1500) {
        setSpotCount(4);
      } else {
        setSpotCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Normalize URL helper
  const normalizeUrl = (path) => {
    if (!path) return '/placeholder.png';
    let url = path.trim();
    url = url.replace(/\.comuploads/, '.com/uploads');
    if (!url.startsWith('http')) {
      url = `https://lagos-turnup-ecy5.onrender.com/${url.replace(/^\/?/, '')}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        // Fetch specific spot details
        const res = await axios.get(
          `https://lagos-turnup-ecy5.onrender.com/event/spots`,
          { params: { spot_id: id } }
        );
        
        const spot = Array.isArray(res.data) ? res.data[0] : res.data;
        setSpotData(spot || null);

        // Fetch similar spots based on type
        if (spot?.spot_type) {
          const similarRes = await axios.get(
            `https://lagos-turnup-ecy5.onrender.com/event/spots`,
            { params: { spot_type: spot.spot_type } }
          );
          
          const allSpots = Array.isArray(similarRes.data) ? similarRes.data : [];
          const others = allSpots.filter(s => s.id !== id && s.spot_id !== id);
          const shuffled = others.sort(() => 0.5 - Math.random());
          const randomSpots = shuffled.slice(0, spotCount);
          
          setSimilarSpots(randomSpots);
        }
      } catch (err) {
        console.error('Failed to fetch spot:', err);
        setModalFeedback({
          show: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to load spot details.',
          subMessage: 'Please try again later.',
          footerButtons: (
            <button 
              className="modal-close-btn" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSpot();
    }
  }, [id, spotCount]);

  const handleDelete = () => {
    setModalFeedback({
      show: true,
      type: 'duration',
      title: 'Delete Spot',
      message: 'Are you sure you want to delete this spot?',
      subMessage: 'This location will be permanently removed from Discover Lagos and will no longer be visible to users. This action cannot be undone.',
      footerButtons: (
        <>
          <button
            className="modal-btn-danger"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete'}
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

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `https://lagos-turnup-ecy5.onrender.com/event/spots/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setModalFeedback({
        show: true,
        type: 'success',
        title: 'Deleted',
        message: 'Spot deleted successfully.',
        subMessage: 'Redirecting to spots list...',
        footerButtons: null,
      });

      setTimeout(() => {
        navigate(`/admin${spotData?.spot_type}s`);
      }, 1500);
    } catch (err) {
      setModalFeedback({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete spot.',
        subMessage: err.response?.data?.message || 'Please try again.',
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
  };

  const handleEdit = () => {
    navigate(`/editspot/${id}`);
  };

  const truncateWords = (text, maxWords = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return 'Not specified';
    return hours;
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    return (
      <div className="spot-rating">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            fill={i < rating ? "#fbbf24" : "transparent"} 
            color={i < rating ? "#fbbf24" : "#666"}
          />
        ))}
        <span className="rating-text">{rating}/5</span>
      </div>
    );
  };

  const handleSpotClick = (spotId) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      navigate(`/adminspotdetails/${spotId}`);
    }, 100);
  };

  if (loading) {
    return (
      <div className="admin-spot-details-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!spotData) {
    return (
      <div className="admin-spot-details-container">
        <div className="error-message">
          <AlertTriangle size={48} color="#ff3b30" />
          <h2>Spot not found</h2>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-spot-details-container">
      {/* Header */}
      <header className="admin-spot-details-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate(`/admin${spotData.spot_type}s`)}
          >
            <ChevronLeft />
          </button>
          <h1 className="page-title" style={{fontFamily:'Rushon Ground'}}>
            {spotData.spot_type?.toUpperCase()} DETAILS
          </h1>
        </div>
        {/* <div className="header-actions">
          <button 
            className="edit-btn"
            onClick={handleEdit}
          >
            <Edit3 size={18} />
            Edit
          </button>
          <button 
            className="delete-btn"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div> */}
      </header>

      {/* Main Content */}
      <div className="admin-spot-details-content">
        <div className="admin-spot-main-info">
          {/* Spot Cover Image */}
          <div className="admin-spot-image-section">
            {spotData.cover_image ? (
              <img
                src={normalizeUrl(spotData.cover_image)}
                alt={spotData.location_name}
                className="admin-spot-cover-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">📍</div>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Spot Info */}
          <div className="admin-spot-info-section">
            <div className="admin-spot-header-info">
              <h2 className="admin-spot-name">{spotData.location_name}</h2>
              {renderRating(spotData.rating)}
            </div>
            
            <p className="admin-spot-description">
              {spotData.additional_info || 'No description available.'}
            </p>

            <div className="admin-spot-details-grid">
              {/* Location */}
              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={20} color="#60a5fa" />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {spotData.address || `${spotData.city}, ${spotData.state}`}
                  </span>
                </div>
              </div>

              {/* City/Area */}
              <div className="detail-item">
                <div className="detail-icon">
                  <span style={{ fontSize: '18px' }}>🏙️</span>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Area</span>
                  <span className="detail-value">{spotData.city}</span>
                </div>
              </div>

              {/* State */}
              <div className="detail-item">
                <div className="detail-icon">
                  <span style={{ fontSize: '18px' }}>📍</span>
                </div>
                <div className="detail-content">
                  <span className="detail-label">State</span>
                  <span className="detail-value">{spotData.state}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="detail-item">
                <div className="detail-icon">
                  <Phone size={20} color="#60a5fa" />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Contact</span>
                  <span className="detail-value">
                    {spotData.phone_number || 'Not available'}
                  </span>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="detail-item">
                <div className="detail-icon">
                  <Clock size={20} color="#60a5fa" />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Opening Hours</span>
                  <span className="detail-value">
                    {formatOpeningHours(spotData.opening_hours)}
                  </span>
                </div>
              </div>

              {/* Spot Type */}
              <div className="detail-item">
                <div className="detail-icon">
                  <span style={{ fontSize: '18px' }}>🏷️</span>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Category</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                    {spotData.spot_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="admin-spot-actions">
              {spotData.booking_link ? (
                <a 
                  href={spotData.booking_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn-primary"
                >
                  <ExternalLink size={18} />
                  View Booking Link
                </a>
              ) : (
                <button className="action-btn-disabled" disabled>
                  No Booking Link
                </button>
              )}
              
              {spotData.menu_link && (
                <a 
                  href={spotData.menu_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn-secondary"
                >
                  View Menu
                </a>
              )}
            </div>

            {/* Admin Info */}
            <div className="admin-info-section">
              <h4>Admin Information</h4>
              <div className="admin-info-grid">
                <div className="admin-info-item">
                  <span className="admin-info-label">Spot ID:</span>
                  <span className="admin-info-value">{spotData.id || spotData.spot_id}</span>
                </div>
                {spotData.created_at && (
                  <div className="admin-info-item">
                    <span className="admin-info-label">Created:</span>
                    <span className="admin-info-value">
                      {new Date(spotData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {spotData.is_premium && (
                  <div className="admin-info-item">
                    <span className="admin-info-label">Status:</span>
                    <span className="admin-info-value premium-badge">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      Premium
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Similar Spots */}
        {similarSpots.length > 0 && (
          <div className="similar-spots-section">
            <h3 className="section-title">Similar {spotData.spot_type}s</h3>
            <div className="similar-spots-grid">
              {similarSpots.map((spot, index) => (
                <div key={spot.id || spot.spot_id || index} className="similar-spot-card">
                  <div className="similar-spot-image">
                    {spot.cover_image ? (
                      <img 
                        src={normalizeUrl(spot.cover_image)} 
                        alt={spot.location_name}
                        onClick={() => handleSpotClick(spot.id || spot.spot_id)}
                      />
                    ) : (
                      <div className="similar-spot-placeholder">
                        <span>📍</span>
                      </div>
                    )}
                  </div>
                  <div className="similar-spot-info">
                    <h4 
                      className="similar-spot-name"
                      onClick={() => handleSpotClick(spot.id || spot.spot_id)}
                    >
                      {spot.location_name}
                    </h4>
                    <p className="similar-spot-location">
                      {spot.city}
                    </p>
                    <p 
                      className="similar-spot-desc"
                      onClick={() => handleSpotClick(spot.id || spot.spot_id)}
                    >
                      {truncateWords(spot.additional_info, 15)}
                    </p>
                    <div className="similar-spot-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleSpotClick(spot.id || spot.spot_id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
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

export default AdminSpotDetails;