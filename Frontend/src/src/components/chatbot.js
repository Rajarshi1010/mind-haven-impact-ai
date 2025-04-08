import React, { useRef, useState, useEffect } from 'react';
import Sidebar from './sidebar';

export default function Chatbot() {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [conversationTitle, setConversationTitle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [typingIndex, setTypingIndex] = useState(-1);
    const [conversations, setConversations] = useState({});
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const [isAudioModeVisible, setIsAudioModeVisible] = useState(false);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history only once when component mounts
    useEffect(() => {
        if (!hasLoadedHistory) {
            loadChatHistory();
            setHasLoadedHistory(true);
        }

        // Listen for conversation selection events
        document.addEventListener('selectConversation', handleSelectConversation);
        return () => {
            document.removeEventListener('selectConversation', handleSelectConversation);
        };
    }, [hasLoadedHistory]);

    function loadChatHistory() {
        try {
            const username = localStorage.getItem('email');
            if (!username) {
                console.log('No username found, skipping chat history load');
                return;
            }
            
            fetch(`https://3zrj6xr3-5000.inc1.devtunnels.ms/${username}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch chat history');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.chat_history) {
                    setConversations(data.chat_history);
                    
                    // Store conversations in localStorage
                    const conversationsArray = [];
                    
                    for (const [convoId, messageList] of Object.entries(data.chat_history)) {
                        if (messageList.length > 0) {
                            // Create title from first message
                            const firstMessage = messageList[0].user_message;
                            const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
                            
                            // Format messages for our state structure
                            const formattedMessages = messageList.flatMap(msg => [
                                { sender: 'user', text: msg.user_message },
                                { sender: 'bot', text: msg.bot_reply }
                            ]);
                            
                            conversationsArray.push({
                                id: convoId,
                                title: title,
                                messages: formattedMessages,
                                lastUpdated: messageList[messageList.length - 1].time
                            });
                        }
                    }
                    
                    // If no active conversation is selected, load the most recent one
                    if (!conversationId && conversationsArray.length > 0) {
                        // Sort by lastUpdated
                        conversationsArray.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
                        const mostRecent = conversationsArray[0];
                        
                        setConversationId(mostRecent.id);
                        setConversationTitle(mostRecent.title);
                        setMessages(mostRecent.messages);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    const handleSelectConversation = async (event) => {
        const selectedConversationId = event.detail.conversationId;
        setConversationId(selectedConversationId);
        
        try {
            // First check if we have the conversation in our state from API
            if (conversations[selectedConversationId]) {
                const messageList = conversations[selectedConversationId];
                // Format messages for our state structure
                const formattedMessages = messageList.flatMap(msg => [
                    { sender: 'user', text: msg.user_message },
                    { sender: 'bot', text: msg.bot_reply }
                ]);
                setMessages(formattedMessages);
                
                // Set title from first message
                if (messageList.length > 0) {
                    const firstMessage = messageList[0].user_message;
                    const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
                    setConversationTitle(title);
                }
                return;
            }
            
            // Fallback to localStorage if not found in state
            const storedConversations = localStorage.getItem('chatConversations');
            if (storedConversations) {
                const conversationsArray = JSON.parse(storedConversations);
                const selectedConversation = conversationsArray.find(c => c.id === selectedConversationId);
                if (selectedConversation && selectedConversation.messages) {
                    setMessages(selectedConversation.messages);
                    setConversationTitle(selectedConversation.title);
                }
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const initializeConversationId = async () => {
        // Only create a new conversation if one doesn't already exist
        if (!conversationId) {
            const newConversationId = await generateConversationId();
            setConversationId(newConversationId);
            return newConversationId;
        }
        return conversationId;
    };

    const storeConversation = (id, title, msgs) => {
        try {
            const storedConversations = localStorage.getItem('chatConversations');
            let conversations = storedConversations ? JSON.parse(storedConversations) : [];
            
            // Check if conversation already exists
            const existingIndex = conversations.findIndex(c => c.id === id);
            
            if (existingIndex >= 0) {
                // Update existing conversation
                conversations[existingIndex] = {
                    ...conversations[existingIndex],
                    title: title || conversations[existingIndex].title,
                    messages: msgs.length > 0 ? msgs : conversations[existingIndex].messages,
                    lastUpdated: new Date().toISOString()
                };
            } else {
                // Add new conversation
                conversations.push({
                    id,
                    title: title || "New Chat",
                    messages: msgs,
                    lastUpdated: new Date().toISOString()
                });
            }
            
            localStorage.setItem('chatConversations', JSON.stringify(conversations));
        } catch (error) {
            console.error('Error storing conversation:', error);
        }
    };

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    const sendMessage = async (textToSend, fileToSend) => {
        if (textToSend || fileToSend) {
            // Get or create a conversation ID only when sending a message
            const activeConversationId = conversationId || await initializeConversationId();
            
            let newMessage = { sender: 'user', text: textToSend, file: fileToSend };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            messageInputRef.current.value = '';

            // Add loading message
            setIsLoading(true);
            const loadingMsgIndex = updatedMessages.length;
            setMessages([...updatedMessages, { sender: 'bot', text: '', isLoading: true }]);

            try {
                const data = await getBotResponse(textToSend, activeConversationId);
                const botResponse = data.response;
                
                // Remove loading message
                setIsLoading(false);
                
                let finalMessages = updatedMessages;
                
                if (typeof botResponse === 'string') {
                    finalMessages = [...updatedMessages, { sender: 'bot', text: botResponse, isTyping: true }];
                    setMessages(finalMessages);
                    setTypingIndex(finalMessages.length - 1);
                } else if (typeof botResponse === 'object') {
                    finalMessages = [...updatedMessages, { sender: 'bot', ...botResponse, isTyping: true }];
                    setMessages(finalMessages);
                    setTypingIndex(finalMessages.length - 1);
                }
                
                // Simulate typing effect and when done, mark as completed
                setTimeout(() => {
                    setTypingIndex(-1);
                    const completedMessages = finalMessages.map((msg, i) => {
                        if (i === finalMessages.length - 1) {
                            return { ...msg, isTyping: false };
                        }
                        return msg;
                    });
                    setMessages(completedMessages);
                    
                    // Update conversation title if this is the first message
                    if (updatedMessages.length === 1) {
                        const newTitle = textToSend.substring(0, 30) + (textToSend.length > 30 ? '...' : '');
                        setConversationTitle(newTitle);
                        storeConversation(activeConversationId, newTitle, completedMessages);
                    } else {
                        storeConversation(activeConversationId, conversationTitle, completedMessages);
                    }
                }, 1000); // Adjust typing duration as needed
                
            } catch (error) {
                console.log(error);
                setIsLoading(false);
                const errorMessages = [...updatedMessages, { sender: 'bot', text: 'Sorry, I encountered an error.' }];
                setMessages(errorMessages);
                storeConversation(activeConversationId, conversationTitle, errorMessages);
            }
        }
    };

    const handleSendMessageClick = () => {
        sendMessage(messageInputRef.current.value.trim());
    };

    const handleVoice = async () => {
        if (!isVoiceRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                setMediaRecorder(mediaRecorder);
                setAudioChunks([]);
                let speechRecognition; 
    
                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        setAudioChunks(prev => [...prev, event.data]);
                    }
                };
    
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
                    if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
                        if (speechRecognition) {
                            speechRecognition.stop(); 
                        }
                        setMediaRecorder(null);
                        setAudioChunks([]);
                        setIsVoiceRecording(false);
                    } else {
                        const formData = new FormData();
                        formData.append('audio', audioBlob, 'voice-message.webm');
    
                        try {
                            const response = await fetch('/api/transcribe', {
                                method: 'POST',
                                body: formData,
                            });
                            const data = await response.json();
                            if (data && data.text) {
                                console.log('Transcription from backend:', data.text);
                                sendMessage(data.text, { type: 'text' });
                            } else {
                                console.error('No transcription received from backend.');
                                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Could not transcribe audio.' }]);
                            }
                        } catch (error) {
                            console.error('Error sending audio to backend:', error);
                            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Error during audio transcription.' }]);
                        }
    
                        setMediaRecorder(null);
                        setAudioChunks([]);
                        setIsVoiceRecording(false);
                    }
    
                    stream.getTracks().forEach(track => track.stop());
                };
    
                if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
                    const SpeechRecognition = window.webkitSpeechRecognition || window.speechRecognition;
                    speechRecognition = new SpeechRecognition();
                    speechRecognition.lang = 'en-US';
                    speechRecognition.interimResults = false;
    
                    speechRecognition.onresult = (event) => {
                        const transcript = event.results[event.results.length - 1][0].transcript;
                        sendMessage(transcript, { type: 'text' });
                    };
    
                    speechRecognition.onerror = (event) => {
                        console.error('Speech recognition error:', event.error);
                        setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Error during speech recognition.' }]);
                        if (mediaRecorder && mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                        stream.getTracks().forEach(track => track.stop());
                        setIsVoiceRecording(false);
                        setMediaRecorder(null);
                        setAudioChunks([]);
                    };
    
                    speechRecognition.onend = () => {
                        if (mediaRecorder && mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                        stream.getTracks().forEach(track => track.stop());
                        setIsVoiceRecording(false);
                        setMediaRecorder(null);
                        setAudioChunks([]);
                    };
    
                    speechRecognition.start();
    
                    mediaRecorder.start();
                    setIsVoiceRecording(true);
                } else {
                    mediaRecorder.start();
                    setIsVoiceRecording(true);
                }
    
            } catch (error) {
                console.error('Error accessing microphone:', error);
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Microphone access denied.' }]);
            }
        } else if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    

    const voiceMode = () => {
        document.getElementById('chat-container').style.display = 'none';
        document.getElementById('audio-container').style.display = 'flex'; // Change to flex to use flexbox layout
        setIsAudioModeVisible(true);
    }

    const chatMode = () => {
        document.getElementById('chat-container').style.display = 'flex';
        document.getElementById('audio-container').style.display = 'none';
        setIsAudioModeVisible(false);
    }
    
    async function getBotResponse(userMessage, activeConversationId) {
        try {
            const res = await fetch(`https://3zrj6xr3-5000.inc1.devtunnels.ms/get_response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: userMessage, 
                    username: localStorage.getItem('email'),
                    conversationId: activeConversationId
                })
            });
            const data = await res.json();
            return data;

        } catch (error) {
            console.error('Error fetching bot response:', error);
            return { response: 'Sorry, I encountered an error.' };
        }
    }

    async function generateConversationId() {
        const timestamp = Date.now().toString();
        const email = localStorage.getItem('email') || 'anonymous';
        const msg = new TextEncoder().encode(email + timestamp);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msg);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.slice(0, 16);
    }

    // CSS for animations
    const loadingDotsKeyframes = `
        @keyframes loadingDots {
            0%, 20% {
                content: ".";
            }
            40% {
                content: "..";
            }
            60%, 100% {
                content: "...";
            }
        }
    `;

    const typingAnimation = `
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
    `;

    return (
        <>
        <header>
            <div class="logo">MindHaven</div>
            <nav>
                <a href='/home'>Home</a>
                <a href=''>Chat</a>
                <a href='/journal'>Journal</a>
                <a href='/insight'>Insights</a>
                <a href='/'>Logout</a>
            </nav>
        </header>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
            <style>
                {loadingDotsKeyframes}
                {typingAnimation}
            </style>
            <Sidebar />
            <div className="chatbot-container" id='chat-container'>
                <div className="chat-window" >
                    <div className="chat-box" ref={chatBoxRef} style={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {messages.length === 0 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                color: '#888',
                                flexDirection: 'column'
                            }}>
                                <p>Start a new conversation</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={message.sender === 'user' ? 'user-message-container' : 'bot-message-container'} style={{
                                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                marginBottom: '10px'
                            }}>
                                {message.isLoading ? (
                                    <div className="loading-message" style={{
                                        backgroundColor: '#26262717',
                                        padding: '1vw',
                                        borderRadius: '10px',
                                        borderTopLeftRadius: '0px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <div className="loading-dots" style={{
                                            position: 'relative',
                                            height: '20px',
                                            width: '40px'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#888',
                                                margin: '0 2px',
                                                animation: 'bounce 1.4s infinite ease-in-out both'
                                            }}></span>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#888',
                                                margin: '0 2px',
                                                animation: 'bounce 1.4s 0.2s infinite ease-in-out both'
                                            }}></span>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#888',
                                                margin: '0 2px',
                                                animation: 'bounce 1.4s 0.4s infinite ease-in-out both'
                                            }}></span>
                                            <style>
                                                {`
                                                @keyframes bounce {
                                                    0%, 80%, 100% { transform: translateY(0); }
                                                    40% { transform: translateY(-8px); }
                                                }
                                                `}
                                            </style>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={message.sender === 'user' ? 'user-message' : 'bot-message'}>
                                        {message.text && (
                                            <p style={{ 
                                                color: 'black', 
                                                width: 'auto', 
                                                backgroundColor: 'rgba(102, 102, 102, 0.3)', 
                                                padding: '1vw', 
                                                borderRadius: '10px', 
                                                borderTopRightRadius: message.sender === 'user' ? '0px' : '10px',
                                                borderTopLeftRadius: message.sender === 'bot' ? '0px' : '10px',
                                                margin: 0,
                                                animation: message.isTyping ? 'fadeIn 0.5s ease forwards' : 'none',
                                                opacity: message.isTyping ? 0 : 1,
                                                transition: 'opacity 0.3s ease'
                                            }}>
                                                {message.text}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="chat-input-container" style={{
                        padding: '10px',
                        borderTop: '1px solid #eaeaea',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <input
                            type="text"
                            id="chat-input"
                            className="chat-input"
                            placeholder="Ask anything"
                            ref={messageInputRef}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '20px',
                                border: '1px solid #262627',
                                marginRight: '10px'
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    handleSendMessageClick();
                                }
                            }}
                        />
                        <button className="voice-btn" onClick={voiceMode} >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                                <path d="M280-240v-480h80v480h-80ZM440-80v-800h80v800h-80ZM120-400v-160h80v160h-80Zm480 160v-480h80v480h-80Zm160-160v-160h80v160h-80Z"/>
                            </svg>
                        </button>
                        <button className="send-btn" onClick={handleSendMessageClick} >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff">
                                <path d="M120-160v-640l760 320-760 320Zm80-120l474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div style={{ display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f9f9f9' }} id='audio-container'>
                <div className='audio-mode-container' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button onClick={chatMode} className='cancel-audio'>X</button>
                    <button onClick={handleVoice} className='mic-button' >
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="white">
                            {isVoiceRecording ?
                                <path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/>
                                :
                                <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
                            }
                        </svg>
                    </button>
                    {messages.filter(msg => msg.sender === 'bot' && msg.text).slice(-1).map((msg, index) => (
                        <div key={`last-bot-message-${index}`} style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '10px', textAlign: 'center' }}>
                            <p style={{ margin: 0 }}>Last response: {msg.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    );
}