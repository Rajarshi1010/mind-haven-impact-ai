from flask import Flask, render_template, jsonify, request, session, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from transformers import pipeline
import torch
import os
import logging
import warnings
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import google.generativeai as genai
import json
import requests
from werkzeug.security import generate_password_hash, check_password_hash   
from datetime import datetime, timedelta
from pytz import timezone as tz
from textblob import TextBlob
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from dotenv import load_dotenv

"""CONFIGURATIONS START"""

with open("emoji.json", "r", encoding="utf-8") as f:
    emoji_data = json.load(f)
    emoji_map = emoji_data["emoji_map"]
SCOPES = ['https://www.googleapis.com/auth/generative-language.retriever']
CLIENT_SECRET_FILE = 'client_secret.json' 
TOKEN_PATH = 'token.json'
creds = None
if os.path.exists(TOKEN_PATH):
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            CLIENT_SECRET_FILE, SCOPES)
        creds = flow.run_local_server(port=0)
    with open(TOKEN_PATH, 'w') as token:
        token.write(creds.to_json())

genai.configure(credentials=creds)
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 65536,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="tunedModels/mental-health-support-bot-fw2wepyaupsv",
    generation_config=generation_config,
)
chat_session = model.start_chat(
    history=[]
)

warnings.filterwarnings('ignore')
logging.getLogger('tensorflow').setLevel(logging.ERROR)

device = 0 if torch.cuda.is_available() else -1
classifier = pipeline(
    task="text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None,
    device=device,
    batch_size=8
)
classifier.model = classifier.model.eval()
if device == 0:
    classifier.model = classifier.model.to('cuda')
project_id = "mind-haven-456106"
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200))

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), db.ForeignKey('user.username'), nullable=False)
    conversation_id = db.Column(db.Integer, nullable=False)  # new column for convo grouping
    user_message = db.Column(db.Text, nullable=False)
    bot_reply = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now(tz('Asia/Kolkata')))

class MoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    mood_score = db.Column(db.Integer, nullable=False)  # 1-5 scale
    mood_note = db.Column(db.Text, nullable=True)  # Optional note about mood
    sentiment = db.Column(db.Float, nullable=True)  # Sentiment score from TextBlob
    timestamp = db.Column(db.DateTime, default=datetime.now(tz('Asia/Kolkata')))
    
load_dotenv()
access_token = os.getenv("ACCESS_TOKEN")

with app.app_context():
    db.create_all()

matplotlib.use('Agg') 
import base64
from io import BytesIO

"""CONFIGURATIONS END"""

@app.route("/get_response", methods=["POST"])
def get_response():
    data = request.json
    user_message = data.get("text", "")
    username = data.get("username", "")
    conversation_id = data.get("conversationId", "")
    if not username or not user_message or not conversation_id:
        return jsonify({'message': 'Missing username, message or conversationID'}), 400

    response = chat_session.send_message(user_message)

    chat_entry = ChatHistory(
        username=username,
        conversation_id=conversation_id,
        user_message=user_message,
        bot_reply=response.text
    )

    db.session.add(chat_entry)
    db.session.commit()
    model_outputs = classifier(user_message)
    top_emotion = max(model_outputs[0], key=lambda x: x['score'])['label']
    emoji_emotion = emoji_map.get(top_emotion, f"{top_emotion}")

    return jsonify({'response': response.text,
                    'emotion': emoji_emotion}), 200


@app.route("/get_emotion", methods=["POST"])
def emotion():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    model_outputs = classifier(text)
    top_emotion = max(model_outputs[0], key=lambda x: x['score'])['label']
    emoji_emotion = emoji_map.get(top_emotion, f"{top_emotion}")

    return jsonify({"emotion": emoji_emotion})

