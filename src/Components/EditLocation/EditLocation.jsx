import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Modal from '../Modal/Modal';
import './EditLocation.css';

const EditableLocationRHF = () => {
  const navigate = useNavigate();
  const { spot_id } = useParams();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      locationName: '',
      city: '',
      state: '',
      typeOfSpot: '',
      additionalInfo: '',
      flyerFile: null,
      flyerPreview: null,
    },
  });

  const [modalInfo, setModalInfo] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    subMessage: '',
    footerButtons: null 
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const previewUrlRef = useRef(null);
  const flyerFile = watch('flyerFile');

  // Flyer preview handler
  useEffect(() => {
    if (flyerFile && flyerFile.length > 0) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const preview = URL.createObjectURL(flyerFile[0]);
      previewUrlRef.current = preview;
      setValue('flyerPreview', preview);
    }
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [flyerFile, setValue]);

  // Helper to construct proper image URL
  const getImageUrl = (coverImage) => {
    if (!coverImage) return '/placeholder.png';

    // If it's already a full URL, return it
    if (coverImage.startsWith('http')) return coverImage;

    // Remove leading slash if present to avoid double slashes
    const cleanPath = coverImage.startsWith('/') ? coverImage.slice(1) : coverImage;
    return `https://lagos-turnup-ecy5.onrender.com/${cleanPath}`;
  };

  // Fetch spot details
  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch all spots and find the one we need
        const res = await api.get("/event/spots", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const spots = (Array.isArray(res.data) ? res.data : []).map((s) => ({
          ...s,
          id: String(s.id),
        }));

        const spot = spots.find((s) => s.id === spot_id);

        if (spot) {
          console.log("Found spot:", spot);
          console.log("Cover image:", spot.cover_image);

          reset({
            locationName: spot.location_name,
            city: spot.city,
            state: spot.state,
            typeOfSpot: spot.spot_type,
            additionalInfo: spot.additional_info || '',
            flyerPreview: getImageUrl(spot.cover_image),
          });
        } else {
          setModalInfo({
            show: true,
            title: 'Not Found',
            message: 'Spot not found.',
            footerButtons: (
              <button onClick={() => navigate('/discoverlagos')} className="editlocation-modal-confirm-btn">
                Go Back
              </button>
            ),
          });
        }
      } catch (err) {
        console.error("Error fetching spot:", err);
        setModalInfo({
          show: true,
          title: 'Error',
          message: 'Failed to load spot details.',
          subMessage: err?.response?.data?.detail || err?.message || 'Please try again.',
          footerButtons: (
            <button onClick={() => navigate(-1)} className="editlocation-modal-confirm-btn">
              Go Back
            </button>
          ),
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (spot_id) {
      fetchSpot();
    } else {
      setIsLoading(false);
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'No spot ID provided.',
        footerButtons: (
          <button onClick={() => navigate(-1)} className="editlocation-modal-confirm-btn">
            Go Back
          </button>
        ),
      });
    }
  }, [spot_id, reset, navigate]);

  // Save changes - PUT /event/spots/edit/{spot_id}
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("location_name", data.locationName);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("spot_type", data.typeOfSpot);
      formData.append("additional_info", data.additionalInfo || '');

      // Only append cover_image if a new file was selected
      if (data.flyerFile && data.flyerFile[0]) {
        formData.append("cover_image", data.flyerFile[0]);
      }

      console.log("Submitting to:", `/event/spots/edit/${spot_id}`);

      // PUT request with spot_id as path parameter
      await api.put(`/event/spots/edit/${spot_id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      // Redirect based on spot type
      const redirectMap = {
        "club": "/adminclubs",
        "hotel": "/adminhotels",
        "food_spot": "/adminfoodspots",
        "beach": "/adminbeaches"
      };

      navigate(redirectMap[data.typeOfSpot] || "/discoverlagos");

    } catch (err) {
      console.error("Error updating spot:", err);
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Failed to update spot.',
        subMessage: err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.message || err?.message || '',
        footerButtons: (
          <button onClick={closeModal} className="editlocation-modal-close-btn">
            Close
          </button>
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete spot
  const handleDelete = () => {
    if (!spot_id) {
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'No spot ID to delete.',
        footerButtons: (
          <button onClick={closeModal} className="editlocation-modal-close-btn">
            Close
          </button>
        ),
      });
      return;
    }

    setModalInfo({
      show: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this spot?',
      subMessage: 'This action cannot be undone.',
      footerButtons: (
        <div className="editlocation-modal-btn-group">
          <button onClick={closeModal} className="editlocation-modal-close-btn">
            Cancel
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              try {
                await api.delete(`/event/spots/${spot_id}`);
                setModalInfo({
                  show: true,
                  title: 'Deleted',
                  message: 'Spot deleted successfully.',
                  subMessage: '',
                  footerButtons: (
                    <button 
                      onClick={() => navigate('/discoverlagos')} 
                      className="editlocation-modal-confirm-btn"
                    >
                      Close
                    </button>
                  ),
                });
              } catch (err) {
                setModalInfo({
                  show: true,
                  title: 'Error',
                  message: 'Failed to delete spot.',
                  subMessage: err?.response?.data?.detail || err?.message || '',
                  footerButtons: (
                    <button onClick={closeModal} className="editlocation-modal-close-btn">
                      Close
                    </button>
                  ),
                });
              } finally {
                setDeleting(false);
              }
            }}
            className="editlocation-modal-confirm-btn danger"
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ),
    });
  };

  const closeModal = () => setModalInfo(prev => ({ ...prev, show: false }));

  if (isLoading) {
    return (
      <div className="editlocation-container">
        <div className="editlocation-loading">
          <div className="editlocation-spinner"></div>
          <span>Loading spot details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="editlocation-container">
      <header className="editlocation-header">
        <h1 className="editlocation-header-title">
          <button onClick={() => navigate(-1)} className="editlocation-back-btn">
            ←
          </button>
          Edit Location
        </h1>
      </header>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="editlocation-content"
        encType="multipart/form-data"
      >
        {/* Left Side - Image Upload */}
        <div className="editlocation-upload-section">
          <div className="editlocation-upload-label">
            <span className="editlocation-upload-text">Location Image</span>
            <span className="editlocation-upload-description">
              Click on the image to change the flyer
            </span>
          </div>

          <div className="editlocation-flyer-preview-container">
            <img
              src={watch('flyerPreview') || '/placeholder.png'}
              alt="Spot Flyer Preview"
              className="editlocation-flyer-preview"
              onError={(e) => {
                console.log("Image failed to load:", e.target.src);
                e.target.src = '/placeholder.png';
              }}
            />
            <div className="editlocation-flyer-edit-overlay">
              <label className="editlocation-flyer-edit-btn">
                📷 Change Image
                <input 
                  type="file" 
                  accept="image/*" 
                  {...register('flyerFile')} 
                  className="editlocation-file-input"
                />
              </label>
            </div>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            {...register('flyerFile')} 
            className="editlocation-file-input-visible"
          />
        </div>

        {/* Right Side - Form Fields */}
        <div className="editlocation-form">
          <div className="editlocation-fields">
            {/* Row 1: Location Name & City */}
            <div className="editlocation-row">
              <div className="editlocation-group">
                <label className="editlocation-label" htmlFor="locationName">
                  Location Name *
                </label>
                <input 
                  id="locationName" 
                  className="editlocation-input" 
                  placeholder="Enter location name"
                  {...register('locationName', { required: 'Location name is required' })} 
                />
                {errors.locationName && (
                  <span className="editlocation-error">{errors.locationName.message}</span>
                )}
              </div>

              <div className="editlocation-group">
                <label className="editlocation-label" htmlFor="city">
                  City *
                </label>
                <input 
                  id="city" 
                  className="editlocation-input" 
                  placeholder="Enter city"
                  {...register('city', { required: 'City is required' })} 
                />
                {errors.city && (
                  <span className="editlocation-error">{errors.city.message}</span>
                )}
              </div>
            </div>

            {/* Row 2: State & Type */}
            <div className="editlocation-row">
              <div className="editlocation-group">
                <label className="editlocation-label" htmlFor="state">
                  State
                </label>
                <input 
                  id="state" 
                  className="editlocation-input" 
                  {...register('state')} 
                  readOnly 
                />
              </div>

              <div className="editlocation-group">
                <label className="editlocation-label" htmlFor="typeOfSpot">
                  Type of Spot *
                </label>
                <select 
                  id="typeOfSpot" 
                  className="editlocation-select" 
                  {...register('typeOfSpot', { required: 'Please select a spot type' })}
                >
                  <option value="">Select a type</option>
                  <option value="club">Club</option>
                  <option value="hotel">Hotel</option>
                  <option value="food_spot">Food Spot</option>
                  <option value="beach">Beach</option>
                </select>
                {errors.typeOfSpot && (
                  <span className="editlocation-error">{errors.typeOfSpot.message}</span>
                )}
              </div>
            </div>

            {/* Row 3: Additional Info (Full Width) */}
            <div className="editlocation-row">
              <div className="editlocation-group editlocation-full">
                <label className="editlocation-label" htmlFor="additionalInfo">
                  Additional Information
                </label>
                <textarea 
                  id="additionalInfo" 
                  className="editlocation-textarea" 
                  placeholder="Add any extra details about this location..."
                  {...register('additionalInfo')} 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Below the form fields */}
          <div className="editlocation-actions">
            <button 
              type="submit" 
              className="editlocation-btn editlocation-btn--save" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="editlocation-btn-icon">⏳</span> 
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="editlocation-btn-icon">💾</span> 
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button 
              type="button" 
              className="editlocation-btn editlocation-btn--delete" 
              disabled={deleting} 
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <span className="editlocation-btn-icon">⏳</span> 
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span className="editlocation-btn-icon">🗑</span> 
                  <span>Delete Spot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Feedback Modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={modalInfo.footerButtons}
      />
    </div>
  );
};

export default EditableLocationRHF;