import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SentimentAnalysis = () => {
    const [text, setText] = useState('');
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const analyzeSentiment = async () => {
        if (!text.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('https://3zrj6xr3-5000.inc1.devtunnels.ms/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
        
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        
            const data = await response.json();
            setSentiment(data);
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <>
        <header>
            <div class="logo">MindHaven</div>
            <nav>
                <a href='/home'>Home</a>
                <a href='/chat'>Chat</a>
                <a href=''>Journal</a>
                <a href='/insight'>Insights</a>
                <a href='/'>Logout</a>
            </nav>
        </header>
        <motion.div
            className="sentiment-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className="floating-leaves"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
            />

            <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                How are you feeling today?
            </motion.h2>

            <motion.p
                className="subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Share your thoughts, and I'll help you understand your emotions
            </motion.p>

            <motion.div
                className="journal-container"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
            >
        <textarea
            className="sentiment-textarea"
            placeholder="Write about your day, feelings, or anything on your mind..."
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

                <motion.button
                    className="analyze-button"
                    onClick={analyzeSentiment}
                    disabled={loading || !text.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {loading ? (
                        <motion.div
                            className="loading-spinner"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                    ) : (
                        "Analyze My Feelings"
                    )}
                </motion.button>
            </motion.div>

            <AnimatePresence>
                {sentiment && (
                    <motion.div
                        className="result-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <motion.div
                            className="emoji-container"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: sentiment.sentiment === 'POSITIVE' ? [0, 10, 0] : [0, -10, 0]
                            }}
                            transition={{ repeat: 2, duration: 1 }}
                        >
                            {sentiment.sentiment === 'POSITIVE' ? '😊' : sentiment.sentiment === 'NEGATIVE' ? '😔' : '😐'}
                        </motion.div>

                        <motion.div className="sentiment-result">
                            <h3>Your mood seems {sentiment.sentiment.toLowerCase()}</h3>

                            <div className="confidence-bar-container">
                                <motion.div
                                    className="confidence-bar"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round(sentiment.confidence * 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>

                            <p className="confidence-text">{Math.round(sentiment.confidence * 100)}% confidence</p>
                        </motion.div>

                        <motion.div
                            className="suggestion-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {sentiment.sentiment === 'POSITIVE' ? (
                                <>
                                    <h4>Nurture this feeling</h4>
                                    <p>It's wonderful you're feeling positive! Here are some ways to maintain this energy:</p>
                                    <ul>
                                        <li>Practice gratitude by noting three good things about today</li>
                                        <li>Share your positive energy with someone you care about</li>
                                        <li>Engage in an activity that brings you joy</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h4>Care for yourself</h4>
                                    <p>It's okay to feel this way. Here are some gentle suggestions:</p>
                                    <ul>
                                        <li>Take a few deep breaths with me</li>
                                        <li>Try a quick 5-minute mindfulness exercise</li>
                                        <li>Connect with someone who supports you</li>
                                    </ul>
                                    <motion.button
                                        className="breathing-exercise-button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowTips(true)}
                                    >
                                        Try a breathing exercise
                                    </motion.button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTips && (
                    <motion.div
                        className="breathing-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="breathing-content"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <h3>Let's breathe together</h3>
                            <motion.div
                                className="breathing-circle"
                                animate={{
                                    scale: [1, 1.5, 1.5, 1],
                                    opacity: [0.7, 1, 1, 0.7]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 8,
                                    times: [0, 0.25, 0.75, 1]
                                }}
                            />
                            <p className="breathing-instruction">Breathe in... Hold... Breathe out...</p>
                            <motion.button
                                className="close-button"
                                onClick={() => setShowTips(false)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                Close
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
        </>
    );
};

export default SentimentAnalysis;
