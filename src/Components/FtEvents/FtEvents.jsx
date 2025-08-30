import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./FtEvents.css";

const FtEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const sliderRef = useRef(null);
  const scrollInterval = useRef(null);

  // 🔹 Fetch featured events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("https://lagos-turnup.onrender.com/event/events", {
          params: { is_featured: true, limit: 10 }, // fetch only featured
        });
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching featured events:", err);
      }
    };

    fetchEvents();
    startScroll();
    return () => stopScroll();
  }, []);

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
        slider.scrollLeft += 0.5; // adjust speed
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
        className="slider"
        ref={sliderRef}
        onMouseEnter={stopScroll}
        onMouseLeave={startScroll}
      >
        <ul style={{ display: "flex" }}>
          {[...events, ...events].map((event, index) => (
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
                      {event.venue} • {event.state}
                    </p>
                  </div>
                </div>

                <div className="slider-btn">
                  <button
                    className={
                      activeBtn.index === index && activeBtn.type === "details"
                        ? "active"
                        : ""
                    }
                    onClick={() => handleClick(index, "details")}
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
    </nav>
  );
};

export default FtEvents;
