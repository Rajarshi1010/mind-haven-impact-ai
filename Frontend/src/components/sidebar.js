import React, { useState } from 'react';

export default function Sidebar() {
  const [isMinimize, setMinimize] = useState(true);

  const toggleMinimize = () => {
    setMinimize(!isMinimize);
  };

  return (
    <div className={`sidebar-background ${isMinimize ? 'minimized' : 'expanded'}`}>
      <button id="minimize-button" className="minimize-button" onClick={toggleMinimize}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm440-80h120v-560H640v560Zm-80 0v-560H200v560h360Zm80 0h120-120Z" />
        </svg>
      </button>

      {!isMinimize && (
        <div>
          <nav className="nav">
            <p className="chat-history-title">Chat History</p>
          </nav>
          {/* <ul className="sidebar-links">
            <li id="home">Home</li>
            <li id="shop">Shop</li>
            <li id="support">Support</li>
            <li id="setting">Setting</li>
            <li id="logout">Logout</li>
          </ul> */}
        </div>
      )}
    </div>
  );
}