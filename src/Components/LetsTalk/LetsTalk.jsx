import React from 'react'
import './LetsTalk.css'

const LetsTalk = () => {
  return (
    <div className='LetsTalk-container'>
        <div className="LetsTalk">
            <div className="LetsTalk-header">
                <h2>LET'S TALK</h2>
                <p>Get in touch with us using the enquiry form below.</p>
            </div>
            <div className="LetsTalk-form">
                <form>
                    <div className="form-field">
                        <div className="field">
                            <label>First Name</label><br />
                            <input placeholder='Enter your First Name' type="text" /><br />
                        </div>

                        <div className="field">
                            <label>Last Name</label><br />
                            <input placeholder='Enter your Last Name' type="text" /><br />
                        </div>

                        <div className="field">
                            <label>Email</label><br />
                            <input placeholder='Enter your  Email' type="email" /><br />
                        </div>

                        <div className="field">
                            <label>Phone Number</label><br />
                            <input placeholder='Enter your Phone Number' type="text" /><br />
                        </div>
                    </div>
                    <div>
                        <label>Message</label><br />
                        <textarea type="text" placeholder='Type your message here 'className='field-message'/><br />
                    </div>
                    <div className="field-checkbox">
                        <div className="checkbox-text">
                            <input type="checkbox"/>&nbsp;
                            <p>I agree to receive other communication messages from TUL</p>
                        </div>
                        <button type="submit">Submit message</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default LetsTalk