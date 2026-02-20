/* JavaScript (React JSX) - plain JS, no TypeScript */
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import './TakeAction.css';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import { Check, Trash2, ChevronLeft, Pencil } from 'lucide-react';

const API_BASE_URL = 'https://lagos-turnup-ecy5.onrender.com';

const TakeAction = ({ role }) => {
  const { eventData, updateEvent, setEventData, deleteEvent } = useEvent();
  const navigate = useNavigate();
  const { event_id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
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
  });

  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', subMessage: '', type: '', footerButtons: null });
  const [showFeatureDuration, setShowFeatureDuration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [featureChoice, setFeatureChoice] = useState('no-feature');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);

  const flyerFile = watch('flyerFile');
  const watchedFeatureChoice = watch('featureChoice');
  const contactMethod = watch('contactMethod');
  const isFeatured = watchedFeatureChoice === 'yes-feature';

  // ─── File preview ─────────────────────────────────────────────
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

  // ─── Fetch event on mount ─────────────────────────────────────
  useEffect(() => {
    if (!event_id) return;

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/event/events', {
          params: { id: event_id },
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data[0];
        if (!data) throw new Error('Event not found');

        const flyerPreview = data.flyer_url
          ? data.flyer_url
          : data.event_flyer
            ? `${API_BASE_URL}/${data.event_flyer.replace(/^\//, '')}`
            : '';

        setEventData({ ...data, id: data.id || data.event_id, flyerPreview });

        reset({
          eventName: data.event_name || '',
          date: data.date || '',
          time: data.time || '',
          location: data.state || '',
          venue: data.venue || '',
          dressCode: data.dress_code || '',
          description: data.event_description || '',
          flyerPreview,
          featureChoice: data.is_featured ? 'yes-feature' : 'no-feature',
          link: data.contact_link || '',
          contactMethod: data.contact_method || '',
          contactValue: data.contact_value || '',
        });

        setFeatureChoice(data.is_featured ? 'yes-feature' : 'no-feature');
      } catch (err) {
        console.error('Failed to fetch event', err);
        setModalInfo({ show: true, title: 'Error', message: 'Error fetching event details.', subMessage: err?.message || '' });
      }
    };

    fetchEvent();
  }, [event_id, reset, setEventData]);

  // ─── PUT /event/events/{event_id} ─────────────────────────────
  const saveEdits = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('event_name', data.eventName || '');
      fd.append('state', data.location || '');
      fd.append('venue', data.venue || '');
      fd.append('date', data.date || '');
      fd.append('time', data.time || '');
      fd.append('dress_code', data.dressCode || '');
      fd.append('event_description', data.description || '');
      fd.append('is_featured', data.featureChoice === 'yes-feature');
      fd.append('featured_requested', data.featureChoice === 'yes-feature');
      fd.append('contact_method', data.contactMethod || '');
      fd.append('contact_value', data.contactValue || '');
      fd.append('contact_link', data.link || '');
      
      // Keep event in pending state when saving edits (not approving yet)
      fd.append('pending', true);

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

      if (updated && typeof updated === 'object') {
        setEventData(updated);
      }

      setSaving(false);
      setModalInfo({ 
        show: true, 
        title: 'Success', 
        message: 'Event edits saved successfully!', 
        subMessage: 'Event remains in pending status awaiting approval.' 
      });

      return true;
    } catch (err) {
      console.error('Save failed', err);
      setSaving(false);
      setModalInfo({ show: true, title: 'Error', message: 'Failed to save edits. Please try again.', subMessage: err?.message || '' });
      return false;
    }
  };

  // ─── Approve flow ─────────────────────────────────────────────
  const runApprove = async () => {
    setShowConfirmModal(false);

    if (!event_id) {
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'No event id available to publish.',
        subMessage: '',
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      const endpoint =
        featureChoice === 'yes-feature' || eventData?.is_featured
          ? `/event/events/${event_id}/approve-featured`
          : `/event/approve-event/${event_id}`;

      await api.put(endpoint, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSaving(false);

      setModalInfo({
        show: true,
        title: 'Success',
        message:
          featureChoice === 'yes-feature'
            ? 'Featured event approved successfully!'
            : 'Event published successfully!',
        subMessage:
          featureChoice === 'yes-feature'
            ? 'The event is now live and featured.'
            : 'The event is now live and visible to all users.',
      });

      navigate('/adminevents');
    } catch (err) {
      console.error('Approval failed', err);
      setSaving(false);

      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Failed to approve event.',
        subMessage: err?.response?.data?.detail || err?.message || '',
      });
    }
  };

  // ─── Reject flow ──────────────────────────────────────────────
  const runReject = async () => {
    setShowConfirmRejectModal(false);
    if (!event_id) {
      setModalInfo({ show: true, title: 'Error', message: 'No event id available to reject.', subMessage: '' });
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      // Delete the event entirely
      await api.delete(`/event/events/${event_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleting(false);
      setModalInfo({ 
        show: true, 
        title: 'Rejected', 
        message: 'Event has been rejected and deleted.', 
        subMessage: 'The event will not be published.' 
      });
      navigate('/adminevents');
    } catch (err) {
      console.error('Reject failed', err);
      setDeleting(false);
      setModalInfo({ show: true, title: 'Error', message: 'Failed to reject/delete event.', subMessage: err?.message || '' });
    }
  };

  // ─── Button click handlers ────────────────────────────────────
  const handleApproveClick = () => {
    setShowConfirmModal(true);
  };

  const handleRejectClick = () => {
    setShowConfirmRejectModal(true);
  };

  // ─── Feature duration ─────────────────────────────────────────
  const handleFeatureConfirm = (selectedDuration) => {
    setShowFeatureDuration(false);
    setModalInfo({ 
      show: true, 
      title: 'Success', 
      message: `Event featured for ${selectedDuration}.`, 
      subMessage: 'The event is now live and featured on TurnUpLagos.' 
    });
    navigate('/adminevents');
  };

  const closeModal = () => setModalInfo((prev) => ({ ...prev, show: false }));

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title" style={{ fontFamily: 'Rushon Ground' }}>
          <button type="button" onClick={() => navigate(-1)} className="review-back-btn">
            <ChevronLeft size={24} />
          </button>
          <span>TAKE ACTION</span>
        </h1>
      </header>

      <form id="eventForm" onSubmit={handleSubmit(saveEdits)} className="review-form-wrapper" encType="multipart/form-data">
        <div className="review-content">
          {/* ── Flyer ── */}
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
          </div>

          {/* ── Editable fields ── */}
          <div className="review-form">
            <div className="review-fields">
              <div className="review-row">
                <div className="review-group">
                  <label className="review-label" htmlFor="eventName">Event Name *</label>
                  <input id="eventName" className="form-input" {...register('eventName', { required: 'Event name is required' })} />
                </div>

                <div className="review-group">
                  <label className="review-label" htmlFor="location">State *</label>
                  <select id="location" className="form-input" {...register('location', { required: 'Location is required' })}>
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
                  <label className="review-label" htmlFor="dressCode">Gate Fee</label>
                  <input id="dressCode" className="form-input" {...register('dressCode')} />
                </div>
              </div>

              <div className="review-group review-full">
                <label className="review-label" htmlFor="description">Event Description</label>
                <textarea id="description" className="form-textarea" {...register('description')} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature toggle + contact + link + actions ── */}
        <div className="feature-block" style={{ marginTop: 20 }}>
          <div className="review-fields">
            {/* Feature toggle */}
            <div className="toggle-group" style={{ marginBottom: 12 }}>
              <button
                type="button"
                className={watchedFeatureChoice === 'no-feature' ? 'active' : ''}
                onClick={() => {
                  setValue('featureChoice', 'no-feature', { shouldDirty: true });
                  setFeatureChoice('no-feature');
                }}
              >
                No, I do not want to feature my event.
              </button>
              <button
                type="button"
                className={watchedFeatureChoice === 'yes-feature' ? 'active' : ''}
                onClick={() => {
                  setValue('featureChoice', 'yes-feature', { shouldDirty: true });
                  setFeatureChoice('yes-feature');
                }}
              >
                Yes, I want to feature my event.
              </button>
            </div>

            {/* Contact section — only when featured */}
            {isFeatured && (
              <div className="contact-section">
                <h3 className="contact-title">📧 We'll need a way to reach you *</h3>
                <p className="contact-description">
                  Select your preferred contact method so we can discuss pricing and promotion details.
                </p>
                <div className="contact-form">
                  <div className="contact-group">
                    <select className="contact-select" {...register('contactMethod', { required: isFeatured ? 'Contact method is required' : false })}>
                      <option value="">Choose a method</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Phone Number</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <input
                    className="contact-input"
                    placeholder={`Enter your ${contactMethod || 'contact info'}`}
                    {...register('contactValue', { required: isFeatured ? 'Contact information is required' : false })}
                  />
                </div>
              </div>
            )}

            {/* Additional link */}
            <div className="additional-info-section">
              <h3 className="additional-title">Additional Information Link</h3>
              <p className="additional-description">
                Add any link that gives attendees more context — could be a WhatsApp group, ticket page, Linktree, or Snapchat link.
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

            {/* ── Action buttons ── */}
            <footer className="review-footer">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Save edits */}
                <button
                  type="submit"
                  className="review-submit-btn review-submit-btn--save"
                  disabled={saving || !isDirty}
                >
                  <Pencil size={16} />
                  {saving ? 'Saving...' : 'Save Edits'}
                </button>

                {/* Reject */}
                <button
                  type="button"
                  onClick={handleRejectClick}
                  className="review-submit-btn review-submit-btn--delete"
                  disabled={deleting || saving}
                >
                  <Trash2 size={16} />
                  {deleting ? 'Rejecting...' : 'Reject Event'}
                </button>

                {/* Approve */}
                <button
                  type="button"
                  onClick={handleApproveClick}
                  className="review-submit-btn review-submit-btn--approve"
                  disabled={saving}
                >
                  <Check size={16} />
                  {saving ? 'Approving...' : 'Approve Event'}
                </button>
              </div>
            </footer>
          </div>
        </div>
      </form>

      {/* ── Modals ── */}

      {/* Confirm Approve */}
      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        type="duration"
        message="Are you sure you want to publish this event?"
        subMessage="Once published, the event will go live on TurnUpLagos and be visible to all users."
        footerButtons={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="modal-close-btn" onClick={() => setShowConfirmModal(false)} type="button">Cancel</button>
            <button className="modal-close-btn-primary" onClick={runApprove} type="button">
              Yes, Publish
            </button>
          </div>
        }
      />

      {/* Confirm Reject */}
      <Modal
        show={showConfirmRejectModal}
        onClose={() => setShowConfirmRejectModal(false)}
        type="duration"
        message="Are you sure you want to reject this event?"
        subMessage="The event will not be published. Optionally, you may contact the organizer to provide feedback or a reason for rejection."
        footerButtons={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="modal-close-btn" onClick={() => setShowConfirmRejectModal(false)} type="button">Cancel</button>
            <button className="modal-close-btn-primary" onClick={runReject} type="button">
              Yes, Reject
            </button>
          </div>
        }
      />

      {/* Feature Duration */}
      {showFeatureDuration && (
        <FeatureDuration
          role={role}
          onClose={() => setShowFeatureDuration(false)}
          onConfirm={handleFeatureConfirm}
        />
      )}

      {/* General feedback modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          modalInfo.footerButtons || (
            <button onClick={closeModal} className="modal-close-btn-primary">Close</button>
          )
        }
      />
    </div>
  );
};

export default TakeAction;