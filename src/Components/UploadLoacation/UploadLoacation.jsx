import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Upload, CloudUpload, LockKeyhole } from 'lucide-react';
import Modal from '../Modal/Modal';
import { useLocate } from '../LocationContext/LocationContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE_MB = 5; // limit file size (you can tweak this)

const UploadLocation = () => {
  const { locationData, setLocationData } = useLocate();
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
  });

  // Cleanup object URLs when component unmounts or new file selected
  useEffect(() => {
    return () => {
      if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    };
  }, [flyerPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setModalInfo({
        show: true,
        title: 'File Too Large',
        message: `File must be under ${MAX_FILE_SIZE_MB}MB.`,
        subMessage: '',
        type: 'error',
      });
      return;
    }

    setLocationData((prev) => ({ ...prev, flyer: file }));
    setFlyerPreview(URL.createObjectURL(file));
  };

  const handleInputFileChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, show: false }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("location_name", locationData.locationName);
      formData.append("city", locationData.city);
      formData.append("state", locationData.state);
      formData.append("spot_type", locationData.typeOfSpot);
      formData.append("additional_info", locationData.additionalInformation);
      if (locationData.flyer instanceof File) {
        formData.append("cover_image", locationData.flyer);
      }

      const token = localStorage.getItem("token");
      console.log([...formData]);
      const res = await api.post("/event/spots/create", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Success modal
      setModalInfo({
        show: true,
        title: "Success!",
        message: "Spot Added Successfully!",
        subMessage: "Your location has been published on Discover Lagos 🎉",
        type: "success",
      });

      // ✅ Navigate to correct category page after 2s
      setTimeout(() => {
        setModalInfo((prev) => ({ ...prev, show: false }));
        switch (locationData.typeOfSpot) {
          case "club":
            navigate("/adminclubs");
            break;
          case "hotel":
            navigate("/adminhotels");
            break;
          case "food_spot":
            navigate("/adminfoodspots");
            break;
          case "beach":
            navigate("/adminbeaches");
            break;
          default:
            navigate("/discoverlagos"); // fallback
        }
      }, 2000);

    } catch (err) {
      const errorMessage =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.message ||
        "Something went wrong";

      setModalInfo({
        show: true,
        title: "Error!",
        message: "Failed to submit spot.",
        subMessage: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Required fields validation
  const isFormValid =
    locationData.locationName &&
    locationData.city &&
    locationData.state &&
    locationData.typeOfSpot &&
    locationData.additionalInformation &&
    locationData.flyer;

  return (
    <div className="event-form-container">
      <div className="header">
        <ArrowLeft className="back-arrow" />
        <h1 className="header-title">UPLOAD LOCATION</h1>
      </div>

      <div className="form-content">
        {/* Upload Section */}
        <div
          className={`upload-section ${dragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-label">
            <span className="upload-flyer-text">
              <CloudUpload size={16} />
              <p>Upload Cover Image</p>
            </span>
            <div className="upload-description">
              Select or drag a visual for this spot
            </div>
          </div>
          <label className="upload-area">
            {(flyerPreview || locationData.flyer) ? (
              <img
                src={
                  flyerPreview ||
                  (typeof locationData.flyer === 'string'
                    ? locationData.flyer
                    : URL.createObjectURL(locationData.flyer))
                }
                alt="Preview"
                className="flyer-preview"
              />
            ) : (
              <div className="upload-sec">
                <Upload className="upload-icon" />
                <div className="upload-text">
                  <div className="upload-title">Click to upload</div>
                  <div className="upload-subtitle">or drag and drop</div>
                  <div className="upload-format">
                    SVG, PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB)
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleInputFileChange}
              hidden
            />
          </label>
        </div>

        {/* Form Section */}
        <div className="form">
          <form className="form-fields" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location Name <span>*</span></label>
                <input
                  required
                  type="text"
                  className="form-input"
                  placeholder="What's the name of the location?"
                  name='locationName'
                  value={locationData.locationName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City <span>*</span></label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Which city"
                  name='city'
                  value={locationData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State <span>*</span></label>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    name="state"
                    value={locationData.state}
                    onChange={handleChange}
                    readOnly
                    style={{ paddingRight: '30px', width: '763px', color: "#fff" }} // space for icon inside input
                  />
                  <LockKeyhole
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#888'
                    }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type of Spot <span>*</span></label>
                <select
                  className="form-select"
                  required
                  name='typeOfSpot'
                  value={locationData.typeOfSpot}
                  onChange={handleChange}
                >
                  <option value="">Select One</option>
                  <option value='club'>Clubs</option>
                  <option value='hotel'>Hotels</option>
                  <option value='food_spot'>Food Spots</option>
                  <option value='beache'>Beaches</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Additional Information <span>*</span></label>
              <textarea
                className="form-textarea"
                placeholder="Tell us what makes this place special (max. 100 characters)"
                name='additionalInformation'
                required
                value={locationData.additionalInformation}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="form-footer">
              <button
                className="create-event-btn"
                disabled={isSubmitting || !isFormValid}
                type="submit"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Spot'}
              </button>
            </div>
          </form>
        </div>

        <Modal
          show={modalInfo.show}
          onClose={closeModal}
          title={modalInfo.title}
          message={modalInfo.message}
          subMessage={modalInfo.subMessage}
          type={modalInfo.type}
          footerButtons={
            <button className="modal-close-btn" onClick={closeModal}>
              Close
            </button>
          }
        />
      </div>
    </div>
  );
};

export default UploadLocation;
