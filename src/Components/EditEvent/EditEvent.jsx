import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useEvent } from '../EventContext/EventContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Modal from '../Modal/Modal';
import FeatureDuration from '../FeatureDuration/FeatureDuration';
import './EditEvent.css';
import { ChevronLeft, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';

// Constants
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_IMAGE_DIMENSIONS = { width: 500, height: 800 };
const API_BASE_URL = 'https://lagos-turnup.onrender.com';

// Form validation rules
const VALIDATION_RULES = {
  eventName: { required: 'Event name is required' },
  location: { required: 'Location is required' },
  contactMethod: (isFeatured) => ({
    required: isFeatured ? 'Contact method is required' : false,
  }),
  contactValue: (isFeatured) => ({
    required: isFeatured ? 'Contact information is required' : false,
    validate: (value, formValues) => {
      if (!isFeatured) return true;
      if (!value) return 'Contact information is required';
      
      // Validate email format
      if (formValues.contactMethod === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Please enter a valid email address';
      }
      
      // Validate phone format (basic)
      if (formValues.contactMethod === 'phone' || formValues.contactMethod === 'whatsapp') {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) || 'Please enter a valid phone number';
      }
      
      return true;
    },
  }),
};

// Default form values
const DEFAULT_FORM_VALUES = {
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
};

// Custom hooks
const useFilePreview = (file, setValue) => {
  useEffect(() => {
    if (!file || !file.length) {
      setValue('flyerPreview', null);
      return;
    }

    const selectedFile = file[0];
    
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      alert('Invalid file type. Only PNG and JPEG are allowed.');
      setValue('flyerFile', null);
      setValue('flyerPreview', null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= MAX_IMAGE_DIMENSIONS.width && img.height <= MAX_IMAGE_DIMENSIONS.height) {
          setValue('flyerPreview', event.target.result);
        } else {
          alert(`Image must be max ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px.`);
          setValue('flyerFile', null);
          setValue('flyerPreview', null);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
  }, [file, setValue]);
};

const useModal = () => {
  const [modalInfo, setModalInfo] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    subMessage: '', 
    type: 'info',
    footerButtons: null 
  });

  const showModal = useCallback((config) => {
    setModalInfo(prev => ({ ...prev, show: true, ...config }));
  }, []);

  const closeModal = useCallback(() => {
    setModalInfo(prev => ({ ...prev, show: false }));
  }, []);

  return { modalInfo, showModal, closeModal };
};

// Utility functions
const normalizeEventData = (data) => ({
  ...data,
  id: data.id || data.event_id,
  event_id: data.id || data.event_id,
  flyerPreview: data.flyer_url || data.event_flyer || '',
});

const buildFlyerUrl = (flyerPath) => {
  if (!flyerPath) return '';
  if (flyerPath.startsWith('http')) return flyerPath;
  return `${API_BASE_URL}/${flyerPath.replace(/^\//, '')}`;
};

const createFormData = (data, eventId, isFeatured) => {
  const formData = new FormData();
  
  const fieldMappings = {
    event_name: data.eventName || '',
    state: data.location || '',
    venue: data.venue || '',
    date: data.date || '',
    time: data.time || '',
    dress_code: data.dressCode || '',
    event_description: data.description || '',
    is_featured: isFeatured,
    featured_requested: isFeatured,
    contact_method: data.contactMethod || '',
    contact_link: data.link || '', // This is for additional links
  };

  Object.entries(fieldMappings).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Handle contact_value separately - you might need to store this in a custom field
  // or concatenate it with contact_method for the API
  if (isFeatured && data.contactValue) {
    // Option 1: Store in contact_link if no separate link provided
    if (!data.link) {
      formData.set('contact_link', data.contactValue);
    } else {
      // Option 2: Store in a custom field or combine with contact_method
      // You might need to discuss with backend team about adding contact_value field
      formData.append('contact_info', JSON.stringify({
        method: data.contactMethod,
        value: data.contactValue
      }));
    }
  }

  if (data.flyerFile && data.flyerFile.length > 0) {
    formData.append('event_flyer', data.flyerFile[0]);
  }

  return formData;
};

