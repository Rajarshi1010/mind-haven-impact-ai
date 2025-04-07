import Sidebar from './sidebar';
import { useEffect } from 'react';

function Settings() {
    useEffect(() => {
        const sideMenuButtons = document.querySelectorAll('.side-menu button');
        const contentSections = document.querySelectorAll('.content-section');

        const hideAllSections = () => {
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
        };

        const showSection = (targetId) => {
            const sectionToShow = document.getElementById(targetId);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
        };

        sideMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                hideAllSections();
                const targetId = button.dataset.target;
                showSection(targetId);

                // Update active class on side menu buttons
                sideMenuButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Set the 'Account' section as active on page load
        const initialActiveButton = document.querySelector('.side-menu button[data-target="account-settings"]');
        if (initialActiveButton) {
            initialActiveButton.classList.add('active');
        }
    }, []); // Empty dependency array ensures this runs only once after initial render

    return (
        <div>
            <Sidebar />
            <div className="container">
                <div className="side-menu">
                    <ul>
                        <li><button data-target="account-settings" className='menu-buttons'>Account</button></li>
                        <li><button data-target="appearance-settings" className='menu-buttons'>Appearance</button></li>
                        <li><button data-target="notifications-settings" className='menu-buttons'>Notifications</button></li>
                        <li><button data-target="privacy-settings" className='menu-buttons'>Privacy</button></li>
                        <li><button data-target="advanced-settings" className='menu-buttons'>Advanced</button></li>
                    </ul>
                </div>
                <div className="content">
                    <div id="account-settings" className="content-section active">
                        <h2 className='header'>Account Settings</h2>
                        <div className="setting-section">
                            <h3>Account Information</h3>
                            <div className="setting-item">
                                <label htmlFor="username">Username:</label>
                                <input type="text" id="username" name="username" value="current_user" />
                            </div>
                            <div className="setting-item">
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" value="current_email@example.com" />
                            </div>
                        </div>
                        <div className="setting-section">
                            <h3>Password</h3>
                            <div className="setting-item">
                                <label htmlFor="password">Change Password:</label>
                                <input type="password" id="password" name="password" placeholder="New Password" />
                            </div>
                            <div className="setting-item">
                                <label htmlFor="confirm_password">Confirm Password:</label>
                                <input type="password" id="confirm_password" name="confirm_password" placeholder="Confirm New Password" />
                            </div>
                        </div>
                    </div>

                    <div id="appearance-settings" className="content-section">
                        <h2 className='header'>Appearance</h2>
                        <div className="setting-section">
                            <h3>Theme</h3>
                            <div className="setting-item">
                                <label htmlFor="theme">Theme:</label>
                                <select id="theme" name="theme">
                                    <option value="light">Light</option>
                                    <option value="dark" defaultValue>Dark</option>
                                    <option value="system">System Default</option>
                                </select>
                            </div>
                        </div>
                        <div className="setting-section">
                            <h3>Font</h3>
                            <div className="setting-item">
                                <label htmlFor="font_size">Font Size:</label>
                                <input type="number" id="font_size" name="font_size" value="16" />
                            </div>
                        </div>
                    </div>

                    <div id="notifications-settings" className="content-section">
                        <h2 className='header'>Notifications</h2>
                        <div className="setting-section">
                            <div className="setting-item">
                                <label>Email Notifications:</label>
                                <input type="checkbox" id="email_notifications" name="email_notifications" defaultChecked />
                            </div>
                            <div className="setting-item">
                                <label>Push Notifications:</label>
                                <input type="checkbox" id="push_notifications" name="push_notifications" />
                            </div>
                            <div className="setting-item">
                                <label htmlFor="notification_frequency">Notification Frequency:</label>
                                <select id="notification_frequency" name="notification_frequency">
                                    <option value="instant">Instant</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="privacy-settings" className="content-section">
                        <h2 className='header'>Privacy</h2>
                        <div className="setting-section">
                            <div className="setting-item">
                                <label>Public Profile:</label>
                                <input type="radio" id="public_profile_yes" name="public_profile" value="yes" defaultChecked /> Yes
                                <input type="radio" id="public_profile_no" name="public_profile" value="no" /> No
                            </div>
                            <div className="setting-item">
                                <label htmlFor="privacy_policy">Privacy Policy:</label>
                                <a href="/#">View Privacy Policy</a>
                            </div>
                        </div>
                    </div>

                    <div id="advanced-settings" className="content-section">
                        <h2 className='header'>Advanced</h2>
                        <div className="setting-section">
                            <div className="setting-item">
                                <label htmlFor="language">Language:</label>
                                <select id="language" name="language">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="hi">Hindi</option>
                                    <option value="kn">Kannada</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label htmlFor="api_key">API Key:</label>
                                <input type="text" id="api_key" name="api_key" value="xxxxxxxxxxxxxxxxx" readOnly />
                            </div>
                            <div className="setting-item">
                                <label htmlFor="custom_css">Custom CSS:</label>
                                <textarea id="custom_css" name="custom_css" rows="4" placeholder="Enter custom CSS here"></textarea>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button className='submit-buttons' type="submit">Save Changes</button>
                        <button className='submit-buttons' type="button">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;