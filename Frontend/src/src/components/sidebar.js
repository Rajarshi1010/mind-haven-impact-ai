import React, { useState, useEffect } from 'react';

export default function Sidebar() {
  const [isMinimize, setMinimize] = useState(true);
  const [conversations, setConversations] = useState([]);
 
  useEffect(() => {
    // Fetch conversation history from localStorage or other storage
    const fetchConversations = () => {
      try {
        const storedConversations = localStorage.getItem('chatConversations');
        if (storedConversations) {
          setConversations(JSON.parse(storedConversations));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
   
    fetchConversations();
  }, []);

  const toggleMinimize = () => {
    setMinimize(!isMinimize);
  };

  const selectConversation = (conversationId) => {
    // Dispatch an event or use a callback to notify the parent component
    const event = new CustomEvent('selectConversation', {
      detail: { conversationId }
    });
    document.dispatchEvent(event);
  };

  return (
    <div
      className={`sidebar-container ${isMinimize ? 'minimized' : 'expanded'}`}
      style={{
        width: isMinimize ? '50px' : '250px',
        transition: 'width 0.3s ease',
        borderRight: '1px solid #eaeaea',
        height: '100vh',
        position: 'relative',
        backgroundColor: '#f9f9f9'
      }}
    >
      {!isMinimize && (
        <div className="sidebar-content" style={{ padding: '20px', paddingTop: '50px' }}>
          <nav className="nav">
            <p style={{ position: 'absolute', top: '15px', left: '15px', fontWeight: 'bold', color: '#000' }}>Chat History</p>
            <div style={{ marginTop: '20px' }}>
              {conversations.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {conversations.map((conv, index) => (
                    <li
                      key={conv.id || index}
                      onClick={() => selectConversation(conv.id)}
                      style={{
                        padding: '10px',
                        margin: '5px 0',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        backgroundColor: '#eaeaea',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conv.title || `Conversation ${index + 1}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', fontSize: '14px' }}>No previous chats</p>
              )}
            </div>
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
          position: 'absolute',
          right: '5px',
          top: '10px'
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