import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IntroAnimation.css";

const IntroAnimation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home"); // Redirect after animation
    }, 4500); // Animation duration
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="intro-container">
      {/* Animated Sweep Lines */}
      <div className="sweep-line"></div>
      <div className="sweep-line delay"></div>

      {/* Floating Particles */}
      <div className="particles"></div>

      {/* Logo */}
      <div className="intro-logo">
        <h1>TurnUpLagos</h1>
        <p className="intro-tagline">Your City. Your Events.</p>
      </div>
    </div>
  );
};

export default IntroAnimation;
