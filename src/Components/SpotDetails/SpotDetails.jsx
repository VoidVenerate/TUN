import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../RoleContext/RoleContext';
import './SpotDetails.css';
import { ChevronLeft, MapPin, Phone, Clock, Star, ExternalLink } from 'lucide-react';
import { useSpotById, useSpotsByTypeSimilar } from '../../hooks/queries/useSpots';

const SpotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rules } = useAuth();

  const [spotCount, setSpotCount] = useState(3);

  const { data: spotData, isLoading: spotLoading } = useSpotById(id);
  const { data: typeSpots = [] } = useSpotsByTypeSimilar(spotData?.spot_type);

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

  const similarSpots = useMemo(() => {
    const others = typeSpots.filter((s) => String(s.id) !== String(id));
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, spotCount);
  }, [typeSpots, id, spotCount]);

  const loading = spotLoading;

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

  if (loading) {
    return (
      <div className="spot-details-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!spotData) {
    return (
      <div className="spot-details-container">
        <div className="error-message">
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
    <div className="spot-details-container">
      {/* Header */}
      <header className="spot-details-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() =>
              navigate(
                rules.role === 'sub-admin' || rules.role === 'super-admin'
                  ? '/adminhome'
                  : '/home'
              )
            }
          >
            <ChevronLeft />
          </button>
          <h1 className="page-title" style={{fontFamily:'Rushon Ground'}}>
            {spotData.spot_type?.toUpperCase()} DETAILS
          </h1>
        </div>
        {spotData.is_premium && (
          <div className="premium-badge">
            <Star fill="#fbbf24" color="#fbbf24" size={20} />
            <span>Premium</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="spot-details-content">
        <div className="spot-main-info">
          {/* Spot Cover Image */}
          <div className="spot-image-section">
            {spotData.cover_image ? (
              <img
                src={spotData.cover_image}
                alt={spotData.location_name}
                className="spot-cover-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">📍</div>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Spot Info */}
          <div className="spot-info-section">
            <div className="spot-header-info">
              <h2 className="spot-name">{spotData.location_name}</h2>
              {renderRating(spotData.rating)}
            </div>
            
            <p className="spot-description">
              {spotData.additional_info || 'No description available.'}
            </p>

            <div className="spot-details-grid">
              {/* Location */}
              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={20} color="#60a5fa" />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {spotData.address || `${spotData.city}, Lagos`}
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
            </div>

            {/* Action Buttons */}
            <div className="spot-actions">
              {spotData.booking_link ? (
                <a 
                  href={spotData.booking_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn-primary"
                >
                  <ExternalLink size={18} />
                  Book Now
                </a>
              ) : (
                <button className="action-btn-disabled" disabled>
                  No Booking Available
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
          </div>
        </div>

        <hr className="divider" />

        {/* Similar Spots */}
        {similarSpots.length > 0 && (
          <div className="similar-spots-section">
            <h3 className="section-title">Similar {spotData.spot_type}s</h3>
            <div className="similar-spots-grid">
              {similarSpots.map((spot, index) => (
                <div key={spot.id || index} className="similar-spot-card">
                  <div className="similar-spot-image">
                    {spot.cover_image ? (
                      <img 
                        src={spot.cover_image} 
                        alt={spot.location_name}
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/spotdetails/${spot.id}`);
                          }, 100);
                        }} 
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
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setTimeout(() => {
                          navigate(`/spotdetails/${spot.id}`);
                        }, 100);
                      }}
                    >
                      {spot.location_name}
                    </h4>
                    <p className="similar-spot-location">
                      {spot.city}
                    </p>
                    <p 
                      className="similar-spot-desc"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setTimeout(() => {
                          navigate(`/spotdetails/${spot.id}`);
                        }, 100);
                      }}
                    >
                      {truncateWords(spot.additional_info, 15)}
                    </p>
                    <div className="similar-spot-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setTimeout(() => {
                            navigate(`/spotdetails/${spot.id}`);
                          }, 100);
                        }}
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
    </div>
  );
};

export default SpotDetails;