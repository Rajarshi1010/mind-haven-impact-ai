// import React, { useState } from 'react';

export default function Welcome() {

  return (
    <>
        <header>
        <div class="logo">MindHaven</div>
            <nav>
                <a href="#">Home</a>
                <a href="#features">Features</a>
                <a href="login">Login</a>
            </nav>
        </header>

        <section class="hero">
            <h1>Welcome to MindHaven</h1>
            <p>Your private space to talk, reflect, and heal. Our AI is here to listen and support you 24/7.</p>
            <a href="loginjs.html">Get Started</a>
        </section>

    <section class="features" id="features">
        <div class="feature-card">
        <h3>🧠 Smart Conversations</h3>
        <p>Our AI understands your emotions and offers calm, empathetic responses to help you feel heard and supported.</p>
        </div>
        <div class="feature-card">
        <h3>🕊️ Always Confidential</h3>
        <p>All your chats stay private and secure. Mental wellness begins with feeling safe and understood.</p>
        </div>
        <div class="feature-card">
        <h3>📅 Mood Tracking</h3>
        <p>Track your emotional journey, understand your patterns, and celebrate your progress every day.</p>
        </div>
    </section>

    <footer>
        © 2025 MindHaven · Built with 💙 for your well-being
    </footer>
  </>

  );
}