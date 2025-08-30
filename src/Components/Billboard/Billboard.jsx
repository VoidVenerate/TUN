import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Billboard.css";

const Billboard = () => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  // ===== FETCH BANNERS FROM API =====
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get("https://lagos-turnup.onrender.com/event/banners", {
          params: { approved_only: true }, // if you want only approved banners
        });

        // The API returns an array of banners
        setSlides(res.data || []);
      } catch (error) {
        console.error("Failed to load banners:", error);
      }
    };

    fetchSlides();
  }, []);

  // ===== AUTO SLIDE =====
  useEffect(() => {
    if (!paused && slides.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
      }, 2500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, slides]);

  return (
    <div
      className="slider-container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.length > 0 ? (
        slides.map((slide, i) => (
          <a
            key={slide.id}
            href={slide.banner_link || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={slide.banner_url || slide.banner_image}
              alt={slide.name || `Banner ${slide.id}`}
              className={`slide fade ${i === index ? "active" : ""}`}
            />
          </a>
        ))
      ) : (
        <p className="loading-text">Loading banners...</p>
      )}
    </div>
  );
};

export default Billboard;
