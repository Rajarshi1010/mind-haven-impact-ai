import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MoodTracker = ({ userId, onMoodSubmitted }) => {
    const [moodScore, setMoodScore] = useState(3);
    const [moodNote, setMoodNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const moodEmojis = ['😞', '😔', '😐', '🙂', '😊'];
    const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

    const handleSubmit = async () => {
        if (!userId) return;

        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/mood/add', {
                user_id: userId,
                mood_score: moodScore,
                mood_note: moodNote
            });

            setSubmitted(true);
            setMoodNote('');
            if (onMoodSubmitted) onMoodSubmitted();

            // Reset submission state after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting mood:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="mood-tracker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2>How are you feeling today?</h2>

            <div className="mood-slider-container">
                <div className="mood-emoji">
                    {moodEmojis[moodScore - 1]}
                </div>

                <div className="mood-label">
                    {moodLabels[moodScore - 1]}
                </div>

                <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="mood-slider"
                />

                <div className="mood-scale">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
            </div>

            <div className="mood-note-container">
        <textarea
            placeholder="What's contributing to your mood today? (optional)"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            className="mood-note"
            rows={3}
        />
            </div>

            <motion.button
                className="submit-mood-button"
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {submitting ? 'Submitting...' : 'Log My Mood'}
            </motion.button>

            {submitted && (
                <motion.div
                    className="success-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    Mood successfully logged!
                </motion.div>
            )}
        </motion.div>
    );
};

export default MoodTracker;