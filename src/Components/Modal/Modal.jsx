// Modal.jsx
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react'; // ✅ Icons
import './Modal.css';

const Modal = ({ show, onClose, title, message, subMessage, type }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container ${type}`}
        onClick={e => e.stopPropagation()}
      >
        {/* === Title Row with Icon === */}
        <div className="modal-title-row">
          {type === 'success' && <CheckCircle className="modal-icon success-icon" />}
          {type === 'error' && <XCircle className="modal-icon error-icon" />}
          <h2 className="modal-title">{title}</h2>
        </div>

        {/* === Message Content === */}
        <p className="modal-message">{message}</p>
        {subMessage && <p className="modal-subMessage">{subMessage}</p>}

        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
