// EditableEventReviewRHF.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import './EditEvent.css';
import { ChevronLeft, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';

const EditableEventReviewRHF = ({ role }) => {
  const { eventData, updateEvent, setEventData, deleteEvent } = useEvent();
  const navigate = useNavigate();
  const { event_id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
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
    },
    shouldUnregister: false,
  });

  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', subMessage: '' });
  const [showFeatureDuration, setShowFeatureDuration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const flyerFile = watch('flyerFile');
  const featureChoice = watch('featureChoice');

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
          if (img.width <= 500 && img.height <= 800) {
            setValue('flyerPreview', event.target.result);
          } else {
            alert('Image must be max 500x800px.');
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

  // fetch on mount
  useEffect(() => {
    if (!event_id) return;
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/event/events`, {
          params: { id: event_id },
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data[0];
        if (!data) throw new Error('Event not found');

        const normalizedData = {
          ...data,
          id: data.id || data.event_id,
          event_id: data.id || data.event_id,
          flyerPreview: data.flyer_url || data.event_flyer || '',
        };
        setEventData(normalizedData);

        const featureChoiceValue = data.is_featured ? 'yes-feature' : 'no-feature';

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
          featureChoice: featureChoiceValue,
          link: data.contact_link || '',
          contactMethod: data.contact_method || '',
          contactValue: data.contact_value || '',
        });
      } catch (err) {
        console.error('Failed to fetch event', err);
        setModalInfo({
          show: true,
          title: 'Error',
          message: 'Error fetching event details.',
          subMessage: err?.message || '',
        });
      }
    };
    fetchEvent();
  }, [event_id, reset, setEventData]);
  console.log("event_id from params:", event_id);
  console.log("eventData:", eventData);

  const onSubmit = async (data) => {
    const idToUse = parseInt(event_id)
    if (!idToUse) {
      setModalInfo({ show: true, title: 'Error', message: 'No event ID to update.', subMessage: '' });
      return;
    }

    if (featureChoice === 'yes-feature') {
      if (!(data.contactMethod ?? '') || !(data.contactValue ?? '')) {
        setModalInfo({
          show: true,
          title: 'Missing Information',
          message: 'Contact method and contact value are required when featuring an event.',
          subMessage: 'Please fill in your preferred contact information.',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('event_id', String(event_id))
      fd.append('event_name', data.eventName ?? '');
      fd.append('state', data.location ?? '');
      fd.append('venue', data.venue ?? '');
      fd.append('date', data.date ?? '');
      fd.append('time', data.time ?? '');
      fd.append('dress_code', data.dressCode ?? '');
      fd.append('event_description', data.description ?? '');

      const isFeatured = featureChoice === 'yes-feature';
      fd.append('is_featured', isFeatured ? 'true' : 'false');
      fd.append('featured_requested', isFeatured ? 'true' : 'false');

      fd.append('contact_method', data.contactMethod ?? eventData?.contactMethod ?? '');
      fd.append('contact_value', data.contactValue ?? eventData?.contactValue ?? '');
      fd.append('contact_link', data.link ?? eventData?.link ?? '');

      if (data.flyerFile && data.flyerFile.length > 0) {
        fd.append('event_flyer', data.flyerFile[0]);
      }

      let updated;
      if (typeof updateEvent === 'function') {
        updated = await updateEvent(idToUse, fd);
      } else {
        const token = localStorage.getItem('token');
        const res = await axios.put(`https://lagos-turnup.onrender.com/event/events/${idToUse}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updated = res.data;
      }

      if (updated && typeof updated === 'object' && (updated.id || updated.event_id || updated.event_name)) {
        setEventData(updated);
      }

      setModalInfo({ show: true, title: 'Success', message: 'Event updated successfully.', subMessage: '' });

      if (isFeatured) {
        setShowFeatureDuration(true);
      } else {
        navigate('/adminevents');
      }
    } catch (err) {
      console.error('Save failed', err);
      const sub = err?.response?.data || err?.message || '';
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Failed to save event. Try again.',
        subMessage: JSON.stringify(sub),
      });
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
      type: 'duration',
      message: 'Are you sure you want to delete this event?',
      subMessage: 'This action is permanent and cannot be undone.',
      footerButtons: (
        <div className="modal-btn-group">
          <button className="modal-close-btn" onClick={() => setModalInfo({ show: false })}>
            Cancel
          </button>
          <button
            className="modal-close-btn-primary"
            onClick={async () => {
              setDeleting(true);
              try {
                if (typeof deleteEvent === 'function') {
                  await deleteEvent(eventData.id);
                } else {
                  const token = localStorage.getItem('token');
                  await api.delete(`/event/events/${eventData.event_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                }
                setModalInfo({
                  show: true,
                  type: 'success',
                  title: 'Deleted',
                  message: 'Event deleted successfully.',
                  footerButtons: (
                    <button
                      className="modal-close-btn"
                      onClick={() => {
                        closeModal();
                        navigate('/adminevents');
                      }}
                    >
                      Continue
                    </button>
                  ),
                });
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
            }}
          >
            Yes, Delete
          </button>
        </div>
      ),
    });
  };

  const closeModal = () => setModalInfo((prev) => ({ ...prev, show: false }));

  const handleFeatureConfirm = (selectedDuration) => {
    setShowFeatureDuration(false);
    setModalInfo({
      show: true,
      title: 'Success',
      message: `Event featured for ${selectedDuration}.`,
      subMessage: '',
    });
    navigate('/adminevents');
  };

  // Corrected feature choice handler
  const handleFeatureChoiceChange = (choice) => {
    setValue('featureChoice', choice, { shouldValidate: true });
  };

  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          <button onClick={() => navigate(-1)} className="review-back-btn">
            <ChevronLeft />
          </button>
          <span>EDIT EVENT</span>
        </h1>
      </header>

      <form
        id="eventForm"
        onSubmit={handleSubmit(onSubmit)}
        className="review-form-wrapper"
        encType="multipart/form-data"
      >
        {/* two-column area */}
        <div className="review-content">
          {/* Flyer */}
          <div className="review-upload-section">
            <div className="review-upload-label">
              <span className="review-upload-text">Event Flyer</span>
              <div className="review-upload-description">Uploaded flyer preview.</div>
            </div>
            <div className="review-upload-area">
              <img
                src={eventData?.flyerPreview || eventData?.flyer_url || eventData?.event_flyer}
                alt="Event Flyer Preview"
                className="review-flyer-preview"
                onError={(e) => (e.target.src = '/placeholder.png')}
              />
            </div>
          </div>

          {/* Event fields */}
          <div className="review-form">
            <div className="review-fields">
              <div className="review-row">
                <div className="review-group">
                  <label className="review-label" htmlFor="eventName">
                    Event Name
                  </label>
                  <input id="eventName" className="form-input" {...register('eventName', { required: true })} />
                </div>

                <div className="review-group">
                  <label className="review-label" htmlFor="location">
                    State
                  </label>
                  <select id="location" className="form-input" {...register('location', { required: true })} defaultValue="">
                    <option value="">Where in Nigeria is the event?</option>
                    <option value="Lagos">Within Lagos</option>
                    <option value="Outside Lagos">Beyond Lagos</option>
                  </select>
                </div>
              </div>

              <div className="review-row">
                <div className="review-group">
                  <label className="review-label" htmlFor="venue">
                    Venue
                  </label>
                  <input id="venue" className="form-input" {...register('venue')} />
                </div>
                <div className="review-group">
                  <label className="review-label" htmlFor="date">
                    Date
                  </label>
                  <input type="date" id="date" className="form-input" {...register('date')} />
                </div>
              </div>

              <div className="review-row">
                <div className="review-group">
                  <label className="review-label" htmlFor="time">
                    Time
                  </label>
                  <input type="time" id="time" className="form-input" {...register('time')} />
                </div>
                <div className="review-group">
                  <label className="review-label" htmlFor="dressCode">
                    Dress Code
                  </label>
                  <input id="dressCode" className="form-input" {...register('dressCode')} />
                </div>
              </div>

              <div className="review-group review-full">
                <label className="review-label" htmlFor="description">
                  Event Description
                </label>
                <textarea id="description" className="form-textarea" {...register('description')} />
              </div>
            </div>
          </div>
        </div>

        {/* === FEATURE BLOCK === */}
        <div className="feature-block" style={{ marginTop: 20 }}>
          <div className="review-fields">
            <div className="toggle-group" style={{ marginBottom: 12 }}>
              <button
                type="button"
                className={featureChoice === 'no-feature' ? 'active' : ''}
                onClick={() => handleFeatureChoiceChange('no-feature')}
              >
                No, I do not want to feature my event.
              </button>
              <button
                type="button"
                className={featureChoice === 'yes-feature' ? 'active' : ''}
                onClick={() => handleFeatureChoiceChange('yes-feature')}
              >
                Yes, I want to feature my event.
              </button>
            </div>

            {featureChoice === 'yes-feature' && (
              <div className="contact-section">
                <h3 className="contact-title">📧 We'll need a way to reach you *</h3>
                <p className="contact-description">
                  Select your preferred contact method so we can discuss pricing and promotion details.
                </p>

                <div className="contact-form">
                  <div className="contact-group">
                    <select
                      className="contact-select"
                      {...register('contactMethod', {
                        required: featureChoice === 'yes-feature' ? 'Contact method is required' : false,
                      })}
                    >
                      <option value="">Choose a method</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Phone Number</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    {errors.contactMethod && <span className="error-message">{errors.contactMethod.message}</span>}
                  </div>

                  <input
                    className="contact-input"
                    placeholder={`Enter your ${watch('contactMethod') || 'contact info'}`}
                    {...register('contactValue', {
                      required: featureChoice === 'yes-feature' ? 'Contact information is required' : false,
                    })}
                  />
                  {errors.contactValue && <span className="error-message">{errors.contactValue.message}</span>}
                </div>
              </div>
            )}

            {/* Additional info link */}
            <div className="additional-info-section">
              <h3 className="additional-title">Additional Information Link</h3>
              <p className="additional-description">
                Add any link that gives attendees more context — could be a WhatsApp group, ticket page, Linktree, or
                Snapchat link.
              </p>
              <div className="additional-input-group">
                <input
                  type="url"
                  className="additional-input"
                  placeholder="Paste a link (WhatsApp, Linktree, etc.) or leave blank"
                  {...register('link')}
                />
              </div>
            </div>

            <footer className="review-footer">
              <button
                type="button"
                className="review-submit-btn review-submit-btn--save"
                disabled={saving}
                onClick={() => setShowSaveConfirm(true)}
              >
                <Pencil size={16} />
                {saving ? 'Saving Event...' : 'Save Event'}
              </button>
              <button
                type="button"
                className="review-submit-btn review-submit-btn--delete"
                disabled={deleting}
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting Event...' : 'Delete Event'}
              </button>
            </footer>
          </div>
        </div>
      </form>

      {/* Feature Duration */}
      {showFeatureDuration && (
        <FeatureDuration role={role} onClose={() => setShowFeatureDuration(false)} onConfirm={handleFeatureConfirm} />
      )}

      {/* Save confirmation modal */}
      {showSaveConfirm && (
        <Modal
          show={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          type="duration"
          message="Do you want to save the changes to this event?"
          subMessage="Your updates will overwrite the current event details."
          footerButtons={
            <div className="modal-btn-group">
              <button className="modal-close-btn" onClick={() => setShowSaveConfirm(false)}>
                Cancel
              </button>
              <button
                className="modal-close-btn-primary"
                onClick={() => {
                  setShowSaveConfirm(false);
                  handleSubmit(onSubmit)();
                }}
              >
                Yes, Save
              </button>
            </div>
          }
        />
      )}

      {/* Feedback modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        type="duration"
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          modalInfo.footerButtons ? (
            modalInfo.footerButtons
          ) : (
            <button onClick={closeModal} className="modal-close-btn-primary">
              Close
            </button>
          )
        }
      />
    </div>
  );
};

export default EditableEventReviewRHF;
