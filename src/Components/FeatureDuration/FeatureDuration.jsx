// FeatureDuration.jsx
import React, { useState } from "react";
import "./FeatureDuration.css";

const FeatureDuration = ({ role, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(null);

  const options = [
    { label: "3 Days", value: "3d" },
    { label: "1 Week", value: "1w" },
    { label: "2 Weeks", value: "2w" },
    { label: "1 Month", value: "1m" }
  ];

  const handleSelect = (value) => {
    setSelected(value);
  };

  const handleSubmit = () => {
    if (!selected) return;
    // call onConfirm first (pass selected), then optionally close
    if (typeof onConfirm === 'function') {
      onConfirm(selected);
    }
    // then close modal
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // only check role if it's explicitly passed
  if (role && role !== "sub-admin" && role !== "super-admin") return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="feature-duration-container">
          <div className="feature-header">
            <span className="feature-icon">💡</span>
            <h2>Choose Feature Duration</h2>
          </div>

          <p className="feature-description">
            This event has been submitted as a featured event. Before approving,
            select how long it should stay featured.
          </p>

          <div className="feature-options">
            {options.map((option) => (
              <button
                key={option.value}
                className={`feature-option ${selected === option.value ? "selected" : ""}`}
                onClick={() => handleSelect(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            className="submit-button"
            disabled={!selected}
            onClick={handleSubmit}
            type="button"
          >
            Submit Duration
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDuration;
