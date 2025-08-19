import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, Clock, CloudUpload } from 'lucide-react';
import './Event.css';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../EventContext/EventContext';
import { useAuth } from '../RoleContext/RoleContext';

const Event = () => {
    const { eventData, setEventData } = useEvent(); // Event context
    const [flyerPreview, setFlyerPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { rules } = useAuth(); // get role from context
    const role = rules.role; // 'admin', 'user', etc.

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const img = new Image();
            img.onload = () => {
                if (img.width <= 800 && img.height <= 400) {
                    const previewURL = URL.createObjectURL(file);
                    setEventData(prev => ({
                        ...prev,
                        flyer: file,
                        flyerPreview: previewURL // <-- Save preview in context
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

        // Navigate to different pages based on role
        console.log("Role is:", role);
        if (role === 'sub-admin' || role === 'super-admin') {
            navigate('/adminfeatureevent');
        } else {
            navigate('/featureevent');
        }
    };

    return (
        <div className="event-form-container">
            <div className="header">
                <ArrowLeft className="back-arrow" />
                <h1 className="header-title">PROMOTE AN EVENT</h1>
            </div>

            <div className="form-content">
                {/* Upload Section */}
                <div className="upload-section">
                    <div className="upload-label">
                        <span className="upload-flyer-text"><CloudUpload size={16}/><p>Upload Flyer</p></span>
                        <div className="upload-description">
                            Select and upload flyer for the event.
                        </div>
                    </div>
                    <label className="upload-area">
                        {flyerPreview || eventData.flyer ? (
                            <img src={flyerPreview || URL.createObjectURL(eventData.flyer)} alt="Preview" className="flyer-preview" />
                        ) : (
                            <div className='upload-sec'>
                                <Upload className="upload-icon" />
                                <div className="upload-text">
                                    <div className="upload-title">Click to upload</div>
                                    <div className="upload-subtitle">or drag and drop</div>
                                    <div className="upload-format">
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
                <div className="form">
                    <form className="form-fields" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Event Name*</label>
                                <input
                                    required
                                    type="text"
                                    className="form-input"
                                    placeholder="What's the name of your event?"
                                    name='eventName'
                                    value={eventData.eventName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State*</label>
                                <select 
                                    className="form-select" 
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

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Venue*</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="What's the venue address?"
                                    name='venue'
                                    value={eventData.venue}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date*</label>
                                <div className="date-input-wrapper">
                                    <input
                                        type="date"
                                        required
                                        className="form-input"
                                        name='date'
                                        value={eventData.date}
                                        onChange={handleChange}
                                    />
                                    <Calendar className="input-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Time*</label>
                                <div className="time-input-wrapper">
                                    <input
                                        type="time"
                                        required
                                        className="form-input"
                                        name='time'
                                        value={eventData.time}
                                        onChange={handleChange}
                                    />
                                    <Clock className="input-icon" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dress Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Leave blank if no dress code."
                                    name='dressCode'
                                    value={eventData.dressCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Event Description*</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Tell us what your event is about (max. 400 characters)"
                                name='description'
                                required
                                value={eventData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="form-footer">
                            <button className="create-event-btn" disabled={isSubmitting}>
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
