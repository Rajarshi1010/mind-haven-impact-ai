import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MoodInsights = ({ userId }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState(30); // Default to 30 days

    useEffect(() => {
        if (userId) {
            fetchInsights();
        }
    }, [userId, timeframe]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/insights?user_id=${userId}&days=${timeframe}`);
            setInsights(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching insights:", error);
            setError(error.response?.data?.error || "Failed to load insights");
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
                <a href=''>Community</a>
                <a href='/insight'>Insights</a>
                <a href='/'>Logout</a>
            </nav>
        </header>
        <motion.div
            className="mood-insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <h2>Your Mood Insights</h2>
            <p className="subtitle">Understanding your emotional patterns</p>

            <div className="timeframe-selector">
                <button
                    className={timeframe === 7 ? 'active' : ''}
                    onClick={() => setTimeframe(7)}>
                    Past Week
                </button>
                <button
                    className={timeframe === 30 ? 'active' : ''}
                    onClick={() => setTimeframe(30)}>
                    Past Month
                </button>
                <button
                    className={timeframe === 90 ? 'active' : ''}
                    onClick={() => setTimeframe(90)}>
                    Past 3 Months
                </button>
            </div>

            {loading && (
                <div className="loading-container">
                    <motion.div
                        className="loading-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <p>Analyzing your mood patterns...</p>
                </div>
            )}

            {error && (
                <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p>{error}</p>
                    <button onClick={fetchInsights}>Try Again</button>
                </motion.div>
            )}

            {insights && !loading && !error && (
                <>
                    <motion.div
                        className="insights-overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="overview-card">
                            <h3>Average Mood</h3>
                            <p className="overview-number">{insights.mood_insights.average_mood}</p>
                            <p className="overview-description">out of 5</p>
                        </div>

                        <div className="overview-card">
                            <h3>Mood Trend</h3>
                            <p className="overview-trend">{insights.mood_insights.mood_trend}</p>
                        </div>

                        <div className="overview-card">
                            <h3>Sentiment</h3>
                            <p className="overview-sentiment">{insights.sentiment_insights.sentiment_interpretation}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="mood-graph-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>Mood Over Time</h3>
                        {insights.mood_insights.mood_graph ? (
                            <div className="mood-graph">
                                <img
                                    src={`data:image/png;base64,${insights.mood_insights.mood_graph}`}
                                    alt="Mood Trend Graph"
                                />
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>Not enough mood data to generate a graph. Try logging your mood daily.</p>
                            </div>
                        )}
                    </motion.div>

                    {insights.pattern_analysis.potential_triggers.length > 0 && (
                        <motion.div
                            className="triggers-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3>Potential Mood Triggers</h3>
                            <div className="triggers-list">
                                {insights.pattern_analysis.potential_triggers.map((trigger, index) => (
                                    <div key={index} className="trigger-item">{trigger}</div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        className="recommendations-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3>Personalized Recommendations</h3>
                        <div className="recommendations-list">
                            {insights.recommendations.map((recommendation, index) => (
                                <motion.div
                                    key={index}
                                    className="recommendation-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <p>{recommendation}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
        </>
    );
};

export default MoodInsights;
