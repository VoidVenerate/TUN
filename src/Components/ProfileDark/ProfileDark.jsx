import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../Modal/Modal";
import { Lock, Eye, EyeOff } from "lucide-react";
import "./ProfileDark.css";
import api from "../api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import defaultAvatar from '../../assets/defaultAvatar.png'
import Loader from "../Loader/Loader";

const ProfileDark = () => {
  const token = localStorage.getItem("token");

  // ====== STATE FOR OWN PROFILE ======
  const [userData, setUserData] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ====== FEEDBACK ======
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ====== SUB-ADMIN MANAGEMENT ======
  const [subAdmins, setSubAdmins] = useState([]);
  const [managementLoading, setManagementLoading] = useState(false);

  // ====== MODAL ======
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    type:"",
    message: "",
    subMessage:"",
    confirmAction: null,
  });

  const isPasswordStrong = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  // ====== FETCH USER ======
  useEffect(() => {
    if (!token) {
      setError("Not authenticated. Please log in.");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("https://lagos-turnup-ecy5.onrender.com/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        setProfileImagePreview(
          normalizeUrl(res.data.profile_picture_url || res.data.profile_picture || null)
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // ====== FETCH SUB-ADMINS IF SUPER ======
  useEffect(() => {
    if (userData?.role === "super-admin") fetchSubAdmins();
  }, [userData]);

  const fetchSubAdmins = async () => {
    setManagementLoading(true);
    try {
      const res = await api.get("https://lagos-turnup-ecy5.onrender.com/get-sub-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adminsWithStatus = res.data.map(admin => ({
        ...admin,
        status: "active", // assume active when fetched
      }));

      setSubAdmins(adminsWithStatus);
    } catch {
      setError("Failed to load sub-admins.");
    } finally {
      setManagementLoading(false);
    }
  };


  const normalizeUrl = (path) => {
    if (!path) return "/placeholder.png";

    let url = path.trim();

    // Fix broken domain+uploads (missing slash)
    url = url.replace(/\.comuploads/, ".com/uploads");

    // Handle relative paths (uploads/... or /uploads/...)
    if (url.startsWith("http")) return url;

    return url;
  };

  // ====== IMAGE HANDLER ======
  // ====== IMAGE HANDLER ======
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      // event.target.result is the Base64 string
      setProfileImageFile(file);               // Keep the original File object
      setProfileImagePreview(event.target.result); // Set Base64 for preview
    };

    reader.readAsDataURL(file); // Converts file to Base64 string
  };


  // ====== SUBMIT FORM ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const updatePromises = [];

      // ✅ Profile image update
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("profile_picture", profileImageFile);

        updatePromises.push(
          api.put(
            `https://lagos-turnup-ecy5.onrender.com/sub-admin/${userData.id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          )
        );
      }

      // ✅ Password update
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (!isPasswordStrong(password)) {
          setError(
            "Password must be stronger (8+ chars, upper, lower, number, special char)."
          );
          return;
        }
        if (!currentPassword) {
          setError("Current password is required to update your password.");
          return;
        }

        updatePromises.push(
          api.put(
            "https://lagos-turnup-ecy5.onrender.com/update-password",
            new URLSearchParams({
              current_password: currentPassword,
              new_password: password,
              confirm_password: confirmPassword,
            }),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
        );
      }

      if (updatePromises.length === 0) {
        setMessage("Nothing to update.");
        return;
      }

      setLoading(true);
      const results = await Promise.all(updatePromises);

      // ✅ If profile image was updated, use backend's permanent URL
      const updatedProfile = results.find((res) =>
        res.config.url.includes(`/sub-admin/`)
      );

      if (updatedProfile) {
        setUserData(updatedProfile.data);
        setProfileImagePreview(
          normalizeUrl(
            updatedProfile.data.profile_picture_url || updatedProfile.data.profile_picture
          )
        );
        setProfileImageFile(null);
      }

      // Reset password fields
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

      setMessage("Update successful!");
    } catch (err) {
      console.error(err);
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // ====== SUB-ADMIN ACTIONS ======
  const performAction = async (url, method, id, newStatus) => {
    try {
      await axios({ method, url, headers: { Authorization: `Bearer ${token}` } });
      setSubAdmins(prev =>
        prev.map(admin =>
          admin.id === id ? { ...admin, status: newStatus } : admin
        )
      );
      setModalInfo({ show: false, title: "", message: "", confirmAction: null });
    } catch {
      setError("Action failed. Please try again.");
    }
  };


  const handleDeactivate = (id) =>
    setModalInfo({
      show: true,
      type:"duration",
      message: "Deactivate Sub-Admin",
      subMessage:"Are you sure you want to deactivate this sub-admin?",
      confirmAction: () =>
        performAction(
          `https://lagos-turnup-ecy5.onrender.com/event/deactivate-user/${id}`,
          "put",
          id,
          "inactive"
        ),
    });

  const handleReactivate = (id) =>
    setModalInfo({
      show: true,
      type:"duration",
      message: "Reactivate Sub-Admin",
      subMessage:"Are you sure you want to reactivate this sub-admin?",
      confirmAction: () =>
        performAction(
          `https://lagos-turnup-ecy5.onrender.com/event/activate-user/${id}`,
          "put",
          id,
          "active"
        ),
    });

  const handleDelete = (id) =>
    setModalInfo({
      show: true,
      type:"duration",
      title: "",
      message: "Delete Sub-Admin",
      subMessage:"This action is permanent. Continue?",
      confirmAction: () =>
        performAction(
          `https://lagos-turnup-ecy5.onrender.com/delete-user/${id}`,
          "delete"
        ),
    });
  

  // ====== CONDITIONAL UI ======
  if (!token) return <p>Please log in to view your profile.</p>;
  if (loading && !userData) return <Loader/>;
  if (error && !userData) return <p className="error">{error}</p>;

  return (
    <div className="profile-dark-container">
      <h2 className="profile-dark-title">PROFILE</h2>

      {message && <p className="success-message">{message}</p>}
      {error && userData && <p className="error">{error}</p>}

      {/* ====== PROFILE FORM ====== */}
      <form onSubmit={handleSubmit} className="profile-dark-content">
        {/* LEFT SIDE */}
        <div className="profile-dark-left">
          <p className="profile-dark-label">Profile Image</p>
          <p className="profile-dark-subtext">Displayed on your profile.</p>
          <LazyLoadImage
            src={profileImagePreview}
            alt="Profile"
            loading="lazy"
            effect="blur"
            className="profile-dark-image"
            onError={(e) => { e.currentTarget.onerror = null; // prevent infinite loop
              e.currentTarget.src = defaultAvatar; }}

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
            style={{marginTop:"5vw", width:"100%", border:"1px", borderColor: 'rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', borderRadius:'5px', }}
          >
            Change Profile Image
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-dark-right">
          <div className="profile-dark-row">
            {/* First Name */}
            <div className="profile-dark-input-group">
              <label>Firstname</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.first_name || ""} readOnly />
                <Lock size={16} color="#666" />
              </div>
            </div>

            {/* Last Name */}
            <div className="profile-dark-input-group">
              <label>Lastname</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.last_name || ""} readOnly />
                <Lock size={16} color="#666" />
              </div>
            </div>
          </div>

          <div className="profile-dark-row">
            {/* Email */}
            <div className="profile-dark-input-group">
              <label>Email</label>
              <div className="profile-dark-input-disabled">
                <input type="email" value={userData?.email || ""} readOnly />
                <Lock size={16} color="#666" />
              </div>
            </div>

            {/* Current Password */}
            <div className="profile-dark-input-group">
              <label>Current Password</label>
              <div className="password-dark-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required={password || confirmPassword}
                  style={{padding:"20px 24px"}}
                />
                <span onClick={() => setShowPassword(!showPassword)} className="toggle-dark-icon">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-dark-row">
            {/* New Password */}
            <div className="profile-dark-input-group">
              <label>New Password</label>
              <div className="password-dark-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{padding:"20px 24px"}}
                />
                <span onClick={() => setShowPassword(!showPassword)} className="toggle-dark-icon">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="profile-dark-input-group">
              <label>Confirm New Password</label>
              <div className="password-dark-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{padding:"20px 24px"}}
                />
                <span onClick={() => setShowPassword(!showPassword)} className="toggle-dark-icon">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="profile-dark-row single-row">
            <div className="profile-dark-input-group full-width">
              <label>Role</label>
              <div className="profile-dark-input-disabled">
                <input type="text" value={userData?.role || ""} readOnly />
                <Lock size={16} color="#666" />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="profile-dark-btn-wrapper">
            <button className="profile-dark-btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* ====== SUB-ADMIN MANAGEMENT ====== */}
      {userData?.role === "super-admin" && (
        <div className="sub-admin-section">
          <h3 className="sub-admin-title" style={{fontFamily:"Rushon Ground"}}>Manage Sub Admins</h3>
          {managementLoading ? (
            <p>Loading sub-admins...</p>
          ) : (
            <div className="sub-admin-list">
              {subAdmins.map((admin) => (
                <div key={admin.id} className="sub-admin-card">
                  <div className="sub-admin-info">
                    <img
                      src={admin.profile_picture_url || admin.profile_picture || "/default-profile.png"}
                      alt={`${admin.first_name} ${admin.last_name}`}
                      className="sub-admin-avatar"
                      onError={(e) => { e.currentTarget.src = defaultAvatar }}
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
                      className="action-btn logs"
                    >
                      View Admin Activity Logs
                    </button>
                    {admin.status === "active" ? (
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
      {/* ====== MODAL (using reusable component) ====== */}
    <Modal
      show={modalInfo.show}
      onClose={() =>
        setModalInfo({ show: false, title: "", type: "", message: "", subMessage: "", confirmAction: null })
      }
      title={modalInfo.title}
      message={modalInfo.message}
      subMessage={modalInfo.subMessage}
      type={modalInfo.type}
      footerButtons={
        <>
          <button
            onClick={modalInfo.confirmAction}
            className="modal-close-btn-primary"
          >
            Confirm
          </button>
          <button
            onClick={() =>
              setModalInfo({ show: false, title: "", type: "", message: "", subMessage: "", confirmAction: null })
            }
            className="modal-close-btn"
          >
            Cancel
          </button>
        </>
      }
    />

    </div>
  );
};

export default ProfileDark;
