import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.svg';
import './AdminNavbar.css';
import { Bell, LogOut } from 'lucide-react';
import Modal from '../Modal/Modal';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import defaultAvatar from '../../assets/defaultAvatar.png';
import { useAuth } from '../RoleContext/RoleContext';
import { useNotifications } from '../../hooks/queries/useNotifications';

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logoutTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: notifications = [] } = useNotifications();

  const userName = profile?.firstName || '';
  const profileImage = profile?.profileImage || null;

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0].created_at;
      const lastSeen = localStorage.getItem('lastSeenNotification');
      setHasUnread(!lastSeen || new Date(latestNotification) > new Date(lastSeen));
    } else {
      setHasUnread(false);
    }
  }, [notifications]);

  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const newState = !prev;
      document.body.classList.toggle('menu-open', newState);
      return newState;
    });
  };

  const renderLetterAvatar = () => {
    const letter = userName ? userName[0].toUpperCase() : '?';
    const colors = ['#6A5ACD', '#FF6347', '#2E8B57', '#FFB400', '#4682B4', '#D2691E'];
    const bgColor = colors[letter.charCodeAt(0) % colors.length];

    return (
      <div
        className="letter-avatar"
        style={{
          backgroundColor: bgColor,
          color: '#fff',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer'
        }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {letter}
      </div>
    );
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    setShowLogoutModal(false);

    logoutTimeoutRef.current = setTimeout(() => {
      navigate('/auth?key=VFVSTlVQX0xBR09T');
    }, 300);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header">
          <div className="navbar-logo">
            <img src={logo} alt="TurnUp Lagos" />
          </div>

          <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><NavLink to="/adminhome" exact="true" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/adminevents" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Events</NavLink></li>
          <li><NavLink to="/banner" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Banner</NavLink></li>
          <li><NavLink to="/discover" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Discover Lagos</NavLink></li>
          <li><NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Subscriptions</NavLink></li>
        </ul>

        <div className="admin-navbar-button">
          <NavLink
            to="/notification"
            className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}
            onClick={() => setMenuOpen(false)}
          >
            <div className="bell-wrapper">
              <Bell className="bell-icon" />
              {hasUnread && <span className="notification-dot"></span>}
            </div>
          </NavLink>

          <div className="profile-container">
            {profileImage ? (
              <LazyLoadImage
                src={profileImage}
                alt="Profile"
                loading='lazy'
                effect='blur'
                className="profile-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultAvatar;
                }}
                style={{ marginRight: "12px", marginTop: "8px" }}
              />
            ) : (
              renderLetterAvatar()
            )}
            {dropdownOpen && (
              <div className="profile-dropdown">
                <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
              </div>
            )}
          </div>

          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <Modal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title=""
        message="Are you sure you want to log out?"
        subMessage="You'll be signed out of your admin session. You can log back in at any time."
        type="logout"
        footerButtons={
          <>
            <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}>
              Stay Logged In
            </button>
            <button
              className="modal-close-btn acitvated"
              onClick={handleConfirmLogout}
            >
              Yes, log me out
            </button>
          </>
        }
      />
    </>
  );
};

export default AdminNavbar;
