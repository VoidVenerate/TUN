import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.svg';
import './AdminNavbar.css';
import { Bell, LogOut } from 'lucide-react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import defaultAvatar from '../../assets/defaultAvatar.png'

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const newState = !prev;
      document.body.classList.toggle('menu-open', newState);
      return newState;
    });
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('https://lagos-turnup.onrender.com/event/notifications');
        setHasUnread(res.data.some(notif => !notif.read));
      } catch (error) {
        console.error("Error loading notification", error);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch profile image & name
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://lagos-turnup.onrender.com/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;
        console.log("User data:", user);
        setUserName(user.first_name || '');

        const pic = user.profile_picture_url || user.profile_picture;
        if (pic) {
          setProfileImage(
            pic.startsWith('http')
              ? pic
              : `https://lagos-turnup.onrender.com${pic}`
          );
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Unable to fetch profile picture', error);
        setProfileImage(null);
      }
    };
    fetchImage();
  }, []);

  // Generate a colored letter avatar
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
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');

    // Close modal first
    setShowLogoutModal(false);

    // Delay navigation for smooth UI
    setTimeout(() => {
      navigate('/auth');
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
          <li><NavLink to="/pendingbanner" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Pending Banner</NavLink></li>
          <li><NavLink to="/banner" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Banner</NavLink></li>
          <li><NavLink to="/discover" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Discover Lagos</NavLink></li>
          <li><NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'} onClick={() => setMenuOpen(false)}>Subscriptions</NavLink></li>
          
        </ul>

        <div className="navbar-button">
          <div className="profile-container">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="profile-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onError={(e) => { e.currentTarget.onerror = null; // prevent infinite loop
                              e.currentTarget.src = defaultAvatar; }}
              />
            ) : (
              renderLetterAvatar()
            )}
            {dropdownOpen && (
              <div className="profile-dropdown">
                <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                <NavLink to="/settings" className="dropdown-item">Settings</NavLink>
              </div>
            )}
          </div>

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

          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Logout Modal */}
      <Modal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        subMessage="You’ll need to log in again to access admin features."
        type="error"
        footerButtons={
          <>
            <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </button>
            <button
              className="modal-close-btn"
              style={{ marginLeft: '10px' }}
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
