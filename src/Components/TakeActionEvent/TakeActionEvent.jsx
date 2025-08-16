import React, { useState, useRef, useEffect } from "react";
import { useEvent } from '../EventContext/EventContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import EventDetailsContent from '../EventContentDetails/EventContentDetails';
import FeatureDuration from '../FeatureDuration/FeatureDuration';

const TakeActionEvent = ({ role }) => {
  const { eventData } = useEvent();
  const navigate = useNavigate();

  // final success/error modal info
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
  });

  // explicit confirm modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);

  // feature duration control
  const [showFeatureDuration, setShowFeatureDuration] = useState(false);

  // hover state + timeout ref
  const [isPublishHover, setIsPublishHover] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup timeout on unmount
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const completeUpload = (featureDuration) => {
    // featureDuration optional; use in API if needed
    const success = true; // replace with real API call
    setModalInfo({
      show: true,
      title: success ? 'Success!' : 'Error!',
      message: success ? 'Event uploaded successfully!' : 'Failed to upload event.',
      subMessage: success ? 'The event is now live on TurnUpLagos.' : '',
      type: success ? 'success' : 'error',
    });
  };

  // open confirm (upload) modal
  const handleUploadClick = () => {
    setShowConfirmModal(true);
  };

  // open confirm (reject) modal
  const handleRejectClick = () => {
    setShowConfirmRejectModal(true);
  };

  // user confirms upload in confirm modal
  const handleConfirmUpload = () => {
    setShowConfirmModal(false);
    if (String(eventData.featureChoice).toLowerCase() === 'yes-feature') {
      setShowFeatureDuration(true);
    } else {
      completeUpload();
    }
  };

  // user confirms reject in reject confirm modal
  const confirmReject = () => {
    setShowConfirmRejectModal(false);
    // perform rejection action (API) here if needed, then show rejected modal
    setModalInfo({
      show: true,
      title: 'Rejected',
      message: 'Event has been rejected.',
      subMessage: '',
      type: 'error',
    });
  };

  const closeFinalModal = () => setModalInfo(prev => ({ ...prev, show: false }));

  // styles
  const closeBtnStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #2f2f2fff',
    color: '#ccc',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const publishBtnStyle = (hover) => ({
    backgroundColor: hover ? '#6c43e6' : '#5423D2',
    color: 'white',
    border: 'none',
    marginTop: '10px',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  });

  // hover handlers
  const handlePublishMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsPublishHover(true);
  };
  const handlePublishMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsPublishHover(false), 250);
  };

  return (
    <>
      <EventDetailsContent
        eventData={eventData}
        onBackDetails={() => navigate('/adminpromoteevent')}
        onBackFeature={() => navigate('/adminfeatureevent')}
        renderExtraButtons={() => (
          <>
            <button
              className="reject-event-btn"
              onClick={handleRejectClick}
              style={{
                marginRight: '12px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              type="button"
            >
              Reject Event
            </button>

            <button
              className="upload-event-btn"
              onClick={handleUploadClick}
              style={{
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              type="button"
            >
              Upload Event
            </button>
          </>
        )}
      />

      {/* Confirm Upload Modal */}
      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm"
        message="Are you sure you want to upload this event?"
        subMessage="Once published, the event will go live on TurnUpLagos and be visible to all users. You will not be able to undo this action."
        footerButtons={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={closeBtnStyle} onClick={() => setShowConfirmModal(false)} type="button">Cancel</button>
            <button
              style={publishBtnStyle(isPublishHover)}
              onClick={handleConfirmUpload}
              onMouseEnter={handlePublishMouseEnter}
              onMouseLeave={handlePublishMouseLeave}
              type="button"
            >
              Yes, Publish
            </button>
          </div>
        }
      />

      {/* Confirm Reject Modal */}
      <Modal
        show={showConfirmRejectModal}
        onClose={() => setShowConfirmRejectModal(false)}
        title="Confirm Reject"
        message="Are you sure you want to reject this event?"
        subMessage="The event will not be published. Optionally, you may contact the organizer to provide feedback or a reason for rejection."
        footerButtons={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={closeBtnStyle} onClick={() => setShowConfirmRejectModal(false)} type="button">Cancel</button>
            <button
              style={publishBtnStyle(isPublishHover)}
              onClick={confirmReject}
              onMouseEnter={handlePublishMouseEnter}
              onMouseLeave={handlePublishMouseLeave}
              type="button"
            >
              Yes, Reject
            </button>
          </div>
        }
      />

      {/* Feature duration flow (only shown when confirm => event is featured) */}
      {showFeatureDuration && (
        <FeatureDuration
          onClose={() => setShowFeatureDuration(false)}
          onConfirm={(selectedDuration) => {
            // you can send selectedDuration to backend here
            setShowFeatureDuration(false);
            completeUpload(selectedDuration);
          }}
          role={role}
        />
      )}

      {/* Final success/error modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeFinalModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          <button
            style={{
              backgroundColor: '#5423D2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={closeFinalModal}
            type="button"
          >
            Close
          </button>
        }
      />
    </>
  );
};

export default TakeActionEvent;
