from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json
import requests
from utils import register_utils

# Flask application setup
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Change this to a random string
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///telegram_bot.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)
register_utils(app)

# Database models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    telegram_id = db.Column(db.String(50), unique=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=True)
    username = db.Column(db.String(100), nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    login_count = db.Column(db.Integer, default=1)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    previous_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    birthdays = db.relationship('Birthday', backref='user', lazy=True)

class Birthday(db.Model):
    __tablename__ = 'birthdays'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    birth_date = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Telegram Authentication Helper
class TelegramAuth:
    def __init__(self, bot_id=8036388834):
        self.bot_id = bot_id
    
    def validate_telegram_data(self, auth_data):
        # In a real application, you would validate the authentication data
        # from Telegram here - this is a simplified version
        return True
    
    def process_user_data(self, user_data):
        # Extract user information from Telegram data
        return {
            'telegram_id': str(user_data.get('id')),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'username': user_data.get('username'),
            'photo_url': user_data.get('photo_url')
        }

telegram_auth = TelegramAuth()

# Routes
@app.route('/')
def index():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        user_stats = {
            'loginCount': user.login_count,
            'previousLogin': user.previous_login.isoformat() if user.previous_login else None
        }
        return render_template('index.html', user=user, user_stats=user_stats, is_logged_in=True)
    else:
        return render_template('index.html', is_logged_in=False)

@app.route('/login/telegram')
def telegram_login():
    # In a real app, this would redirect to Telegram's auth page
    # or process the data from the Telegram WebApp
    return render_template('telegram_login.html', bot_id=telegram_auth.bot_id)

@app.route('/auth/callback', methods=['POST'])
def auth_callback():
    auth_data = request.json
    
    if not telegram_auth.validate_telegram_data(auth_data):
        flash('Authentication failed')
        return redirect(url_for('index'))
    
    user_data = telegram_auth.process_user_data(auth_data)
    
    # Check if user exists
    user = User.query.filter_by(telegram_id=user_data['telegram_id']).first()
    
    if user:
        # Update existing user
        user.previous_login = user.last_login
        user.last_login = datetime.utcnow()
        user.login_count += 1
        user.first_name = user_data['first_name']
        user.last_name = user_data['last_name']
        user.username = user_data['username']
        user.photo_url = user_data['photo_url']
    else:
        # Create new user
        user = User(
            telegram_id=user_data['telegram_id'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            username=user_data['username'],
            photo_url=user_data['photo_url']
        )
        db.session.add(user)
    
    db.session.commit()
    session['user_id'] = user.id
    
    return jsonify({'success': True, 'redirect': url_for('index')})

@app.route('/login/demo')
def demo_login():
    # Create a demo user
    demo_user = User.query.filter_by(telegram_id='123456789').first()
    
    if not demo_user:
        demo_user = User(
            telegram_id='123456789',
            first_name='Demo',
            username='demo_user',
            photo_url=None
        )
        db.session.add(demo_user)
        db.session.commit()
    else:
        demo_user.previous_login = demo_user.last_login
        demo_user.last_login = datetime.utcnow()
        demo_user.login_count += 1
        db.session.commit()
    
    session['user_id'] = demo_user.id
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/birthday', methods=['GET', 'POST'])
def birthday_form():
    if 'user_id' not in session:
        return redirect(url_for('index'))
        
    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        name = request.form.get('name')
        birth_date = request.form.get('birthday')
        
        # Check if user already has a birthday saved
        existing_birthday = Birthday.query.filter_by(user_id=user.id).first()
        
        if existing_birthday:
            existing_birthday.birth_date = birth_date
        else:
            birthday = Birthday(user_id=user.id, birth_date=birth_date)
            db.session.add(birthday)
        
        db.session.commit()
        flash('Birthday saved successfully!')
        return redirect(url_for('birthday_success'))
    
    # Check if user already has a birthday entry
    existing_birthday = Birthday.query.filter_by(user_id=user.id).first()
    birth_date = existing_birthday.birth_date if existing_birthday else ''
    
    return render_template('birthday_form.html', user=user, birth_date=birth_date)

@app.route('/birthday/success')
def birthday_success():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    user = User.query.get(session['user_id'])
    return render_template('birthday_success.html', user=user)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
