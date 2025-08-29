/* JavaScript (React JSX) - plain JS, no TypeScript */
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEvent } from '../EventContext/EventContext'; 
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import './TakeAction.css'
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import { Check, Trash2 } from 'lucide-react'; // ⬅️ icons used in PendingEvents

const TakeAction = ({ role }) => {
  const { eventData, updateEvent, setEventData, deleteEvent } = useEvent(); 
  const navigate = useNavigate();
  const { event_id } = useParams();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      eventName: '',
      location: '',
      venue: '',
      date: '',
      time: '',
      dressCode: '',
      description: '',
      featureChoice: 'no-feature',
      contactMethod: '',
      contactValue: '',
      link: '',
      flyerFile: null,
      flyerPreview: null,
    }
  });

  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', subMessage: '' });
  const [showFeatureDuration, setShowFeatureDuration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [featureChoice, setFeatureChoice] = useState('no-feature');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [isPublishHover, setIsPublishHover] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const flyerFile = watch('flyerFile');

  useEffect(() => {
    if (flyerFile && flyerFile.length > 0) {
      const file = flyerFile[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PNG and JPEG are allowed.');
        setValue('flyerFile', null);
        setValue('flyerPreview', null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (img.width <= 400 && img.height <= 800) {
            setValue('flyerPreview', event.target.result);
          } else {
            alert('Image must be max 400x800px.');
            setValue('flyerFile', null);
            setValue('flyerPreview', null);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      setValue('flyerPreview', null);
    }
  }, [flyerFile, setValue]);

  useEffect(() => {
    if (!event_id) return;

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/event/events`, {
          params: { id: event_id },
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data[0];
        if (!data) throw new Error('Event not found');

        const normalizedData = { ...data, id: data.id, flyerPreview: data.flyer_url || data.event_flyer || '' };
        setEventData(normalizedData);

        reset({
          eventName: data.event_name || '',
          date: data.date || '',
          time: data.time || '',
          location: data.state || '',
          venue: data.venue || '',
          dressCode: data.dress_code || '',
          description: data.event_description || '',
          flyerPreview: data.flyer_url
            ? data.flyer_url
            : data.event_flyer
              ? `https://lagos-turnup.onrender.com/${data.event_flyer.replace(/^\//, '')}`
              : '',
          featureChoice: data.is_featured ? 'yes-feature' : 'no-feature',
          link: data.link || '',
          contactMethod: data.contact_method || '',
          contactValue: data.contact_value || ''
        });

        setFeatureChoice(data.is_featured ? 'yes-feature' : 'no-feature');
      } catch (err) {
        console.error('Failed to fetch event', err);
        setModalInfo({ show: true, title: 'Error', message: 'Error fetching event details.', subMessage: err?.message || '' });
      }
    };

    fetchEvent();
  }, [event_id, reset, setEventData]);

  const onSubmit = async (data) => {
    if (!eventData?.id) {
      setModalInfo({ show: true, title: 'Error', message: 'No event ID to update.', subMessage: '' });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('event_name', data.eventName);
      fd.append('state', data.location);
      fd.append('venue', data.venue);
      fd.append('date', data.date);
      fd.append('time', data.time);
      fd.append('dress_code', data.dressCode);
      fd.append('event_description', data.description);
      fd.append('is_featured', data.featureChoice === 'yes-feature');
      fd.append('contact_method', data.contactMethod);
      fd.append('contact_value', data.contactValue);
      fd.append('link', data.link);

      if (data.flyerFile && data.flyerFile.length > 0) {
        fd.append('event_flyer', data.flyerFile[0]);
      }

      let updated;
      if (typeof updateEvent === 'function') {
        updated = await updateEvent(event_id, fd);
      } else {
        const token = localStorage.getItem('token');
        const res = await api.put(`/event/events/${event_id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        updated = res.data;
      }

      setEventData(updated);
      setModalInfo({ show: true, title: 'Success', message: 'Event updated successfully.', subMessage: '' });

      if (featureChoice === 'yes-feature') {
        setShowFeatureDuration(true);
      }

      navigate('/adminevents');
    } catch (err) {
      setModalInfo({ show: true, title: 'Error', message: 'Failed to save event. Try again.', subMessage: err?.message || '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!eventData?.id) {
      setModalInfo({ show: true, title: 'Error', message: 'No event ID to delete.', subMessage: '' });
      return;
    }

    setModalInfo({
      show: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      subMessage: '',
      onConfirm: async () => {
        setDeleting(true);
        try {
          if (typeof deleteEvent === 'function') {
            await deleteEvent(event_id);
          } else {
            const token = localStorage.getItem('token');
            await api.delete(`/event/events/${event_id}`, { headers: { Authorization: `Bearer ${token}` } });
          }

          setModalInfo({ show: true, title: 'Deleted', message: 'Event deleted successfully.', subMessage: '' });
          navigate('/adminevents');
        } catch (err) {
          setModalInfo({ show: true, title: 'Error', message: 'Failed to delete event. Please try again.', subMessage: err?.message || '' });
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  const handleUploadClick = () => setShowConfirmModal(true);
  const handleRejectClick = () => setShowConfirmRejectModal(true);

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

  const closeBtnStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #2f2f2fff',
    color: '#ccc',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const handlePublishMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsPublishHover(true);
  };
  const handlePublishMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsPublishHover(false), 250);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmModal(false);

    if (!event_id) {
      setModalInfo({ show: true, title: 'Error', message: 'No event id available to publish.', subMessage: '' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/event/approve-event/${event_id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (String(featureChoice || eventData?.featureChoice).toLowerCase() === 'yes-feature' || eventData?.is_featured) {
        setShowFeatureDuration(true);
      } else {
        setModalInfo({ show: true, title: 'Success', message: 'Event uploaded successfully!', subMessage: '' });
        navigate('/adminevents');
      }
    } catch (err) {
      console.error('Publish failed', err);
      setModalInfo({ show: true, title: 'Error', message: 'Failed to publish event.', subMessage: err?.message || '' });
    } finally {
      setSaving(false);
    }
  };

  const confirmReject = async () => {
    setShowConfirmRejectModal(false);

    if (!event_id) {
      setModalInfo({ show: true, title: 'Error', message: 'No event id available to reject.', subMessage: '' });
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/event/events/${event_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalInfo({ show: true, title: 'Rejected', message: 'Event has been rejected and deleted.', subMessage: '' });
      navigate('/adminevents');
    } catch (err) {
      console.error('Reject failed', err);
      setModalInfo({ show: true, title: 'Error', message: 'Failed to reject/delete event.', subMessage: err?.message || '' });
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => setModalInfo(prev => ({ ...prev, show: false }));

  const handleFeatureConfirm = (selectedDuration) => {
    setShowFeatureDuration(false);
    setModalInfo({ show: true, title: 'Success', message: `Event featured for ${selectedDuration}.`, subMessage: '' });
    navigate('/adminevents');
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          <button onClick={() => navigate(-1)} className="review-back-btn">←</button>
          EDIT EVENT
        </h1>
      </header>

      <form id='eventForm' onSubmit={handleSubmit(onSubmit)} className="review-content" encType="multipart/form-data">
        {/* Flyer Upload */}
        <div className="review-upload-section">
          <div className="review-upload-label">
            <span className="review-upload-text">Event Flyer</span>
            <div className="review-upload-description">Uploaded flyer preview.</div>
          </div>
          <div className="review-upload-area">
            <img
              src={watch('flyerPreview') || eventData?.flyerPreview || eventData?.flyer_url || eventData?.event_flyer}
              alt="Event Flyer Preview"
              className="review-flyer-preview"
              onError={(e) => (e.target.src = '/placeholder.png')}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            {...register('flyerFile')}
            className="review-file-input"
          />
        </div>

        {/* Event details form */}
        <div className="review-form">
          <div className="review-fields">

            <div className="review-row">
              <div className="review-group">
                <label className="review-label" htmlFor="eventName">Event Name</label>
                <input id="eventName" className="form-input" {...register('eventName', { required: true })} />
              </div>

              <div className="review-group">
                <label className="review-label" htmlFor="location">State</label>
                <select id="location" className="form-input" {...register('location', { required: true })} defaultValue="">
                  <option value="">Where in Nigeria is the event?</option>
                  <option value="Lagos">Within Lagos</option>
                  <option value="Outside Lagos">Beyond Lagos</option>
                </select>
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label" htmlFor="venue">Venue</label>
                <input id="venue" className="form-input" {...register('venue')} />
              </div>

              <div className="review-group">
                <label className="review-label" htmlFor="date">Date</label>
                <input type="date" id="date" className="form-input" {...register('date')} />
              </div>
            </div>

            <div className="review-row">
              <div className="review-group">
                <label className="review-label" htmlFor="time">Time</label>
                <input type="time" id="time" className="form-input" {...register('time')} />
              </div>

              <div className="review-group">
                <label className="review-label" htmlFor="dressCode">Dress Code</label>
                <input id="dressCode" className="form-input" {...register('dressCode')} />
              </div>
            </div>

            <div className="review-group review-full">
              <label className="review-label" htmlFor="description">Event Description</label>
              <textarea id="description" className="form-textarea" {...register('description')} />
            </div>
          </div>
        </div>
      </form>

      {/* Footer: accept / reject buttons (using Check / Trash2 like PendingEvents) */}
      <div className="review-form" style={{ marginTop: 20 }}>
        <div className="review-fields">
          <div className="review-group review-full">
            <label className="review-label" htmlFor="link">Additional Information Link</label>
            <input id="link" className="form-input" {...register('link')} />
          </div>

          <footer className="review-footer">
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <button
                type="button"
                onClick={handleRejectClick}
                className="reject-btn"
                disabled={deleting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255, 60, 60, 0.06)',
                  color: '#ff3b30',
                  border: '1px solid rgba(255, 60, 60, 0.18)',
                  padding: '10px 20px',
                  borderRadius: "24px",
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
                aria-label="Reject Event"
              >
                <Trash2 size={16} />
                <span>{deleting ? 'Rejecting...' : 'Reject'}</span>
              </button>

              <button
                type="button"
                onClick={handleUploadClick}
                className="accept-btn"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#e9f9f0',
                  color: '#127a3a',
                  border: '1px solid rgba(18, 122, 58, 0.14)',
                  padding: '10px 20px',
                  borderRadius: "24px",
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
                aria-label="Approve Event"
              >
                <Check size={16} />
                <span>{saving ? 'Publishing...' : 'Approve'}</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

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

      {/* Feature Duration flow */}
      {showFeatureDuration && (
        <FeatureDuration
          role={role}
          onClose={() => setShowFeatureDuration(false)}
          onConfirm={(selectedDuration) => {
            setShowFeatureDuration(false);
            handleFeatureConfirm(selectedDuration);
          }}
        />
      )}

      {/* Final feedback modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          modalInfo.onConfirm ? (
            <>
              <button onClick={closeModal}>Cancel</button>
              <button
                onClick={() => { modalInfo.onConfirm(); closeModal(); }}
              >
                Confirm
              </button>
            </>
          ) : (
            <button onClick={closeModal}>Close</button>
          )
        }
      />
    </div>
  );
};

export default TakeAction;
