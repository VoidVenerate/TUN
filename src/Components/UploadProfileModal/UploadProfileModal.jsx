// src/Components/UploadProfileModal.jsx
import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import Modal from "../Modal/Modal";
import "./UploadProfileModal.css";
import axios from "axios";

const UploadProfileModal = ({
  show,
  onClose,
  token,
  first_name,
  last_name,
  email,
  password,
  role
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError("");
    } else {
      setError("Please select a valid image file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image before uploading.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role || "sub-admin");
      formData.append("profile_picture", file);

      await axios.post(
        "https://lagos-turnup.onrender.com/sub-admin-signup",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // only if required
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onClose(); // close after success
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
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
          <button
            className="modal-btn-secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Skip
          </button>
          <button
            className="modal-btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload & Finish Signup"}
          </button>
        </>
      }
    />
  );
};

export default UploadProfileModal;
