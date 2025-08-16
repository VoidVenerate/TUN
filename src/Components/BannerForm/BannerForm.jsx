import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import api from '../api';
import Modal from '../Modal/Modal';

const BannerForm = ({ editingBanner, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false); // NEW: track loading state

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: '' // "success", "error", "loading"
  });

  useEffect(() => {
    if (editingBanner) {
      setName(editingBanner.name || '');
      setLink(editingBanner.link || '');
      setPreview(editingBanner.image || null);
      setImage(null);
    }
  }, [editingBanner]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Show loading modal
    setModalInfo({
      show: true,
      title: editingBanner ? 'Updating...' : 'Adding...',
      message: 'Please wait while we save your banner.',
      type: 'loading'
    });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('link', link);
    if (image) formData.append('banner', image);

    try {
      if (editingBanner) {
        await api.put(
          `https://lagos-turnup.onrender.com/event/banners/${editingBanner.id}`,
          formData
        );
      } else {
        await api.post('https://lagos-turnup.onrender.com/event/banners', formData);
      }

      setLoading(false);
      setModalInfo({
        show: true,
        title: 'Success!',
        message: editingBanner
          ? 'Banner updated successfully.'
          : 'Banner added successfully.',
        type: 'success'
      });

      onRefresh();
      setTimeout(() => {
        setModalInfo((prev) => ({ ...prev, show: false }));
        onClose();
      }, 2000);

    } catch (error) {
      console.error(error);
      setLoading(false);
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Failed to submit banner. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="banner-form-container">
      <div className="banner-header">
        <h1 className="banner-header-title">
          {editingBanner ? 'Edit Banner' : 'Add New Banner'}
        </h1>
      </div>

      <form className="banner-form" onSubmit={handleSubmit}>
        <div className="banner-form-content">
          <div className="banner-upload-section">
            <label htmlFor="banner-image-upload" className="banner-upload-area">
              {preview ? (
                <img src={preview} alt="Banner Preview" className="banner-flyer-preview" />
              ) : (
                <>
                  <UploadCloud className="banner-upload-icon" />
                  <div className="banner-upload-title">Click or drag to upload</div>
                  <div className="banner-upload-subtitle">PNG, JPG, GIF up to 10MB</div>
                  <div className="banner-upload-format">Supported formats: PNG, JPG, GIF</div>
                </>
              )}
              <input
                id="banner-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="banner-form-fields">
            <div className="banner-form-row">
              <div className="banner-form-group">
                <label className="banner-form-label" htmlFor="banner-name">
                  Banner Name *
                </label>
                <input
                  id="banner-name"
                  type="text"
                  className="banner-form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter banner name"
                />
              </div>

              <div className="banner-form-group">
                <label className="banner-form-label" htmlFor="banner-link">
                  Banner Link (optional)
                </label>
                <input
                  id="banner-link"
                  type="url"
                  className="banner-form-input"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Enter URL (optional)"
                />
              </div>
            </div>

            <div className="banner-form-footer">
              <button
                type="submit"
                className="banner-submit-btn"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="banner-submit-btn"
                style={{ marginLeft: '16px', background: '#555' }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {modalInfo.show && (
        <Modal
          title={modalInfo.title}
          message={modalInfo.message}
          type={modalInfo.type}
          onClose={() => !loading && setModalInfo((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default BannerForm;
