import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEvent } from '../EventContext/EventContext'; 
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';

const EditableEventReviewRHF = ({ role }) => {
  const { eventData, updateEvent, setEventData, deleteEvent } = useEvent(); 
  const navigate = useNavigate();
  const { event_id } = useParams(); // 👈 grab event_id from URL

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

  const previewUrlRef = useRef(null);
  const flyerFile = watch('flyerFile');

  // ✅ Flyer preview
  useEffect(() => {
    if (flyerFile && flyerFile.length > 0) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const preview = URL.createObjectURL(flyerFile[0]);
      previewUrlRef.current = preview;
      setValue('flyerPreview', preview);
    }
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [flyerFile, setValue]);

  // ✅ Fetch event details
  useEffect(() => {
    if (!event_id) return;

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/event/events`, {
          params: { id: event_id },
          headers: { Authorization: `Bearer ${token}` }
        });

        // API returns an array → take first item
        const data = res.data[0];
        if (!data) throw new Error("Event not found");
        
        const normalizedData = { ...data, event_id: data.event_id || data.id };
        setEventData(normalizedData);

        reset({
          eventName: data.event_name || '',
          date: data.date || '',
          time: data.time || '',
          location: data.state || '',
          venue: data.venue || '',
          dressCode: data.dress_code || '',
          description: data.event_description || '',
          flyerPreview: data.flyer_url || '',
          featureChoice: data.is_featured ? "yes-feature" : "no-feature",
          // These may not exist on the API, but keep in case your backend actually supports them
          link: data.link || '',
          contactMethod: data.contact_method || '',
          contactValue: data.contact_value || ''
        });
      } catch (err) {
        console.error("Failed to fetch event", err);
        setModalInfo({
          show: true,
          title: "Error",
          message: "Error fetching event details.",
          subMessage: err?.message || ''
        });
      }
    };


    fetchEvent();
  }, [event_id, reset, setEventData]);

  // ✅ Save event
  const onSubmit = async (data) => {
    if (!eventData?.event_id) {
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
        updated = await updateEvent(eventData.event_id, fd);
      } else {
        const res = await api.put(`/event/events/${eventData.event_id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
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
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Failed to save event. Try again.',
        subMessage: err?.message || '',
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete event
  const handleDelete = () => {
    if (!eventData?.event_id) {
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'No event ID to delete.',
        subMessage: '',
      });
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
            await deleteEvent(eventData.event_id);
          } else {
            await api.delete(`/event/events/${eventData.event_id}`);
          }

          setModalInfo({
            show: true,
            title: 'Deleted',
            message: 'Event deleted successfully.',
            subMessage: '',
          });
          navigate('/adminevents');
        } catch (err) {
          setModalInfo({
            show: true,
            title: 'Error',
            message: 'Failed to delete event. Please try again.',
            subMessage: err?.message || '',
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };


  const closeModal = () => setModalInfo(prev => ({ ...prev, show: false }));
  const handleFeatureConfirm = (selectedDuration) => {
    setShowFeatureDuration(false);
    setModalInfo({ show: true, title: 'Success', message: `Event featured for ${selectedDuration}.`, subMessage: '' });
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
              src={watch('flyerPreview') || '/placeholder.png'}
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
                <input id="location" className="form-input" {...register('location', { required: true })} />
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

      {/* Feature options */}
      <div className="review-form" style={{ marginTop: 20 }}>
        <div className="review-fields">
          <div className="toggle-group" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={featureChoice === 'no-feature' ? 'active' : ''}
              onClick={() => { setFeatureChoice('no-feature'); setValue('featureChoice', 'no-feature'); }}
            >
              No, I do not want to feature my event.
            </button>
            <button
              type="button"
              className={featureChoice === 'yes-feature' ? 'active' : ''}
              onClick={() => { setFeatureChoice('yes-feature'); setValue('featureChoice', 'yes-feature'); }}
            >
              Yes, I want to feature my event.
            </button>
          </div>

          {featureChoice === 'yes-feature' && (
            <>
              <div className="review-group review-full">
                <label className="review-label" htmlFor="contactMethod">We’ll need a way to reach you</label>
                <input id="contactMethod" className="form-input" {...register('contactMethod')} />
              </div>

              <div className="review-group review-full">
                <label className="review-label" htmlFor="contactValue">Contact Value</label>
                <input id="contactValue" className="form-input" {...register('contactValue')} />
              </div>
            </>
          )}

          <div className="review-group review-full">
            <label className="review-label" htmlFor="link">Additional Information Link</label>
            <input id="link" className="form-input" {...register('link')} />
          </div>

          <footer className="review-footer">
            <button type="submit" className="review-submit-btn" disabled={saving} form="eventForm">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="review-submit-btn" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </footer>
        </div>
      </div>

      {/* Feature Duration Modal */}
      {showFeatureDuration && (
        <FeatureDuration
          role={role}
          onClose={() => setShowFeatureDuration(false)}
          onConfirm={handleFeatureConfirm}
        />
      )}

      {/* Feedback Modal */}
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
                onClick={() => {
                  modalInfo.onConfirm();
                  closeModal();
                }}
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

export default EditableEventReviewRHF;
