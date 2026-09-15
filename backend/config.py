import os
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

class Config:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    PORT = int(os.environ.get("FLASK_PORT", 5000))
    DEBUG = os.environ.get("FLASK_ENV", "development") == "development"
