import React, { useEffect, useState, useRef } from 'react';
import Modal from '../Modal/Modal';
import { Upload, TrendingUp, TrendingDown, Mail } from 'lucide-react';
import axios from 'axios';
import './Newsletter.css';
import api from '../api';

const Newsletter = () => {
    // Stats states
    const [subscriptions, setSubscriptions] = useState(0);
    const [prevSubscriptions, setPrevSubscriptions] = useState(null);
    const [percentageChange, setPercentageChange] = useState(0);
    const [trend, setTrend] = useState(null);
    const [displayedPercentage, setDisplayedPercentage] = useState(0);

    // Form fields
    const [flyer, setFlyer] = useState(null);
    const [flyerPreview, setFlyerPreview] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [subject, setSubject] = useState("");
    const [headline, setHeadline] = useState("");
    const [content, setContent] = useState("");

    // UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalInfo, setModalInfo] = useState({
        show: false,
        title: '',
        message: '',
        subMessage: '',
        type: '',
    });

    // Hover state for confirm button
    const [isPublishHover, setIsPublishHover] = useState(false);
    const hoverTimeoutRef = useRef(null);

    // Button styles
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

    // Hover handlers
    const handlePublishMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsPublishHover(true);
    };
    const handlePublishMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => setIsPublishHover(false), 250);
    };

    // Fetch subscription count once
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await api.get('https://lagos-turnup.onrender.com/event/newsletter');
                const pendingData = res.data;
                const newCount = Array.isArray(pendingData) ? pendingData.length : 0;

                if (prevSubscriptions !== null) {
                    const diff = newCount - prevSubscriptions;
                    const percent = prevSubscriptions > 0 
                        ? Math.abs((diff / prevSubscriptions) * 100).toFixed(1) 
                        : 0;
                    setPercentageChange(percent);
                    setTrend(diff > 0 ? 'up' : diff < 0 ? 'down' : null);
                }

                setPrevSubscriptions(newCount);
                setSubscriptions(newCount);
            } catch (error) {
                console.error("Error sending newsletter", error.response?.data || error.message);
                setModalInfo({
                    show: true,
                    title: "Error!",
                    message: "Failed to send newsletter.",
                    subMessage: error.response?.data?.message || "",
                    type: "error",
                });
            }
        };

        fetchSubscription();
    }, []); // only runs on mount

    // Animate percentage change
    useEffect(() => {
        let start = displayedPercentage;
        let end = percentageChange;
        let step = (end - start) / 20;

        let animation = setInterval(() => {
            start += step;
            if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
                start = end;
                clearInterval(animation);
            }
            setDisplayedPercentage(start.toFixed(1));
        }, 30);

        return () => clearInterval(animation);
    }, [percentageChange]);

    // Handle final submission
    const handleSubmit = async () => {
        if (!subject || !headline || !content) {
            setMessage("Please fill all required fields.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem('token'); 
              if (!token) {
                  console.warn('No token found — user might not be logged in');
                  return;
              }
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("headline", headline);
            formData.append("content", content);
            if (flyer) formData.append("flyer", flyer); // optional

            const res = await axios.post('https://lagos-turnup.onrender.com/event/newsletter', formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });

            setModalInfo({
                show: true,
                title: "Success!",
                message: "Newsletter sent successfully!",
                subMessage: "Your message has been delivered to all subscribers.",
                type: "success",
            });

            // Reset form
            setSubject("");
            setHeadline("");
            setContent("");
            setFlyer(null);
            setFlyerPreview(null);
            setAgreed(false);
            document.getElementById('flyerInput').value = "";

        } catch (error) {
            console.error("Error sending newsletter", error);
            setModalInfo({
                show: true,
                title: "Error!",
                message: "Failed to send newsletter.",
                subMessage: "",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='subscription-container'>
            {/* Stats Card */}
            <div className="subscription-cards">
                <div className="subscription-card">
                    <h3>Newsletter Subscribers <Mail size={16} /></h3>
                    <p>{subscriptions}</p>
                    {trend && (
                        <div className={`trend ${trend}`}>
                            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{displayedPercentage}%</span>
                            <p>from yesterday</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="subscription-header">
                <h2 style={{ fontFamily: 'Rushon Ground' }}>SEND NEWSLETTER</h2>
                <p>Reach your audience with updates, announcements, and special event promotions.</p>
            </div>

            {/* Form */}
            <div className="subscription-form">
                <form 
                    className='form-container' 
                    onSubmit={(e) => {
                        e.preventDefault();
                        setShowConfirmModal(true);
                    }}
                >
                    <div className="sub-form-group">
                        <div className="sub-form-row">
                            <label>Subject <span>*</span></label>
                            <input 
                                type="text" 
                                placeholder='Newsletter Subject' 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="sub-form-row">
                            <label>Headlines <span>*</span></label>
                            <input 
                                type="text" 
                                placeholder='Email Headline' 
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sub-form-area">
                        <label>Message Content <span>*</span></label>
                        <textarea 
                            placeholder='Write your newsletter content here...' 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="sub-form-footer">
                        <p>Newsletter Image (optional)</p>
                        <div 
                            className="upload-container" 
                            onClick={() => document.getElementById('flyerInput').click()}
                        >
                            {flyerPreview ? (
                                <img src={flyerPreview} alt="Newsletter" />
                            ) : (
                                <div className="placeholder">
                                    <Upload size={24} />
                                    <span>Click to upload image</span>
                                </div>
                            )}
                            <input
                                id="flyerInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setFlyer(file);
                                    setFlyerPreview(URL.createObjectURL(file));
                                }}
                            />
                        </div>
                    </div>

                    <div className="check-submit">
                        <div className="agreement">
                            <input 
                                type="checkbox" 
                                checked={agreed} 
                                onChange={(e) => setAgreed(e.target.checked)} 
                            />
                            <p>I agree to receive other communication messages from TUL</p>
                        </div>
                        <button disabled={!agreed || loading} className='sub-form-btn'>
                            {loading ? "Sending..." : "Send Newsletter"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirm Modal */}
            <Modal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirm"
                message="Are you sure you want to send this newsletter?"
                subMessage="This email will be sent to all active subscribers. Please confirm that all the information is accurate. You cannot undo this action."
                footerButtons={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button style={closeBtnStyle} onClick={() => setShowConfirmModal(false)} type="button">Cancel</button>
                        <button
                            style={publishBtnStyle(isPublishHover)}
                            onClick={() => {
                                setShowConfirmModal(false);
                                handleSubmit();
                            }}
                            onMouseEnter={handlePublishMouseEnter}
                            onMouseLeave={handlePublishMouseLeave}
                            type="button"
                        >
                            Yes, Send
                        </button>
                    </div>
                }
            />

            {/* Final Modal */}
            <Modal
                show={modalInfo.show}
                onClose={() => setModalInfo(prev => ({ ...prev, show: false }))}
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
                        onClick={() => setModalInfo(prev => ({ ...prev, show: false }))}
                        type="button"
                    >
                        Close
                    </button>
                }
            />
        </div>
    );
};

export default Newsletter;
