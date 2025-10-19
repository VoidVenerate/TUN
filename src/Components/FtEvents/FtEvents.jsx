import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./FtEvents.css";
import { useNavigate } from "react-router-dom";

const FtEvents = () => {
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [thumbPos, setThumbPos] = useState(0);

  const sliderRef = useRef(null);
  const scrollInterval = useRef(null);
  const navigate = useNavigate();

  // 🔹 Fetch featured events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "https://lagos-turnup.onrender.com/event/events",
          {
            params: { is_featured: true, limit: 100 },
          }
        );
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching featured events:", err);
      }
    };

    fetchEvents();
  }, []);

  // 🔹 Handle resize + scroll mode
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        stopScroll();
      } else {
        startScroll();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      stopScroll();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🔹 Track scroll for fake thumb
  useEffect(() => {
    if (!isMobile || !sliderRef.current) return;

    const slider = sliderRef.current;

    const handleScroll = () => {
      const scrollLeft = slider.scrollLeft;
      const scrollWidth = slider.scrollWidth;
      const clientWidth = slider.clientWidth;

      const scrollPercent = scrollLeft / (scrollWidth - clientWidth);

      const trackWidth = clientWidth * 0.9; // invisible track area
      const thumbWidth = 50; // same as CSS
      const maxThumbPos = trackWidth - thumbWidth;

      setThumbPos(scrollPercent * maxThumbPos);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [isMobile, events]);

  // 🔹 Fix Safari scroll: allow laptop horizontal scrolling
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Make slider focusable for arrow keys
    slider.setAttribute("tabindex", "0");

    // Convert vertical scroll (wheel) to horizontal scroll
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        slider.scrollLeft += e.deltaY;
        e.preventDefault(); // prevent vertical page scroll
      }
    };

    slider.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      slider.removeEventListener("wheel", handleWheel, { passive: false });
      slider.removeAttribute("tabindex");
    };
  }, [isMobile]);

  const startScroll = () => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      const slider = sliderRef.current;
      if (slider) {
        slider.scrollLeft += 2;
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
    }, 10);
  };

  const stopScroll = () => {
    clearInterval(scrollInterval.current);
    scrollInterval.current = null;
  };

  return (
    <nav className="ft-events">
      <div className="ft-header">
        <p style={{ fontFamily: "Rushon Ground" }}>Featured Events🔥</p>
      </div>

      <div
        className={`slider ${isMobile ? "mobile-slider" : ""}`}
        ref={sliderRef}
        onMouseEnter={!isMobile ? stopScroll : undefined}
        onMouseLeave={!isMobile ? startScroll : undefined}
      >
        <ul style={{ display: "flex" }}>
          {[...events, ...(!isMobile ? events : [])].map((event, index) => (
            <li key={`${event.id}-${index}`} style={{ flex: "0 0 auto" }}>
              <div className="slider-info">
                <div className="event-info">
                  <img
                    src={event.flyer_url || event.event_flyer}
                    alt={event.event_name}
                    className="event-img"
                  />
                  <div className="event-text">
                    <p>{event.event_name}</p>
                    <p>{event.state}</p>
                  </div>
                </div>

                <div className="slider-btn">
                  <button onClick={() => navigate(`/viewdetails/${event.id}`)}>
                    View Details
                  </button>

                  <button disabled className="buy-tickets-btn">
                    Buy Tickets
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔹 Floating fake thumb (only mobile) */}
      {isMobile && (
        <div
          className="fake-thumb"
          style={{ transform: `translateX(${thumbPos}px)` }}
        ></div>
      )}
    </nav>
  );
};

export default FtEvents;
