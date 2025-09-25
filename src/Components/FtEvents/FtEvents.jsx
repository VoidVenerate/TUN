import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./FtEvents.css";
import { NavLink, useNavigate } from "react-router-dom";

const FtEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderRef = useRef(null);
  const scrollInterval = useRef(null);
  const navigate = useNavigate()

  // 🔹 Fetch featured events
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

  // 🔹 Track current index for mobile dots
  useEffect(() => {
    if (!isMobile || !sliderRef.current) return;

    const slider = sliderRef.current;

    const handleScroll = () => {
      const cardWidth = slider.firstChild?.firstChild?.offsetWidth || 1;
      const index = Math.round(slider.scrollLeft / (cardWidth + 16)); // 16px margin
      setCurrentIndex(Math.min(index, events.length - 1));
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [isMobile, events]);

  const handleClick = (index, type) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null });
    } else {
      setActiveBtn({ index, type });
    }
  };

  const startScroll = () => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      const slider = sliderRef.current;
      if (slider) {
        slider.scrollLeft += 0.5;
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
            <li
              key={`${event.id}-${index}`}
              style={{ flex: "0 0 auto", marginRight: "16px" }}
            >
              <div className="slider-info">
                <div className="event-info">
                  <img
                    src={event.flyer_url || event.event_flyer}
                    alt={event.event_name}
                    className="event-img"
                  />
                  <div className="event-text">
                    <p>{event.event_name}</p>
                    <p>
                      {event.state}
                    </p>
                  </div>
                </div>

                <div className="slider-btn">
                  <button
                    onClick={() => navigate(`/viewdetails/${event.id}`)}
                    
                  >
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

      {/* 🔹 Pagination dots (only show on mobile) */}
    </nav>
  );
};

export default FtEvents;
