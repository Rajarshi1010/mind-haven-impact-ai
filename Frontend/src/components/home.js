export default function Home() {
    const moodChart = new Chart(document.getElementById('moodChart'), {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Mood Score',
            data: [1, 3, 0, 3, 1, 1, 0],
            fill: true,
            borderColor: '#a364c7',
            backgroundColor: 'rgba(163, 100, 199, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#a364c7',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
  
      function submitMood() {
        const mood = document.getElementById('mood').value;
        const response = document.getElementById('moodResponse');
        response.innerText = `You are feeling ${mood} today. Be kind to yourself 💜`;
        localStorage.setItem('todayMood', mood);
      }
  
      function showSavedMood() {
        const saved = localStorage.getItem('todayMood');
        if (saved) {
          document.getElementById('moodResponse').innerText = `You previously felt ${saved} today.`;
        }
      }
  
      function loadQuote() {
        const quotes = [
          "Take time to make your soul happy.",
          "Every day may not be good, but there is good in every day.",
          "Your mental health matters.",
          "It's okay not to be okay.",
          "Self-care is how you take your power back."
        ];
        const quoteBox = document.getElementById('quoteBox');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteBox.innerText = `"${randomQuote}"`;
      }
  
      window.onload = () => {
        showSavedMood();
        loadQuote();
      };
    return (
        <>
            <div class="container">
                <div class="top-section">
                <div class="chart-section">
                    <h2>Progress & Mood Chart</h2>
                    <canvas id="moodChart" width="400" height="300"></canvas>
                </div>

                <div class="mood-section">
                    <h2>Today's Mood</h2>
                    <div class="mood-input">
                    <label for="mood">How are you feeling?</label>
                    <select id="mood">
                        <option value="😊">Happy</option>
                        <option value="😔">Sad</option>
                        <option value="😠">Angry</option>
                        <option value="😌">Calm</option>
                        <option value="😕">Confused</option>
                    </select>
                    <button onclick="submitMood()">Submit</button>
                    <p id="moodResponse"></p>
                    </div>
                </div>
                </div>

                <div class="features-box">
                <h2>Dashboard Features</h2>
                <div class="features-grid">
                    <div class="feature-card">🧠 Daily Mood Tracker</div>
                    <div class="feature-card">📊 Weekly Mood Graph</div>
                    <div class="feature-card">💬 Inspirational Quotes</div>
                    <div class="feature-card">🔐 Secure Login</div>
                    <div class="feature-card">📝 Journaling Support</div>
                </div>
                <div class="quote-box" id="quoteBox">Loading a daily quote...</div>
                </div>
            </div>
        </>
    );
}