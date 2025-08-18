import React, { useState, useEffect } from "react";
import axios from "axios";
import { Lock, UserX, UserCheck, Trash2 } from "lucide-react";
import "./ProfileDark.css";
import api from "../api";

const ProfileDark = () => {
  const token = localStorage.getItem("token"); // JWT stored after login

  // ====== STATE FOR OWN PROFILE ======
  const [userData, setUserData] = useState(null); // Logged-in user's profile data
  const [profileImageFile, setProfileImageFile] = useState(null); // File object for upload
  const [profileImagePreview, setProfileImagePreview] = useState(null); // Preview URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ====== STATE FOR LOADING / FEEDBACK ======
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ====== STATE FOR SUB-ADMIN MANAGEMENT ======
  const [subAdmins, setSubAdmins] = useState([]); // List of sub-admins
  const [managementLoading, setManagementLoading] = useState(false);

  // ====== STATE FOR MODALS ======
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    confirmAction: null, // Stores function to execute if confirmed
  });

  // Fetch logged-in user's profile
  useEffect(() => {
    if (!token) {
      setError("Not authenticated. Please log in.");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("https://lagos-turnup.onrender.com/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(res.data);
        setProfileImagePreview(res.data.profileImageUrl || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);


  // Fetch sub-admins if logged-in user is super-admin
  useEffect(() => {
    if (userData?.role === "super-admin") {
      fetchSubAdmins();
    }
  }, [userData]);

  const fetchSubAdmins = async () => {
    setManagementLoading(true);
    try {
      const res = await api.get("https://lagos-turnup.onrender.com/get-sub-admin", {
        headers: { 'Content-Type': 'multiform/data' },
      });
      setSubAdmins(res.data);
    } catch {
      setError("Failed to load sub-admins.");
    } finally {
      setManagementLoading(false);
    }
  };

  // Handle profile image selection
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file)); // Live preview
    }
  };

  // Password strength check
  const isPasswordStrong = (pwd) =>
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /[@$!%*?&]/.test(pwd);

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Password validation if changed
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!isPasswordStrong(password)) {
        setError(
          "Password must be 8+ chars, include uppercase, lowercase, number, and special character."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (password) formData.append("password", password);

      const res = await api.patch("https://lagos-turnup.onrender.com/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile updated successfully!");
      setUserData(res.data);
      setPassword("");
      setConfirmPassword("");
      setProfileImageFile(null);
      setProfileImagePreview(res.data.profileImageUrl || null);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ====== SUB-ADMIN MANAGEMENT ACTIONS ======
  // Deactivate
    const handleDeactivate = (id) => {
      setModalInfo({
        show: true,
        title: "Deactivate Sub-Admin",
        message: "Are you sure you want to deactivate this sub-admin?",
        confirmAction: () => performAction(`https://lagos-turnup.onrender.com/event/deactivate-user/${id}`, "put"),
      });
    };

    // Reactivate
    const handleReactivate = (id) => {
      setModalInfo({
        show: true,
        title: "Reactivate Sub-Admin",
        message: "Are you sure you want to reactivate this sub-admin?",
        confirmAction: () => performAction(`https://lagos-turnup.onrender.com/event/activate-user/${id}`, "put"),
      });
    };

    // Delete
    const handleDelete = (id) => {
      setModalInfo({
        show: true,
        title: "Delete Sub-Admin",
        message: "This action is permanent. Continue?",
        confirmAction: () => performAction(`https://lagos-turnup.onrender.com/delete-user/${id}`, "delete"),
      });
    };


  const performAction = async (url, method = "patch") => {
    try {
      await axios({
        method,
        url,
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubAdmins(); // Refresh list
      setModalInfo({ show: false, title: "", message: "", confirmAction: null });
    } catch {
      setError("Action failed. Please try again.");
    }
  };

  // ====== CONDITIONAL RENDERS ======
  if (!token) return <p>Please log in to view your profile.</p>;
  if (loading && !userData) return <p>Loading profile...</p>;
  if (error && !userData) return <p className="error">{error}</p>;

  return (
    <div className="profile-dark-container">
      <h2 className="profile-dark-title">PROFILE</h2>

      {message && <p className="success-message">{message}</p>}
      {error && userData && <p className="error">{error}</p>}

      {/* ====== PROFILE FORM ====== */}
      <form onSubmit={handleSubmit} className="profile-dark-content" encType="multipart/form-data">
        {/* LEFT SIDE: IMAGE */}
        <div className="profile-dark-left">
          <p className="profile-dark-label">Profile Image</p>
          <p className="profile-dark-subtext">Displayed on your profile.</p>
          <img
            src={profileImagePreview || "/default-profile.png"}
            alt="Profile"
            className="profile-dark-image"
          />
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            style={{ display: "none" }}
            onChange={handleProfileImageChange}
          />
          <button
            type="button"
            className="profile-dark-btn"
            onClick={() => document.getElementById("profileImageInput").click()}
          >
            Change Profile Image
          </button>
        </div>

        {/* RIGHT SIDE: FIELDS */}
        <div className="profile-dark-right">
          <div className="profile-dark-row">
            {/* First Name */}
            <div className="profile-dark-input-group">
              <label>Firstname</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.first_name || ""} readOnly autoComplete="family name" />
                <Lock size={16} color="#666" />
              </div>
            </div>

            {/* Last Name */}
            <div className="profile-dark-input-group">
              <label>Lastname</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.last_name || ""} disabled />
                <Lock size={16} color="#666" />
              </div>
            </div>
          </div>

          <div className="profile-dark-row">
            {/* Email */}
            <div className="profile-dark-input-group">
              <label>Email Address</label>
              <div className="profile-dark-input-disabled">
                <input type="email" value={userData?.email || ""} disabled />
                <Lock size={16} color="#666" />
              </div>
            </div>

            {/* Password */}
            <div className="profile-dark-input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="profile-dark-row single-row">
            <div className="profile-dark-input-group full-width">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Role */}
          <div className="profile-dark-row single-row">
            <div className="profile-dark-input-group full-width">
              <label>Role</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.role || ""} disabled />
                <Lock size={16} color="#666" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="profile-dark-btn-wrapper">
            <button className="profile-dark-btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* ====== SUB-ADMIN MANAGEMENT (SUPER-ADMIN ONLY) ====== */}
      {userData?.role === "super-admin" && (
        <div className="sub-admin-section">
          <h3 className="sub-admin-title">Manage Sub Admins</h3>

          {managementLoading ? (
            <p>Loading sub-admins...</p>
          ) : (
            <div className="sub-admin-list">
              {subAdmins.map((admin) => (
                <div key={admin.id} className="sub-admin-card">
                  <div className="sub-admin-info">
                    <img
                      src={admin.profile_picture_url || "/default-profile.png"}
                      alt={`${admin.first_name} ${admin.last_name}`}
                      className="sub-admin-avatar"
                    />
                    <div>
                      <p className="sub-admin-name">
                        {admin.first_name} {admin.last_name}
                      </p>
                      <p className="sub-admin-email">{admin.email}</p>
                    </div>
                  </div>

                  <div className="sub-admin-actions">
                    <button
                      className="action-btn"
                      onClick={() => console.log("View logs for", admin.id)}
                    >
                      View Admin Activity Logs
                    </button>

                    {admin.is_active ? (
                      <button
                        onClick={() => handleDeactivate(admin.id)}
                        className="action-btn deactivate"
                      >
                        Deactivate Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(admin.id)}
                        className="action-btn reactivate"
                      >
                        Reactivate Admin
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="action-btn delete"
                    >
                      Delete Admin
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      )}


      {/* ====== MODAL ====== */}
      {modalInfo.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modalInfo.title}</h3>
            <p>{modalInfo.message}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  modalInfo.confirmAction();
                }}
                className="profile-dark-btn"
              >
                Confirm
              </button>
              <button
                onClick={() => setModalInfo({ show: false, title: "", message: "", confirmAction: null })}
                className="profile-dark-btn cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDark;
