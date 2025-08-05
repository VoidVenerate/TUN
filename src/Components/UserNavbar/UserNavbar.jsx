import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/Logo.svg';
import './UserNavbar.css';

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const newState = !prev;
      if (newState) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
      return newState;
    });
  };

  return (
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
        <li>
          <NavLink
            to="/home"
            exact="true"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/explore"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            Explore Lagos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/beyond"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            Beyond Lagos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            Contact Us
          </NavLink>
        </li>
      </ul>

      <div className="navbar-button">
         <NavLink
            to="/promote"
            className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
            onClick={() => setMenuOpen(false)}
          >
            <button>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              Promote with us
            </button>
          </NavLink>
      </div>
    </nav>
  );
};

export default UserNavbar;
