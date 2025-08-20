import React, { useState, useEffect } from 'react';
import './PromoteBanner.css';
import { useBanner } from '../BannerContext/BannerContext';
import { Upload } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Modal from '../Modal/Modal';
import axios from 'axios';
import { useAuth } from '../RoleContext/RoleContext';

const PromoteBanner = () => {
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { bannerData, setBannerData } = useBanner();
  const [modalInfo, setModalInfo] = useState({
      show: false,
      title: '',
      message: '',
      type: '', // 'success' or 'error'
      footerButtons: ''
  });
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
      // ✅ File size validation (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File is too large. Maximum size is 2MB.');
        e.target.value = null;
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.width <= 1400 && img.height <= 300) {
          setBannerData((prev) => ({
            ...prev,
            flyer: file,
            flyerPreview: previewUrl
          }));
          setFlyerPreview(previewUrl);
        } else {
          setError(
            `Image must be exactly 1400x300px. Selected: ${img.width}x${img.height}`
          );
          e.target.value = null;
        }
      };
      img.src = previewUrl;
    }
  };
  const { rules } = useAuth();
  const role = rules?.role; // 'admin', 'sub-admin', 'super-admin', etc.

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bannerData.flyer) {
      setError("Please upload a valid banner image before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to submit a banner.");
        setIsSubmitting(false);
        return;
      }

      

      const isAdmin = ["admin", "sub-admin", "super-admin"].includes(role);

      const formData = new FormData();
      formData.append("name", bannerData.bannerName);
      formData.append("banner_url", bannerData.bannerLink || "");

      if (isAdmin) {
        // Admin uploads go straight into banner and are auto-approved
        formData.append("banner", bannerData.flyer);
        formData.append("is_approved", true);
      } else {
        // Normal users → pending storage
        formData.append("pending_banner", bannerData.flyer);
        formData.append("is_approved", false);
      }

      await axios.post(
        "https://lagos-turnup.onrender.com/event/banners/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Modal message differs for admins
      setModalInfo({
        show: true,
        title: "Success!",
        message: isAdmin
          ? "Banner successfully uploaded and auto-approved!"
          : "Banner submitted successfully and is pending review.",
        subMessage: isAdmin
          ? "Your banner is live immediately."
          : "Our team will review it, and if approved, it will go live within 24–48 hours.",
        type: "success",
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
          err.response?.data?.message || "Failed to submit banner. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="banner-form-container">
      <div className="banner-header">
        <span className="banner-back-arrow">⬅</span>
        <h2 className="banner-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          PROMOTE A BANNER
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
              <div>
                <Upload className="banner-upload-icon" />
                <div className="banner-upload-title">Click to Upload</div>
                <div className="banner-upload-subtitle">or drag and drop</div>
                <div className="banner-upload-format">
                  PNG, JPG (must be 1400x300px)
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
          {error && (
            <p className="banner-error-text">{error}</p>
          )}
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
                  {isSubmitting
                    ? 'Submitting Your Banner...'
                    : 'Submit Banner'}
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
        footerButtons={ <>
        
        </>
          
        }
      />
    </div>
  );
};

export default PromoteBanner;
