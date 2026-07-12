import React, { useState, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import "./Billboard.css";
import { useApprovedBanners } from "../../hooks/queries/useBanners";

const Billboard = () => {
  const { data: slides = [] } = useApprovedBanners();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

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
            <div className={`slide fade ${i === index ? "active" : ""}`}>
              <img
                src={slide.banner_url || slide.banner_image}
                alt={slide.name || `Banner ${slide.id}`}
                className="banner-img"
              />
            </div>
          </a>
        ))
      ) : (
        [...Array(3)].map((_, idx) => (
          <div key={idx} className="slide fade active">
            <Skeleton
              height={300}
              borderRadius={10}
              baseColor="#1e1e1e"
              highlightColor="#333"
              className="skeleton-banner"
            />
          </div>
        ))
      )}
    </div>
  );
};

export default Billboard;
