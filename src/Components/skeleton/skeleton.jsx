import React, { useState } from "react";
import "./Skeleton.css";

const EventImage = ({ src, alt, height = "250px" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      {/* Skeleton while loading */}
      {!loaded && (
        <div className="skeleton" style={{ width: "100%", height }} />
      )}

      {/* Real Image */}
      <img
        src={src}
        alt={alt}
        className={`event-img ${loaded ? "loaded" : ""}`}
        style={{ height }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default EventImage;
