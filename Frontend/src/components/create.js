import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Create() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleShowPasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleShowConfirmPasswordToggle = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!username) {
            setError('Username is required.');
            setIsSubmitting(false);
            return;
        }
        if (!password) {
            setError('Password is required.');
            setIsSubmitting(false);
            return;
        }
        if (!confirmPassword) {
            setError('Confirm Password is required.');
            setIsSubmitting(false);
            return;
        }
        if (password !== confirmPassword) {
            console.log("password")
            setIsSubmitting(false);
            return;
        }


        // Simulate API call
        // try {
        //     await new Promise(resolve => setTimeout(resolve, 1500));
        //     console.log('Simulated signup successful');
        //     // Redirect to login after successful signup
        //     navigate('/login');
        // } catch (err) {
        //     setError('Could not connect to the server.');
        //     console.error('Signup error:', err);
        // } finally {
        //     setIsSubmitting(false);
        // }
    };

    return (
        <div className='login-body'>
            <div class="welcome-section">
                <div class="welcome-text">
                <span class="typing">Join Us Today </span>
                </div>
                <div class="welcome-subtext">
                Create your free account to access exclusive features and improve your mental wellness journey!
                </div>
            </div>

            <div class="login-container">
                <h2>Create Your Account</h2>
                <form id="signup-form">
                <div class="form-group">
                    <label for="fullname">Full Name</label>
                    <input type="text" id="fullname" name="fullname" required placeholder="Enter your full name" />
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email" />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Create a password" />
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" name="confirm-password" required placeholder="Confirm your password" />
                </div>
                <button className='login-button' type="submit" onClick={handleSubmit}>Create Account</button>
                </form>
                <div class="footer-links">
                <p>Already have an account? <a href="login">Login here</a></p>
                </div>
            </div>
        </div>

    );
}

export default Create;