
from flask import Blueprint, current_app
from datetime import datetime, timezone
import math

utils_bp = Blueprint('utils', __name__)

@utils_bp.app_template_filter('timesince')
def timesince_filter(timestamp_str):
    """
    Format a timestamp as a string representing time passed since that time.
    Similar to Django's timesince filter.
    """
    if not timestamp_str:
        return ""
    
    try:
        if isinstance(timestamp_str, str):
            timestamp = datetime.fromisoformat(timestamp_str)
        else:
            timestamp = timestamp_str
            
        now = datetime.now(timezone.utc)
        
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
            
        delta = now - timestamp
        
        seconds = delta.total_seconds()
        minutes = math.floor(seconds / 60)
        
        if minutes < 1:
            return "менее минуты"
        elif minutes == 1:
            return "минуту"
        elif minutes < 5:
            return f"{minutes} минуты"
        elif minutes < 60:
            return f"{minutes} минут"
            
        hours = math.floor(minutes / 60)
        if hours == 1:
            return "час"
        elif hours < 5:
            return f"{hours} часа"
        elif hours < 24:
            return f"{hours} часов"
            
        days = math.floor(hours / 24)
        if days == 1:
            return "день"
        elif days < 5:
            return f"{days} дня"
        elif days < 30:
            return f"{days} дней"
            
        months = math.floor(days / 30)
        if months == 1:
            return "месяц"
        elif months < 5:
            return f"{months} месяца" 
        elif months < 12:
            return f"{months} месяцев"
            
        years = math.floor(days / 365)
        if years == 1:
            return "год"
        elif years < 5:
            return f"{years} года"
        else:
            return f"{years} лет"
            
    except Exception as e:
        current_app.logger.error(f"Error formatting timestamp: {e}")
        return ""

def register_utils(app):
    app.register_blueprint(utils_bp)
