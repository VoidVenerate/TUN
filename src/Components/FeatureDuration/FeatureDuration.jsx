// FeatureDuration.jsx
import React, { useState } from "react";
import Modal from "../Modal/Modal";
import "./FeatureDuration.css";

const FeatureDuration = ({ role, show, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(null);

  const options = [
    { label: "3 Days", value: "3d" },
    { label: "1 Week", value: "1w" },
    { label: "2 Weeks", value: "2w" },
    { label: "1 Month", value: "1m" }
  ];

  const handleSubmit = () => {
    if (!selected) return;
    if (typeof onConfirm === "function") {
      onConfirm(selected);
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };


  return (
    <Modal
      show={show}
      onClose={onClose}
      type='duration'
      title=''
      message="Choose Feature Duration"
      subMessage={
        <div className="fd-container">
          <p className="fd-description">
            This event has been submitted as a featured event. Before approving, select how long it should stay featured. Once the duration ends, it will automatically revert to regular status.
          </p>

          <div className="fd-options">
            {options.map((option) => (
              <button
                key={option.value}
                className={`fd-option ${selected === option.value ? "selected" : ""}`}
                onClick={() => setSelected(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      }
      footerButtons={
        <button
          className="fd-submit-btn"
          disabled={!selected}
          onClick={handleSubmit}
          type="button"
        >
          Submit Duration
        </button>
      }
    />
  );
};

export default FeatureDuration;
