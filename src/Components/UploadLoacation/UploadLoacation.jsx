import React, { useState } from 'react';
import { ArrowLeft, Upload, CloudUpload, LockKeyhole } from 'lucide-react';
// import './UploadLocation.css';
import Modal from '../Modal/Modal';
import { NavLink } from 'react-router-dom';
import { useLocate } from '../LocationContext/LocationContext';

const UploadLocation = () => {
  const { locationData, setLocationData } = useLocate(); // fixed hook name from useEvent to useLocate
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '', // 'success' or 'error'
    footerButtons: ''

  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocationData(prev => ({ ...prev, flyer: file }));
      setFlyerPreview(URL.createObjectURL(file));
    }
  };
  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, show: false }));
    // After closing success modal, navigate somewhere if needed
    // if (modalInfo.type === 'success') {
    //   navigate('/featureevent'); // Example route, change as needed
    // }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call success/failure
    const success = true; // Replace with real API logic

    if (success) {
      setModalInfo({
        show: true,
        title: 'Success!',
        message: 'Spot Added Successfully!',
        subMessage: "Your location has been published on Discover Lagos and is now visible to all users.!",
        type: 'success',
      });
    } else {
      setModalInfo({
        show: true,
        title: 'Error!',
        message: 'Failed to submit spot.',
        subMessage: '',
        type: 'error',
      });
    }
  };

  return (
    <div className="event-form-container">
      <div className="header">
        <ArrowLeft className="back-arrow" />
        <h1 className="header-title">UPLOAD LOCATION</h1>
      </div>

      <div className="form-content">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-label">
            <span className="upload-flyer-text"><CloudUpload size={16} /><p>Upload Cover Image</p></span>
            <div className="upload-description">
              Select and upload a visual for this spot
            </div>
          </div>
          <label className="upload-area">
            {(flyerPreview || locationData.flyer) ? (
              <img
                src={flyerPreview || (typeof locationData.flyer === 'string' ? locationData.flyer : URL.createObjectURL(locationData.flyer))}
                alt="Preview"
                className="flyer-preview"
              />
            ) : (
              <div className='upload-sec'>
                <Upload className="upload-icon" />
                <div className="upload-text">
                  <div className="upload-title">Click to upload</div>
                  <div className="upload-subtitle">or drag and drop</div>
                  <div className="upload-format">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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
                  <option value='clubs'>Clubs</option>
                  <option value='hotels'>Hotels</option>
                  <option value='foodSpots'>Food Spots</option>
                  <option value='beaches'>Beaches</option>
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
              <button className="create-event-btn" disabled={isSubmitting} type="submit">
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
          footerButtons={<button className="modal-close-btn" onClick={closeModal}>
            Close
          </button>}
        />
      </div>
      
      {/* You can add modal here if you want */}
      {/* {modalInfo?.show && <Modal {...modalInfo} onClose={() => setModalInfo(null)} />} */}
    </div>
  );
};

export default UploadLocation;
