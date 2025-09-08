import React, { useState, useEffect } from 'react';
import { UploadCloud, ChevronLeft } from 'lucide-react';
import api from '../api';
import Modal from '../Modal/Modal';
import './BannerForm.css'

const BannerForm = ({ editingBanner, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    type: '' // "success", "error", "loading"
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (editingBanner) {
      setName(editingBanner.name || '');
      setLink(editingBanner.link || '');
      setPreview(editingBanner.image || null);
      setImage(null);
    } else {
      // reset when not editing
      setName('');
      setLink('');
      setImage(null);
      setPreview(null);
    }
  }, [editingBanner]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        }
      };

      if (editingBanner) {
        await api.put(
          `https://lagos-turnup.onrender.com/event/banners/${editingBanner.id}`,
          formData,
          config
        );
      } else {
        await api.post(
          'https://lagos-turnup.onrender.com/event/banners',
          formData,
          config
        );
      }

      setLoading(false);
      setModalInfo({
        show: true,
        title: 'Success!',
        message: editingBanner ? 'Banner updated successfully.' : 'Banner added successfully.',
        type: 'success',
        footerButtons: (
           <>
              <button
              className="modal-close-btn"
              onClick={() => {
                navigate(-1);
              }}
              >
                Close
              </button>
           </>
          ),
      });

      if (typeof onRefresh === 'function') onRefresh();

      // close after a short delay (keeps UX smooth)
      setTimeout(() => {
        setModalInfo((prev) => ({ ...prev, show: false }));
        if (typeof onClose === 'function') onClose();
      }, 1600);

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
    <div className="bf-container">
      <div className="bf-header">
        <button
          onClick={() => (typeof onClose === 'function' ? onClose() : null)}
          className="bf-back-btn"
          aria-label="go back"
          type="button"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="bf-head-title">
          {editingBanner ? 'Edit Banner' : 'Add New Banner'}
        </h1>
      </div>

      <form className="bf-form" onSubmit={handleSubmit}>
        <div className="bf-content">
          <div className="bf-upload-section">
            <label htmlFor="bf-image-upload" className="bf-upload-area">
              {preview ? (
                <img src={preview} alt="Banner Preview" className="bf-preview" />
              ) : (
                <>
                  <UploadCloud className="bf-upload-icon" />
                  <div className="bf-upload-title">Click or drag to upload</div>
                  <div className="bf-upload-subtitle">PNG, JPG, GIF up to 10MB</div>
                  <div className="bf-upload-format">Supported formats: PNG, JPG, GIF</div>
                </>
              )}
              <input
                id="bf-image-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="bf-fields">
            <div className="bf-row">
              <div className="bf-group">
                <label className="bf-label" htmlFor="bf-name">
                  Banner Name *
                </label>
                <input
                  id="bf-name"
                  type="text"
                  className="bf-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter banner name"
                />
              </div>

              <div className="bf-group">
                <label className="bf-label" htmlFor="bf-link">
                  Banner Link (optional)
                </label>
                <input
                  id="bf-link"
                  type="url"
                  className="bf-input"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Enter URL (optional)"
                />
              </div>
            </div>

            <div className="bf-footer">
              <button
                type="submit"
                className="bf-submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
              </button>

              <button
                type="button"
                onClick={() => (typeof onClose === 'function' ? onClose() : null)}
                className="bf-cancel-btn"
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
          footerButtons={modalInfo.footerButtons}
        />
      )}
    </div>
  );
};

export default BannerForm;