@app.route('/chat_history/<username>', methods=['GET'])
def get_chat_history(username):
    # Remove quotes if the username has them
    if username.startswith('"') and username.endswith('"'):
        username = username[1:-1]
    
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Fetch all chats of that user ordered by conversation_id & timestamp
    chats = chats = ChatHistory.query.all()
    history = {}

    for chat in chats:
        convo_id = chat.conversation_id
        if convo_id not in history:
            history[convo_id] = []  # new conversation starts here

        history[convo_id].append({
            'user_message': chat.user_message.encode().decode('unicode_escape'),
            'bot_reply': chat.bot_reply,
            'time': chat.timestamp.strftime("%d-%m-%Y %H:%M:%S")
        })

    return jsonify({
        'username': user.username,
        'chat_history': history
    })

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        hashed_password = generate_password_hash(data['password'])
        user = User(username=data['email'], password=hashed_password, name = data['fullName'])
        
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully!'})
    except Exception as e:
        return jsonify({'error': f'Error: {e}'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful'})
    return jsonify({'message': 'Invalid credentials'}), 401

def text_to_speech(text):
    try:
        url = "https://texttospeech.googleapis.com/v1/text:synthesize"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "x-goog-user-project": project_id,
            "Content-Type": "application/json; charset=utf-8",
        }
        data = {
            "input": {"text": text},
            "voice": {"languageCode": "en-US", "name": "en-US-Chirp-HD-F", "ssmlGender": "FEMALE"},
            "audioConfig": {"audioEncoding": "MP3"},
        }
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status() 
        response_data = response.json()
        audio_content = response_data.get("audioContent")
        return audio_content

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.json.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Use TextBlob for sentiment analysis
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity

    # Map TextBlob's sentiment range (-1 to 1) to your sentiment labels
    if sentiment_score > 0.05:
        sentiment_label = "POSITIVE"
    elif sentiment_score < -0.05:
        sentiment_label = "NEGATIVE"
    else:
        sentiment_label = "NEUTRAL"

    return jsonify({"sentiment": sentiment_label, "confidence": abs(sentiment_score)})

@app.route('/mood/add', methods=['POST'])
def add_mood():
    data = request.json

    # Validate required fields
    if not all(key in data for key in ['user_id', 'mood_score']):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate mood score range
    if not 1 <= data['mood_score'] <= 5:
        return jsonify({"error": "Mood score must be between 1-5"}), 400

    # Analyze sentiment if mood note is provided
    sentiment = None
    if 'mood_note' in data and data['mood_note']:
        blob = TextBlob(data['mood_note'])
        sentiment = blob.sentiment.polarity

    # Create new mood entry
    new_mood = MoodEntry(
        user_id=data['user_id'],
        mood_score=data['mood_score'],
        mood_note=data.get('mood_note', ''),
        sentiment=sentiment
    )

    db.session.add(new_mood)
    db.session.commit()

    return jsonify({"status": "success", "id": new_mood.id}), 201


@app.route('/mood/history', methods=['GET'])
def get_mood_history():
    user_id = request.args.get('user_id')
    days = int(request.args.get('days', 30))  # Default to 30 days

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    # Get mood entries for the specified time period
    start_date = datetime.now(tz('Asia/Kolkata')) - timedelta(days=days)
    entries = MoodEntry.query.filter(
        MoodEntry.user_id == user_id,
        MoodEntry.timestamp >= start_date
    ).order_by(MoodEntry.timestamp).all()

    # Format entries for response
    history = []
    for entry in entries:
        history.append({
            "id": entry.id,
            "mood_score": entry.mood_score,
            "mood_note": entry.mood_note,
            "sentiment": entry.sentiment,
            "timestamp": entry.timestamp.isoformat()
        })

    return jsonify(history)


@app.route('/insights', methods=['GET'])
def get_insights():
    user_id = request.args.get('user_id')
    days = int(request.args.get('days', 30))  # Default to 30 days

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    # Get data for the specified time period
    start_date = datetime.now(tz('Asia/Kolkata')) - timedelta(days=days)

    # Get mood data
    mood_entries = MoodEntry.query.filter(
        MoodEntry.user_id == user_id,
        MoodEntry.timestamp >= start_date
    ).order_by(MoodEntry.timestamp).all()

    # If no data is available
    if not mood_entries:
        return jsonify({"error": "No data available for insights"}), 404

    # Prepare data for analysis
    mood_scores = [entry.mood_score for entry in mood_entries]
    mood_timestamps = [entry.timestamp for entry in mood_entries]
    mood_sentiments = [entry.sentiment for entry in mood_entries if entry.sentiment is not None]

    # Calculate mood statistics
    avg_mood = np.mean(mood_scores) if mood_scores else 0
    mood_trend = "improving" if len(mood_scores) > 1 and mood_scores[-1] > mood_scores[0] else "declining" if len(
        mood_scores) > 1 and mood_scores[-1] < mood_scores[0] else "stable"

    # Calculate sentiment statistics
    avg_sentiment = np.mean(mood_sentiments) if mood_sentiments else 0

    # Generate mood trend graph
    if len(mood_scores) > 1:
        plt.figure(figsize=(10, 6))
        plt.plot(mood_timestamps, mood_scores, 'o-', color='#5bb3c9')
        plt.title('Mood Trend Over Time')
        plt.xlabel('Date')
        plt.ylabel('Mood Score (1-5)')
        plt.ylim(0.5, 5.5)
        plt.grid(True, alpha=0.3)

        # Save plot to base64 string
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        mood_graph = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
    else:
        mood_graph = None

    # Analyze mood patterns
    if len(mood_scores) > 3:
        # Identify potential mood triggers from notes
        triggers = []
        for i in range(len(mood_entries)):
            if i > 0 and mood_entries[i].mood_score < mood_entries[i - 1].mood_score and mood_entries[i].mood_note:
                triggers.append(mood_entries[i].mood_note)

        # Get most common words in triggers (simplified approach)
        common_triggers = []
        if triggers:
            all_words = " ".join(triggers).lower().split()
            from collections import Counter
            word_counts = Counter(all_words)
            # Filter out common stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about'}
            common_triggers = [word for word, count in word_counts.most_common(5) if
                               word not in stop_words and len(word) > 3]
    else:
        common_triggers = []

    # Create personalized recommendations based on mood
    recommendations = []

    if avg_mood < 3:
        recommendations.append("Your mood has been low lately. Consider trying our guided meditation exercises.")
        recommendations.append("Regular physical activity can help improve your mood. Try a short walk outside.")

    if avg_sentiment < -0.1:
        recommendations.append(
            "Your mood notes show negative sentiment. Try practicing gratitude by noting three positive things each day.")

    if mood_trend == "declining":
        recommendations.append("Your mood appears to be declining. Consider connecting with a friend or loved one.")

    # Generate consolidated insights
    insights = {
        "mood_insights": {
            "average_mood": round(avg_mood, 1),
            "mood_trend": mood_trend,
            "entries_count": len(mood_scores),
            "mood_graph": mood_graph
        },
        "sentiment_insights": {
            "average_sentiment": round(avg_sentiment, 2),
            "sentiment_interpretation": "positive" if avg_sentiment > 0.05 else "negative" if avg_sentiment < -0.05 else "neutral",
            "entries_analyzed": len(mood_sentiments)
        },
        "pattern_analysis": {
            "potential_triggers": common_triggers[:3],  # Limit to top 3 triggers
            "best_day_of_week": "Monday"  # Placeholder - you can calculate this from actual data
        },
        "recommendations": recommendations if recommendations else [
            "Keep tracking your mood to receive personalized recommendations."]
    }

    return jsonify(insights)


if __name__ == "__main__":
    app.run(port=5000, use_reloader=False, debug=True)

