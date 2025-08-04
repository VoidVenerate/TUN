import React, { useState, useEffect, useRef } from 'react';
import Bb1 from '../../assets/Bb1.png';
import Bb2 from '../../assets/Bb2.png';
import Bb3 from '../../assets/Bb3.png';
import Bb4 from '../../assets/Bb4.png';
import './Billboard.css';

const Billboard = () => {
  const slides = [
    { id: 1, content: Bb1 },
    { id: 2, content: Bb2 },
    { id: 3, content: Bb3 },
    { id: 4, content: Bb4 },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!paused) {
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
      }, 2500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, slides.length]);


  return (
    <div
      className="slider-container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.content}
          alt={`Slide ${slide.id}`}
          className={`slide fade ${i === index ? 'active' : ''}`}
        />
      ))}

      {/* <div className="nav-buttons">
        <button onClick={prevSlide} aria-label="Previous Slide">⬅</button>
        <button onClick={nextSlide} aria-label="Next Slide">➡</button>
      </div> */}

      {/* <div className="indicators">
        {slides.map((_, i) => (
          <span
            key={i}
            className={i === index ? 'dot active' : 'dot'}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIndex(i);
            }}
          />
        ))}
      </div> */}
    </div>
  );
};

export default Billboard;
