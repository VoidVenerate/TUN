import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./FtEvents.css";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const FtEvents = () => {
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [thumbPos, setThumbPos] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const sliderRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("https://lagos-turnup.onrender.com/event/events", {
          params: { is_featured: true, limit: 10 },
        });
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching featured events:", err);
      }
    };
    fetchEvents();
  }, []);

  // ✅ Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto fade (desktop) with pause-on-hover
  useEffect(() => {
    if (isMobile || events.length === 0 || isPaused) return;
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [isMobile, events, currentIndex, isPaused]);

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 3) % events.length);
      setIsFading(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 3 + events.length) % events.length);
      setIsFading(false);
    }, 500);
  };

  // ✅ Mobile scroll tracking
  useEffect(() => {
    if (!isMobile || !sliderRef.current) return;
    const slider = sliderRef.current;

    const handleScroll = () => {
      const scrollLeft = slider.scrollLeft;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const scrollPercent = scrollLeft / maxScroll;

      const trackWidth = slider.clientWidth * 0.9;
      const thumbWidth = 50;
      const maxThumbPos = trackWidth - thumbWidth;

      setThumbPos(scrollPercent * maxThumbPos);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [isMobile, events]);

  const truncateWords = (text, maxWords = 1) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // ✅ Desktop: show 3 events at a time
  const visibleEvents = isMobile
    ? events
    : events.slice(currentIndex, currentIndex + 3).concat(
        events.slice(0, Math.max(0, currentIndex + 3 - events.length))
      );

  return (
    <nav className="ft-events">
      <div className="ft-header">
        <p style={{ fontFamily: "Rushon Ground" }}>Featured Events🔥</p>
        {!isMobile && (
          <div className="slider-controls">
            <button onClick={handlePrev}><ChevronLeft /></button>
            <button onClick={handleNext}><ChevronRight /></button>
          </div>
        )}
      </div>

      <div
        className={`slider ${isMobile ? "mobile-slider" : "fade-slider"} ${isFading ? "fade-out" : "fade-in"}`}
        ref={sliderRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <ul>
          {visibleEvents.map((event, index) => (
            <li key={`${event.id}-${index}`}>
              {/* ✅ Whole card clickable */}
              <div
                className="slider-info clickable-card"
              >
                <div className="event-info">
                  <LazyLoadImage
                    src={event.flyer_url || event.event_flyer}
                    alt={event.event_name}
                    className="event-img"
                    effect="blur"
                    onClick={() => navigate(`/viewdetails/${event.id}`)}
                  />
                  <div className="event-text">
                    <p onClick={() => navigate(`/viewdetails/${event.id}`)}>{truncateWords(event.event_name, 1)}</p>
                    <p onClick={() => navigate(`/viewdetails/${event.id}`)}>{event.state}</p>
                  </div>
                </div>

                <div className="slider-btn">
                  <button onClick={() => navigate(`/viewdetails/${event.id}`)}>View Details</button>
                  <button
                    disabled
                    className="buy-tickets-btn"
                    type="button"
                    onClick={(e) => e.stopPropagation()} // 🧠 stops click from bubbling up
                  >
                    Buy Tickets
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isMobile && (
        <div className="fake-thumb" style={{ transform: `translateX(${thumbPos}px)` }}></div>
      )}
    </nav>
  );
};

export default FtEvents;
