import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Modal from '../Components/Modal/Modal';
import UploadProfileModal from '../Components/UploadProfileModal/UploadProfileModal';
import './Auth.css';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [boost, setBoost] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setBoost(true);
    setIsSignUp(!isSignUp);
    setTimeout(() => setBoost(false), 600);
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sub-admin',
    profile_picture: null
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetPassword1, setShowResetPassword1] = useState(false);
  const [showResetPassword2, setShowResetPassword2] = useState(false);

  // Forgot/reset password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newUserId, setNewUserId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const isPasswordStrong = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const validateSignUpFields = () => {
    if (!formData.first_name.trim()) return "First name is required";
    if (!formData.last_name.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (!isPasswordStrong(formData.password)) {
      return "Password must be 8+ chars, include uppercase, lowercase, number, and special character.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      const validationError = validateSignUpFields();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const signupData = new FormData();
        signupData.append("first_name", formData.first_name);
        signupData.append("last_name", formData.last_name);
        signupData.append("email", formData.email);
        signupData.append("password", formData.password);
        signupData.append("role", formData.role);
        if (formData.profile_picture) {
          signupData.append("profile_picture", formData.profile_picture);
        }

        const res = await axios.post(
          "https://lagos-turnup.onrender.com/sub-admin-signup",
          signupData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setNewUserId(res.data.user?.id || null);
        setShowUploadModal(true);

      } else {
        const res = await axios.post(
          "https://lagos-turnup.onrender.com/sub-admin-login",
          { email: formData.email, password: formData.password }
        );

        localStorage.setItem("token", res.data.access_token);
        console.log(res.data); // See the exact structure from backend
        setModalMessage("Login successful! Redirecting...");
        setShowSuccessModal(true);

        setTimeout(() => {
          if (res.data.role === "super-admin") {
            navigate("/super-admin-dashboard");
          } else {
            navigate("/adminhome");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Auth Error:", err.response?.data || err.message);
      const backendError = err.response?.data;
      if (backendError?.detail && Array.isArray(backendError.detail)) {
        setError(backendError.detail[0]?.msg || "Validation error");
      } else {
        setError(backendError?.message || `${isSignUp ? "Signup" : "Login"} failed`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post('https://lagos-turnup.onrender.com/auth/google/login', {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError('Google authentication failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setModalMessage("Please enter your email");
      setShowSuccessModal(true);
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post("/email/send-otp-email", {
        to_email: forgotEmail,
        recipient_name: "User",
      });
      setShowForgotModal(false);
      setShowResetModal(true);
    } catch (err) {
      console.error("Forgot Password Error:", err.response?.data || err.message);
      setModalMessage(err.response?.data?.message || "Failed to send reset email");
      setShowSuccessModal(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setModalMessage("Passwords do not match");
      setShowSuccessModal(true);
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setModalMessage(
        "Password must be 8+ chars, include uppercase, lowercase, number, and special character."
      );
      setShowSuccessModal(true);
      return;
    }
    setResetLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post("/email/verify-otp", {
        email: forgotEmail,
        otp: resetOTP,
      });

      if (!verifyRes.data.verified) {
        setModalMessage("Invalid or expired OTP");
        setShowSuccessModal(true);
        return;
      }

      // Step 2: Actually reset password
      await axios.post("/reset-password", {
        email: forgotEmail,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      setShowResetModal(false);
      setModalMessage("Password has been reset! Please log in.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Reset Password Error:", err.response?.data || err.message);
      setModalMessage(err.response?.data?.message || "Password reset failed");
      setShowSuccessModal(true);
    } finally {
      setResetLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    navigate('/adminhome');
  };

  return (
    <div className="auth-scene">
      <div className={`auth-card ${isSignUp ? '' : 'flipped'} ${boost ? 'boost' : ''}`}>
        
        {/* Sign Up */}
        <div className="auth-face auth-front">
          <div className="logo-panel">
            <h1 style={{ fontFamily: 'Rushon Ground' }}>TurnUp Lagos</h1>
          </div>
          <div className="form-panel">
            <h2>SIGN UP (Sub-Admins Only)</h2>
            <form onSubmit={handleSubmit}>
              <div className="google-btn">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign up failed")}
                />
              </div>
              <div className="form-fields">
                <div className="row">
                  <div className="form-row">
                    <label>First Name <span>*</span></label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <label>Last Name <span>*</span></label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </div>
                </div>
                <label>Email <span>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                <label>Password <span>*</span></label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)} className="toggle-icon">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <label>Confirm Password <span>*</span></label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-icon">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
            </form>
            <p onClick={toggleMode} className="toggle-link">Already have an account? Sign In</p>
          </div>
        </div>

        {/* Sign In */}
        <div className="auth-face auth-back">
          <div className="logo-panel">
            <h1 style={{ fontFamily: 'Rushon Ground' }}>TurnUp Lagos</h1>
          </div>
          <div className="form-panel">
            <h2>SIGN IN</h2>
            <form onSubmit={handleSubmit}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign in failed")}
                />
              <div className="form-fields">
                <label>Email <span>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Password <span>*</span></label>
                <div className="password-input">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span onClick={() => setShowLoginPassword(!showLoginPassword)} className="toggle-icon">
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
            <p className="toggle-link" onClick={() => setShowForgotModal(true)}>Forgot Password?</p>
            <p onClick={toggleMode} className="toggle-link">Don’t have an account? Sign Up</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Forgot Password"
        message="Enter your email to receive a reset OTP."
        type="info"
        footerButtons={
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
            <button onClick={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </>
        }
      />

      {/* Reset Password Modal */}
      <Modal
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Your Password"
        message="Enter the OTP sent to your email and your new password."
        type="info"
        footerButtons={
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={resetOTP}
              onChange={(e) => setResetOTP(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
            <input
              type={showResetPassword1 ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
            <input
              type={showResetPassword2 ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
            <button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        }
      />

      {/* Upload Profile Modal */}
      <UploadProfileModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={handleUploadComplete}
        userId={newUserId}
        first_name={formData.first_name}
        last_name={formData.last_name}
        email={formData.email}
        password={formData.password}
        role="sub-admin"
      />


      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Notice"
        message={modalMessage}
        type="success"
      />
    </div>
  );
};

export default Auth;
