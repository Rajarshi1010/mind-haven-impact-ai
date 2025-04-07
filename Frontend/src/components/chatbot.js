import React, { useRef, useState, useEffect } from 'react';
import Sidebar from './sidebar';

export default function Chatbot() {
    const chatBoxRef = useRef(null);
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audioMode, setAudioMode] = useState(false)

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    const sendMessage = async (textToSend, fileToSend) => {
        if (textToSend || fileToSend) {
            let newMessage = { sender: 'user', text: textToSend, file: fileToSend };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            messageInputRef.current.value = '';

            try {
                const data = await getBotResponse(textToSend);
                const botResponse = data.response
                const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                if (typeof botResponse === 'string') {
                    setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
                } else if (typeof botResponse === 'object') {
                    setMessages(prevMessages => [...prevMessages, { sender: 'bot', ...botResponse }]);
                }
            } catch (error) {
                console.log(error)
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Sorry, I encountered an error.' }]);
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
            // The stream will be stopped in the onstop handler
        }
    };

    async function getBotResponse(userMessage) {
        try {
            const res = await fetch('https://3zrj6xr3-5000.inc1.devtunnels.ms/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMessage })
            });
            const data = await res.json();
            return data

        } catch (error) {
            console.error('Error fetching bot response:', error);
            return 'Sorry, I encountered an error.';
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Sidebar />
            <div className="chatbot-container">
                    <div className="chat-window">
                        <div className="chat-box" ref={chatBoxRef}>
                            {messages.map((message, index) => (
                                <div key={index} className={message.sender === 'user' ? 'user-message-container' : 'bot-message-container'}>
                                    <div className={message.sender === 'user' ? 'user-message' : 'bot-message'}>
                                        {message.text && <p style={{ color: 'black', width: 'auto', backgroundColor: '#26262717', padding: '1vw', borderRadius: '10px', borderTopRightRadius: '0px' }}>{message.text}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="chat-input-container">
                            <input
                                type="text"
                                id="chat-input"
                                className="chat-input"
                                placeholder="Ask anything"
                                ref={messageInputRef}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSendMessageClick();
                                    }
                                }}
                            />
                            <button className="voice-btn" onClick={handleVoice}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                                <path d="M280-240v-480h80v480h-80ZM440-80v-800h80v800h-80ZM120-400v-160h80v160h-80Zm480 160v-480h80v480h-80Zm160-160v-160h80v160h-80Z"/>
                            </svg>
                            </button>
                            <button className="send-btn" onClick={handleSendMessageClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="4vh" viewBox="0 -960 960 960" width="24px" fill="#fff">
                                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    );
}