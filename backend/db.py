"""
MongoDB Client Connection & Database Module for LearnPulse AI / EduTrack
"""

import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from .config import Config

logger = logging.getLogger(__name__)

_client = None
_db = None

def get_mongo_client():
    global _client
    if _client is None:
        try:
            logger.info(f"Connecting to MongoDB at {Config.MONGO_URI}...")
            _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Trigger server selection to verify connection
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB!")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(f"MongoDB connection warning: {e}. Will attempt lazy reconnection.")
            # Return client anyway so operations can try/catch
            _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=2000)
    return _client

def get_db():
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client.get_database("edutrack")
    return _db

def get_users_collection():
    db = get_db()
    return db["users"]

def is_mongo_connected() -> bool:
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        return True
    except Exception:
        return False
