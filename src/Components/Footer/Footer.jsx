import React, { useState } from 'react';
import logodark from '../../assets/LogoDark.svg';
import { NavLink } from 'react-router-dom';
import './Footer.css';
import fb from '../../assets/fb.svg';
import x from '../../assets/x.svg';
import ig from '../../assets/ig.svg';
import api from '../api'; // make sure your axios instance is exported from ../api

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await api.post('/event/newsletter', { email });
      setMessage('✅ You have been subscribed successfully!');
      setEmail('');
    } catch (err) {
      console.error(err);
      setMessage('❌ Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <p>Join our mailing list to stay in the loop with our newest events and concerts</p>
          <div className="footer-input">
            <form onSubmit={handleSubmit} className="subscribe">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="email-ftinput"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : 'Subscribe now'}
              </button>
            </form>
            {message && <p className="subscribe-message">{message}</p>}
          </div>
        </div>
      </div>
      <hr />
      <div className="footer-logo">
        <NavLink to='' ><img src={fb} alt="Facebook" /></NavLink>
        <NavLink to='https://x.com/TurnUpLag'><img src={x} alt="X (Twitter)" /></NavLink>
        <NavLink to='https://www.instagram.com/turnuplag/'><img src={ig} alt="Instagram" /></NavLink>
        
      </div>
      <div className="footer-copyright">
        <p>Copyright &copy; TurnupLagos | All right reserved</p>
      </div>
    </div>
  );
};

export default Footer;
