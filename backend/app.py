"""
Main Application Entry Point for LearnPulse AI Backend
"""

from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes.api import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow requests from local frontend dev ports (e.g. Next.js on 3000, 3001, etc.)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api_bp)

    return app

app = create_app()

if __name__ == "__main__":
    print(f"Starting LearnPulse AI Backend Server on port {Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
