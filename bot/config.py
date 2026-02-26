"""
ChatBot24 Studio - Bot Configuration
"""
import os
from dataclasses import dataclass


@dataclass
class Config:
    """Bot configuration"""
    # Telegram
    BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    ADMIN_ID: int = int(os.getenv("TELEGRAM_ADMIN_ID", "0"))
    
    # Database (Supabase)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Analytics
    GA4_MEASUREMENT_ID: str = os.getenv("GA4_MEASUREMENT_ID", "")
    YM_COUNTER_ID: str = os.getenv("YM_COUNTER_ID", "")
    
    # Bot Settings
    TYPING_DELAY: float = 0.3  # seconds
    REMINDER_HOURS: int = 24
    RATE_LIMIT: int = 10  # requests per minute
    
    # Lead Scoring
    SCORE_HOT: int = 80
    SCORE_WARM: int = 50
    
    # URLs
    SITE_URL: str = "https://www.chatbot24.su"
    BRIEF_URL: str = "https://www.chatbot24.su/brief"
    CASES_URL: str = "https://www.chatbot24.su/cases"
    CAREER_URL: str = "https://www.chatbot24.su/career"


config = Config()
