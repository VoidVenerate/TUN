import React, { useState, useEffect } from 'react';
import { useBanner } from '../BannerContext/BannerContext';
import { ChevronLeft, Upload } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Modal from '../Modal/Modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPromoteBanner = () => {
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { bannerData, setBannerData } = useBanner();
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: '',
    footerButtons: ''
  });
  
  const navigate = useNavigate();

  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    return () => {
      if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    };
  }, [flyerPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (file) {
      // File size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.');
        e.target.value = null;
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.width <= 17000 && img.height <= 3500) {
          setBannerData((prev) => ({
            ...prev,
            flyer: file,
            flyerPreview: previewUrl
          }));
          setFlyerPreview(previewUrl);
        } else {
          setError(
            `Image must be 1400x300px or smaller. Selected: ${img.width}x${img.height}`
          );
          e.target.value = null;
        }
      };
      img.src = previewUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bannerData.flyer) {
      setError("Please upload a valid banner image before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", bannerData.bannerName);
      formData.append("banner_link", bannerData.bannerLink || "");
      formData.append("banner", bannerData.flyer);

      // Create banner
      const createResponse = await axios.post(
        "https://lagos-turnup-ecy5.onrender.com/event/banners/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Extract banner ID
      const bannerId = createResponse.data?.id;

      if (!bannerId) {
        throw new Error("Banner ID not returned from server.");
      }

      // Auto-approve for admins
      await axios.patch(
        `https://lagos-turnup-ecy5.onrender.com/event/banners/${bannerId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success Modal
      setModalInfo({
        show: true,
        title: "Success!",
        message: "Banner created and approved successfully!",
        subMessage: "Your banner is now live on TurnUpLagos.",
        type: "success",
        footerButtons: (
          <button
            className="modal-close-btn-primary"
            onClick={() => {
              closeModal();
              navigate("/banner");
            }}
          >
            Close
          </button>
        ),
      });

      // Reset form
      setBannerData({ bannerName: "", flyer: null, bannerLink: "" });
      setFlyerPreview(null);
    } catch (err) {
      console.error("Error submitting banner:", err);
      setModalInfo({
        show: true,
        title: "Error!",
        message:
          err.response?.data?.message ||
          err.response?.data?.detail?.[0]?.msg ||
          "Failed to submit banner. Please try again.",
        type: "error",
        footerButtons: (
          <button className="modal-close-btn" onClick={closeModal}>
            Close
          </button>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="banner-form-container">
      <div className="banner-header">
        <NavLink to="/banner" style={{ marginTop: "5px" }}>
          <ChevronLeft className="event-unique-back" />
        </NavLink>
        <h2 className="banner-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          CREATE BANNER
        </h2>
      </div>

      <div className="banner-form-content">
        {/* Upload Section */}
        <div className="banner-upload-section">
          <label className="banner-upload-area">
            {flyerPreview || bannerData.flyer ? (
              <img
                src={flyerPreview || bannerData.flyerPreview}
                alt="Preview"
                className="banner-flyer-preview"
              />
            ) : (
              <div className='bu-place'>
                <Upload className="banner-upload-icon" />
                <div className="bu-note">
                  <div className="banner-upload-title">Click to Upload</div>
                  <div className="banner-upload-subtitle">or drag and drop</div>
                  <div className="banner-upload-format">
                    PNG, JPG (recommended 1400x300px)
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              hidden
            />
          </label>
          {error && <p className="banner-error-text">{error}</p>}
        </div>

        {/* Form Section */}
        <div className="banner-form">
          <form className="banner-form-fields" onSubmit={handleSubmit}>
            <div className="banner-form-row">
              <div className="banner-form-group">
                <label className="banner-form-label">
                  Banner Name <span>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="banner-form-input"
                  placeholder="What's the name of your Banner"
                  name="bannerName"
                  value={bannerData.bannerName}
                  onChange={handleChange}
                />
              </div>

              <div className="banner-form-group">
                <label className="banner-form-label">
                  Banner Link <span>(optional)</span>
                </label>
                <input
                  type="url"
                  className="banner-form-input"
                  placeholder="Paste a link for the banner (optional)"
                  name="bannerLink"
                  value={bannerData.bannerLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="banner-form-footer">
              <button
                type="submit"
                className="banner-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Banner...' : 'Create & Publish Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        type={modalInfo.type}
        footerButtons={modalInfo.footerButtons}
      />
    </div>
  );
};

export default AdminPromoteBanner;