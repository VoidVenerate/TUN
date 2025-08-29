// src/Components/UploadProfileModal/UploadProfileModal.jsx
import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import Modal from "../Modal/Modal";
import "./UploadProfileModal.css";

const UploadProfileModal = ({ show, onClose, onFileSelect }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // ✅ Check if it's an image
    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      // Base64 string for preview
      setPreviewUrl(event.target.result);
      setError("");
      onFileSelect(selected); // hand file back to parent component
    };

    reader.readAsDataURL(selected); // Converts file to Base64
  };


  return (
    <Modal
      show={show}
      title="Upload Profile Picture"
      onClose={onClose}
      message={
        <div className="upload-profile-container">
          <label className="upload-box">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="image-preview fade-in"
              />
            ) : (
              <div className="upload-placeholder">
                <UploadCloud size={40} />
                <p>Click to select a profile picture</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>
          {error && <p className="error-text">{error}</p>}
        </div>
      }
      footerButtons={
        <>
          <button className="modal-btn-secondary" onClick={onClose}>
            Skip
          </button>
          <button className="modal-btn-primary" onClick={onClose}>
            Continue
          </button>
        </>
      }
    />
  );
};

export default UploadProfileModal;
