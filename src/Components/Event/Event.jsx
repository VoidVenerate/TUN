import React, { useState } from 'react';
import { ArrowLeft, Upload, CloudUpload } from 'lucide-react';
import './Event.css';
import { useNavigate, NavLink } from 'react-router-dom';
import { useEvent } from '../EventContext/EventContext';
import { useAuth } from '../RoleContext/RoleContext';

// MUI imports
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // makes most things dark
    primary: { main: '#8400FF' }, // selected date/time is purple
    background: { paper: '#000000' }, // picker background
    text: { primary: '#FFFFFF', secondary: '#FFFFFF' }, // text color
  },
});

const Event = () => {
  const { eventData, setEventData } = useEvent();
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { rules } = useAuth();
  const role = rules.role;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        if (img.width <= 400 && img.height <= 800) {
          const previewURL = URL.createObjectURL(file);
          setEventData(prev => ({
            ...prev,
            flyer: file,
            flyerPreview: previewURL
          }));
          setFlyerPreview(previewURL);
        } else {
          alert("Image must be max 800x400px.");
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (role === 'sub-admin' || role === 'super-admin') {
      navigate('/adminfeatureevent');
    } else {
      navigate('/featureevent');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="event-unique-container">
        <div className="event-unique-header">
          <NavLink to='/promote'><ArrowLeft className="event-unique-back" /></NavLink>
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
                <img src={flyerPreview || URL.createObjectURL(eventData.flyer)} alt="Preview" className="event-unique-flyer-preview" />
              ) : (
                <div className='event-unique-upload-placeholder'>
                  <Upload className="event-unique-upload-icon" />
                  <div className="event-unique-upload-text-block">
                    <div className="event-unique-upload-title">Click to upload</div>
                    <div className="event-unique-upload-subtitle">or drag and drop</div>
                    <div className="event-unique-upload-format">
                      SVG, PNG, JPG or GIF (max. 800x400px)
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
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={eventData.date || new Date()}
                      onChange={(newValue) => setEventData(prev => ({ ...prev, date: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} className="event-unique-form-input" />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div className="event-unique-form-row">
                <div className="event-unique-form-group">
                  <label className="event-unique-form-label">Time <span style={{color:'#ff0000'}}>*</span> </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      value={eventData.time ? new Date(`1970-01-01T${eventData.time}:00`) : new Date()}
                      onChange={(newTime) => {
                        const formattedTime = newTime.toTimeString().slice(0, 5);
                        setEventData(prev => ({ ...prev, time: formattedTime }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} className="event-unique-form-input" />
                      )}
                    />
                  </LocalizationProvider>
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
    </ThemeProvider>
  );
};

export default Event;
