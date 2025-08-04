import React, { useState } from 'react';
import logodark from '../../assets/LogoDark.svg';
import { NavLink } from 'react-router-dom';
import './Footer.css';
import fb from '../../assets/fb.svg'
import x from '../../assets/x.svg'
import ig from '../../assets/ig.svg'

const Footer = () => {
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsActive(true);

    // Simulate async (e.g., API call)
    setTimeout(() => {
      setIsActive(false);
    }, 2000);
  };

  return (
    <div className="footer">
      <div className="footer-container">
        <div className="footer-pt1">
          <img src={logodark} alt="Logo" />
          <p>
            Your ultimate guide to exploring the vibrant city of Lagos, Nigeria. From iconic landmarks to hidden gems, top events, and cultural experiences, we take you on a journey to discover the best of Lagos.
          </p>
        </div>

        <div className="footer-pt2">
          <ul className="footer-links">
            <li><NavLink to="/" exact="true">Home</NavLink></li>
            <li><NavLink to="/explore">Explore Lagos</NavLink></li>
            <li><NavLink to="/beyond">Beyond Lagos</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="/promote">Promote An Event</NavLink></li>
          </ul>
        </div>

        <div className="footer-pt3">
          <h4>Stay In The Loop</h4>
          <p>Join our mailing list to stay in the loop with our newest for Event and concert</p>
          <div className="footer-input">
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Enter email address" className="email-ftinput" />
              <button type="submit" className={isActive ? 'active' : ''}>
                {isActive ? 'Subscribing...' : 'Subscribe now'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <hr />
      <div className="footer-logo">
        <img src={fb} />
        <img src={x} />
        <img src={ig} />
      </div>
      <div className="footer-copyright">
        <p>Copyright &copy; TurnupLagos | All right reserved</p>
      </div>
    </div>
  );
};

export default Footer;
