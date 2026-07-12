import React, { useEffect, useRef, useState } from 'react';
import logodark from '../../assets/LogoDark.svg';
import { NavLink } from 'react-router-dom';
import './Footer.css';
import fb from '../../assets/fb.svg';
import x from '../../assets/x.svg';
import ig from '../../assets/ig.svg';
import { useSubscribeNewsletter } from '../../hooks/queries/useNewsletter';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const subscribeTimeoutRef = useRef(null);

  const subscribeMutation = useSubscribeNewsletter();

  useEffect(() => {
    return () => {
      if (subscribeTimeoutRef.current) clearTimeout(subscribeTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await subscribeMutation.mutateAsync(email);
      setIsSubscribed(true);
      setEmail('');

      if (subscribeTimeoutRef.current) clearTimeout(subscribeTimeoutRef.current);
      subscribeTimeoutRef.current = setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsSubscribed(false);
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
              <button type="submit" disabled={subscribeMutation.isPending || isSubscribed}>
                {subscribeMutation.isPending ? 'Subscribing...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
            {message && <p className="subscribe-message">{message}</p>}
          </div>
        </div>
      </div>
      <span className='hr-span'></span>
      <div className="footer-logo">
        <NavLink to='https://www.tiktok.com/@turn.up.lagos?_r=1&_t=ZS-944rdC13YBU' className="social-link">
          <svg className="social-icon tiktok-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </NavLink>
        <NavLink to='' className="social-link">
          <img src={fb} alt="Facebook" className="social-icon" />
        </NavLink>
        <NavLink to='https://x.com/TurnUpLag' className="social-link">
          <img src={x} alt="X (Twitter)" className="social-icon" />
        </NavLink>
        <NavLink to='https://www.instagram.com/turnuplag/' className="social-link">
          <img src={ig} alt="Instagram" className="social-icon" />
        </NavLink>
      </div>
      <div className="footer-copyright">
        <p>Copyright &copy; TurnupLagos | All right reserved</p>
      </div>
    </div>
  );
};

export default Footer;
