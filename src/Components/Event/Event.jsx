import React, { useState } from 'react';
import { ArrowLeft, Upload, CloudUpload, ChevronLeft } from 'lucide-react';
import './Event.css';
import { useNavigate, NavLink } from 'react-router-dom';
import { useEvent } from '../EventContext/EventContext';
import { useAuth } from '../RoleContext/RoleContext';

const Event = () => {
  const { eventData, setEventData } = useEvent();
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [wordCount, setWordCount] = useState(0);
  const [wordError, setWordError] = useState('');

  const navigate = useNavigate();
  const { rules } = useAuth();
  const role = rules.role;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));

    if (name === 'description') {
      const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
      setWordCount(words);
      if (words < 20) {
        setWordError(`Please enter at least 20 words (currently ${words})`);
      } else {
        setWordError('');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!file) return;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only PNG and JPEG are allowed.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= 10000 && img.height <= 10000) {
          setEventData((prev) => ({
            ...prev,
            flyer: file,
            flyerPreview: event.target.result, // Base64 string
          }));
          setFlyerPreview(event.target.result);
        } else {
          alert("Image must be max 400x800px.");
        }
      };
      img.src = event.target.result; // Set the image source to the Base64 string
    };

    reader.readAsDataURL(file); // Converts file to Base64
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordCount < 20) return;
    setIsSubmitting(true);
    if (["admin", "sub-admin", "super-admin"].includes(role)) {
      navigate('/adminfeatureevent');
    } else {
      navigate('/featureevent');
    }
  };

  return (
    <div className="event-unique-container">
      <div className="event-unique-header">
        <NavLink
          to={["admin", "sub-admin", "super-admin"].includes(role)
            ? "/adminevents"
            : "/promote"
          }
          style={{marginTop:"5px"}}
        >
          <ChevronLeft className="event-unique-back" />
        </NavLink>
        <h1 className="event-unique-title">PROMOTE AN EVENT</h1>
      </div>

      <div className="event-unique-content">
        {/* Upload Section */}
        <div className="event-unique-upload-section">
          <div className="event-unique-upload-label">
            <span className="event-unique-upload-text">
              <CloudUpload size={16}/>
              <p>Upload Flyer</p>
            </span>
            <div className="event-unique-upload-description">
              Select and upload flyer for the event.
            </div>
          </div>
          <label className="event-unique-upload-area">
            {flyerPreview || eventData.flyer ? (
              <img src={flyerPreview ||eventData.flyer} alt="Preview" className="event-unique-flyer-preview" />
            ) : (
              <div className='event-unique-upload-placeholder'>
                <Upload className="event-unique-upload-icon" />
                <div className="event-unique-upload-text-block">
                  <div className="event-unique-upload-title">Click to upload</div>
                  <div className="event-unique-upload-subtitle">or drag and drop</div>
                  <div className="event-unique-upload-format">
                    SVG, PNG, JPG or GIF (max. 400x800px)
                  </div>
                </div>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              hidden 
            />
          </label>
        </div>

        {/* Form Section */}
        <div className="event-unique-form-container">
          <form className="event-unique-form" onSubmit={handleSubmit}>
            <div className="event-unique-form-row">
              <div className="event-unique-form-group">
                <label className="event-unique-form-label">Event Name <span style={{color:'#ff0000'}}>*</span> </label>
                <input
                  required
                  type="text"
                  className="event-unique-form-input"
                  placeholder="What's the name of your event?"
                  name='eventName'
                  value={eventData.eventName}
                  onChange={handleChange}
                />
              </div>
              <div className="event-unique-form-group">
                <label className="event-unique-form-label">State <span style={{color:'#ff0000'}}>*</span> </label>
                <select 
                  className="event-unique-form-select" 
                  required 
                  name='location' 
                  value={eventData.location} 
                  onChange={handleChange}
                >
                  <option value="">Where in Nigeria is the event?</option>
                  <option value='Lagos'>Within Lagos</option>
                  <option value='Outside Lagos'>Beyond Lagos</option>
                </select>
              </div>
            </div>

            <div className="event-unique-form-row">
              <div className="event-unique-form-group">
                <label className="event-unique-form-label">Venue <span style={{color:'#ff0000'}}>*</span> </label>
                <input
                  type="text"
                  required
                  className="event-unique-form-input"
                  placeholder="What's the venue address?"
                  name='venue'
                  value={eventData.venue}
                  onChange={handleChange}
                />
              </div>

              <div className="event-unique-form-group">
                <label className="event-unique-form-label">Date <span style={{color:'#ff0000'}}>*</span> </label>
                <input
                  type="date"
                  className="event-unique-form-input"
                  name="date"
                  value={eventData.date || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="event-unique-form-row">
              <div className="event-unique-form-group">
                <label className="event-unique-form-label">Time <span style={{color:'#ff0000'}}>*</span> </label>
                <input
                  type="time"
                  className="event-unique-form-input"
                  name="time"
                  value={eventData.time || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="event-unique-form-group">
                <label className="event-unique-form-label">Dress Code</label>
                <input
                  type="text"
                  className="event-unique-form-input"
                  placeholder="Leave blank if no dress code."
                  name='dressCode'
                  value={eventData.dressCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="event-unique-form-group event-unique-full-width">
              <label className="event-unique-form-label">Event Description <span style={{color:'#ff0000'}}>*</span> </label>
              <textarea
                className="event-unique-form-textarea"
                placeholder="Tell us what your event is about (max. 400 characters)"
                name='description'
                required
                value={eventData.description}
                onChange={handleChange}
              ></textarea>
              <div className="word-info">
                <span className={`word-count ${wordCount >= 20 ? 'valid' : ''}`}>
                  {wordCount} words
                </span> / 20 required
              </div>
              {wordError && <p className="word-error">{wordError}</p>}
            </div>

            <div className="event-unique-form-footer">
              <button className="event-unique-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Building Your Event...' : "Let's Keep Building your Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Event;