// Main component
const EditableEventReviewRHF = ({ role }) => {
  const { eventData, updateEvent, setEventData, deleteEvent } = useEvent();
  const navigate = useNavigate();
  const { event_id } = useParams();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFeatureDuration, setShowFeatureDuration] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const { modalInfo, showModal, closeModal } = useModal();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
    shouldUnregister: false,
  });

  const watchedValues = watch(['flyerFile', 'featureChoice', 'contactMethod']);
  const [flyerFile, featureChoice, contactMethod] = watchedValues;
  const isFeatured = featureChoice === 'yes-feature';

  // Custom hooks
  useFilePreview(flyerFile, setValue);

  // Memoized values
  const validationRules = useMemo(() => ({
    eventName: VALIDATION_RULES.eventName,
    location: VALIDATION_RULES.location,
    contactMethod: VALIDATION_RULES.contactMethod(isFeatured),
    contactValue: VALIDATION_RULES.contactValue(isFeatured),
  }), [isFeatured]);

  // API functions
  const fetchEventData = useCallback(async () => {
    if (!event_id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/event/events', {
        params: { id: event_id },
        headers: { Authorization: `Bearer ${token}` },
      });

      const eventData = response.data[0];
      if (!eventData) {
        throw new Error('Event not found');
      }

      const normalizedData = normalizeEventData(eventData);
      setEventData(normalizedData);

      // Reset form with fetched data
      reset({
        eventName: eventData.event_name || '',
        date: eventData.date || '',
        time: eventData.time || '',
        location: eventData.state || '',
        venue: eventData.venue || '',
        dressCode: eventData.dress_code || '',
        description: eventData.event_description || '',
        flyerPreview: buildFlyerUrl(eventData.flyer_url || eventData.event_flyer),
        featureChoice: eventData.is_featured ? 'yes-feature' : 'no-feature',
        link: eventData.contact_link || '',
        contactMethod: eventData.contact_method || '',
        // Map contact_link back to contactValue if it exists and looks like contact info
        contactValue: eventData.contact_value || (
          eventData.contact_method && eventData.contact_link && 
          !eventData.contact_link.startsWith('http') ? eventData.contact_link : ''
        ) || '',
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      showModal({
        title: 'Error',
        message: 'Error fetching event details.',
        subMessage: error?.message || '',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [event_id, reset, setEventData, showModal]);

  // Effects
  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Event handlers
  const handleFeatureChoiceChange = useCallback((choice) => {
    setValue('featureChoice', choice, { shouldValidate: true });
  }, [setValue]);

  const handleSaveEvent = useCallback(async (data) => {
    const eventIdToUpdate = parseInt(event_id);
    
    if (!eventIdToUpdate) {
      showModal({
        title: 'Error',
        message: 'No event ID to update.',
        type: 'error',
      });
      return;
    }

    // Validate featured event requirements
    if (isFeatured && (!data.contactMethod || !data.contactValue)) {
      showModal({
        title: 'Missing Information',
        message: 'Contact method and contact value are required when featuring an event.',
        subMessage: 'Please fill in your preferred contact information.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    
    try {
      const formData = createFormData(data, event_id, isFeatured);
      let updatedEvent;

      if (typeof updateEvent === 'function') {
        updatedEvent = await updateEvent(eventIdToUpdate, formData);
      } else {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_BASE_URL}/event/events/${event_id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedEvent = response.data;
      }

      if (updatedEvent && typeof updatedEvent === 'object') {
        setEventData(updatedEvent);
      }

      showModal({
        title: 'Success',
        message: 'Event updated successfully.',
        type: 'success',
      });

      if (isFeatured) {
        setShowFeatureDuration(true);
      } else {
        navigate('/adminevents');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showModal({
        title: 'Error',
        message: 'Failed to save event. Please try again.',
        subMessage: error?.response?.data || error?.message || '',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [event_id, isFeatured, updateEvent, setEventData, showModal, navigate]);

  const handleDeleteEvent = useCallback(() => {
    if (!eventData?.event_id) {
      showModal({
        title: 'Error',
        message: 'No event ID to delete.',
        type: 'error',
      });
      return;
    }

    showModal({
      type: 'confirmation',
      message: 'Are you sure you want to delete this event?',
      subMessage: 'This action is permanent and cannot be undone.',
      footerButtons: (
        <div className="modal-btn-group">
          <button className="modal-close-btn" onClick={closeModal}>
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

                showModal({
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
              } catch (error) {
                showModal({
                  title: 'Error',
                  message: 'Failed to delete event. Please try again.',
                  subMessage: error?.message || '',
                  type: 'error',
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
  }, [eventData, deleteEvent, showModal, closeModal, navigate]);

  const handleFeatureConfirm = useCallback((selectedDuration) => {
    setShowFeatureDuration(false);
    showModal({
      title: 'Success',
      message: `Event featured for ${selectedDuration}.`,
      type: 'success',
    });
    navigate('/adminevents');
  }, [showModal, navigate]);

  const handleSaveConfirm = useCallback(() => {
    setShowSaveConfirm(true);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="review-container">
        <div className="loading-spinner">Loading event details...</div>
      </div>
    );
  }

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
        onSubmit={handleSubmit(handleSaveEvent)}
        className="review-form-wrapper"
        encType="multipart/form-data"
      >
        <div className="review-content">
          {/* Flyer Section */}
          <div className="review-upload-section">
            <div className="review-upload-label">
              <span className="review-upload-text">Event Flyer</span>
              <div className="review-upload-description">Current flyer preview.</div>
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

          {/* Form Fields */}
          <div className="review-form">
            <div className="review-fields">
              <div className="review-row">
                <div className="review-group">
                  <label className="review-label" htmlFor="eventName">
                    Event Name *
                  </label>
                  <input 
                    id="eventName" 
                    className="form-input" 
                    {...register('eventName', validationRules.eventName)} 
                  />
                  {errors.eventName && (
                    <span className="error-message">{errors.eventName.message}</span>
                  )}
                </div>

                <div className="review-group">
                  <label className="review-label" htmlFor="location">
                    State *
                  </label>
                  <select 
                    id="location" 
                    className="form-input" 
                    {...register('location', validationRules.location)}
                  >
                    <option value="">Where in Nigeria is the event?</option>
                    <option value="Lagos">Within Lagos</option>
                    <option value="Outside Lagos">Beyond Lagos</option>
                  </select>
                  {errors.location && (
                    <span className="error-message">{errors.location.message}</span>
                  )}
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
                    Gate Fee
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

        {/* Feature Section */}
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

            {isFeatured && (
              <div className="contact-section">
                <h3 className="contact-title">📧 We'll need a way to reach you *</h3>
                <p className="contact-description">
                  Select your preferred contact method so we can discuss pricing and promotion details.
                </p>

                <div className="contact-form">
                  <div className="contact-group">
                    <select
                      className="contact-select"
                      {...register('contactMethod', validationRules.contactMethod)}
                    >
                      <option value="">Choose a method</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Phone Number</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    {errors.contactMethod && (
                      <span className="error-message">{errors.contactMethod.message}</span>
                    )}
                  </div>

                  <input
                    className="contact-input"
                    placeholder={`Enter your ${contactMethod || 'contact info'}`}
                    {...register('contactValue', validationRules.contactValue)}
                  />
                  {errors.contactValue && (
                    <span className="error-message">{errors.contactValue.message}</span>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information Link */}
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

            {/* Action Buttons */}
            <footer className="review-footer">
              <button
                type="button"
                className="review-submit-btn review-submit-btn--save"
                disabled={saving || !isDirty}
                onClick={handleSaveConfirm}
              >
                <Pencil size={16} />
                {saving ? 'Saving Event...' : 'Save Event'}
              </button>
              <button
                type="button"
                className="review-submit-btn review-submit-btn--delete"
                disabled={deleting}
                onClick={handleDeleteEvent}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting Event...' : 'Delete Event'}
              </button>
            </footer>
          </div>
        </div>
      </form>

      {/* Feature Duration Modal */}
      {showFeatureDuration && (
        <FeatureDuration 
          role={role} 
          onClose={() => setShowFeatureDuration(false)} 
          onConfirm={handleFeatureConfirm} 
        />
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <Modal
          show={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          type="confirmation"
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
                  handleSubmit(handleSaveEvent)();
                }}
              >
                Yes, Save
              </button>
            </div>
          }
        />
      )}

      {/* General Purpose Modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          modalInfo.footerButtons || (
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