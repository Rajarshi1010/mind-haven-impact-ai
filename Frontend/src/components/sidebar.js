import React, { useState } from 'react';

export default function Sidebar() {
  const [isMinimize, setMinimize] = useState(true);

  const toggleMinimize = () => {
    setMinimize(!isMinimize);
  };

  return (
    <div
      className={`sidebar-container ${isMinimize ? 'minimized' : 'expanded'}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'fixed',
        top: '0px',
        left: '0px', // Stick to the left side
        transition: 'width 0.3s ease-in-out',
        width: isMinimize ? '60px' : '200px',
        backgroundColor: '#26262740',
        borderRight: '1px solid #ccc',
        zIndex: 10,
        height: '100vh',
        justifyContent: 'flex-end', // Push button to the right
      }}
    >
      {!isMinimize && (
        <div className="sidebar-content">
          <nav className="nav">
            <p style={{ position: 'absolute', left: '15px', color: '#000' }}>Chat History</p>
          </nav>
        </div>
      )}
      <button
        id="minimize-button"
        className={`minimize-button ${isMinimize ? 'minimized' : 'expanded'}`}
        onClick={toggleMinimize}
        style={{
          background: 'none',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease-in-out',
          transform: isMinimize ? 'rotate(0deg)' : 'rotate(180deg)',
          // Removed marginLeft, as justifyContent: 'flex-end' handles positioning
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#000"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm440-80h120v-560H640v560Zm-80 0v-560H200v560h360Zm80 0h120-120Z" />
        </svg>
      </button>
    </div>
  );
}