import React, { useState } from 'react';
import axios from 'axios';
import './LetsTalk.css';

const LetsTalk = () => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Validation error state
  const [errors, setErrors] = useState({});

  // Submission state
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null); // null | true | false
  const [submitMessage, setSubmitMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid.';
    if (!message.trim()) newErrors.message = 'Message is required.';
    if (!agreed) newErrors.agreed = 'You must agree to proceed.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitSuccess(null);
    setSubmitMessage('');

    if (Object.keys(validationErrors).length !== 0) return;

    setLoading(true);

    try {
      // Replace with your backend URL
      const apiUrl = 'https://lagos-turnup.onrender.com';

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        message,
        agreed,
      };

      const res = await axios.post(apiUrl, payload);

      setSubmitSuccess(true);
      setSubmitMessage('Message sent successfully!');

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setAgreed(false);
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitSuccess(false);

      // Show backend error message if available
      setSubmitMessage(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='LetsTalk-container'>
      <div className="LetsTalk">
        <div className="LetsTalk-header">
          <h2>LET'S TALK</h2>
          <p>Get in touch with us using the enquiry form below.</p>
        </div>
        <div className="LetsTalk-form">
          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="form-field">
              <div className="field">
                <label htmlFor="firstName">First Name</label><br />
                <input
                  id="firstName"
                  placeholder='Enter your First Name'
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                {errors.firstName && <p className="error">{errors.firstName}</p>}
                <br />
              </div>

              {/* Last Name */}
              <div className="field">
                <label htmlFor="lastName">Last Name</label><br />
                <input
                  id="lastName"
                  placeholder='Enter your Last Name'
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
                {errors.lastName && <p className="error">{errors.lastName}</p>}
                <br />
              </div>

              {/* Email */}
              <div className="field">
                <label htmlFor="email">Email</label><br />
                <input
                  id="email"
                  placeholder='Enter your Email'
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {errors.email && <p className="error">{errors.email}</p>}
                <br />
              </div>

              {/* Phone */}
              <div className="field">
                <label htmlFor="phone">Phone Number</label><br />
                <input
                  id="phone"
                  placeholder='Enter your Phone Number'
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <br />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message">Message</label><br />
              <textarea
                id="message"
                placeholder='Type your message here'
                className='field-message'
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              {errors.message && <p className="error">{errors.message}</p>}
              <br />
            </div>

            {/* Checkbox and Submit */}
            <div className="field-checkbox">
              <div className="checkbox-text">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                />&nbsp;
                <label htmlFor="agreement">I agree to receive other communication messages from TUL</label>
              </div>
              {errors.agreed && <p className="error">{errors.agreed}</p>}
              <button type="submit" disabled={!agreed || loading}>
                {loading ? 'Sending...' : 'Submit message'}
              </button>
            </div>

            {/* Submission status message */}
            {submitSuccess !== null && (
              <p className={submitSuccess ? 'submit-success' : 'submit-error'}>
                {submitMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LetsTalk;
