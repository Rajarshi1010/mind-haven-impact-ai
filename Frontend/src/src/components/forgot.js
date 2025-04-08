import React, { useState } from 'react';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email.');
      return;
    }
    console.log('Reset link sent to:', email);
    setMessage('Reset link sent to your email!');
    setEmail('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setMessage(''); 
  };

  return (
    <div className='forgot-body'>
        <div className="forgot-container">
        <h2>Forgot Your Password?</h2>
        <p>Enter your email address and we’ll send you a link to reset your password.</p>
        <form id="forgotPasswordForm" onSubmit={handleSubmit}>
            <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Enter your registered email"
            />
            </div>
            <button className='forgot-button' type="submit">Send Reset Link</button>
        </form>
        {message && <p className="message">{message}</p>} 
        <div className="footer-links">
            <p><a href="/login">Back to Login</a></p> 
        </div>
        </div>
    </div>
  );
}