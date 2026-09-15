"""
User Authentication & MongoDB Management Service for LearnPulse AI / EduTrack
"""

import logging
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from ..db import get_users_collection, is_mongo_connected

logger = logging.getLogger(__name__)

# Fallback in-memory user store if MongoDB is offline during local dev
IN_MEMORY_USERS = {
    "rivera@edutrack.school": {
        "email": "rivera@edutrack.school",
        "password_hash": generate_password_hash("demo1234"),
        "name": "Ms. Rivera",
        "role": "teacher",
        "student_id": None,
        "created_at": datetime.utcnow().isoformat()
    },
    "ananya@edutrack.school": {
        "email": "ananya@edutrack.school",
        "password_hash": generate_password_hash("demo1234"),
        "name": "Ananya Sharma",
        "role": "student",
        "student_id": "s00",
        "created_at": datetime.utcnow().isoformat()
    }
}

def seed_default_users():
    """Seeds default demo accounts into MongoDB if users collection is empty."""
    try:
        users_col = get_users_collection()
        if users_col.count_documents({}) == 0:
            logger.info("Seeding default demo users into MongoDB...")
            default_accounts = [
                {
                    "email": "rivera@edutrack.school",
                    "password_hash": generate_password_hash("demo1234"),
                    "name": "Ms. Rivera",
                    "role": "teacher",
                    "student_id": None,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "email": "ananya@edutrack.school",
                    "password_hash": generate_password_hash("demo1234"),
                    "name": "Ananya Sharma",
                    "role": "student",
                    "student_id": "s00",
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "email": "aarav@edutrack.school",
                    "password_hash": generate_password_hash("demo1234"),
                    "name": "Aarav Sharma",
                    "role": "student",
                    "student_id": "s01",
                    "created_at": datetime.utcnow().isoformat()
                }
            ]
            users_col.insert_many(default_accounts)
            logger.info("Default users successfully seeded into MongoDB.")
    except Exception as e:
        logger.warning(f"Unable to seed MongoDB default users: {e}")

def register_user(email: str, password: str, name: str, role: str = "teacher", student_id: str = None) -> dict:
    email_clean = email.strip().lower()
    if not email_clean or not password:
        raise ValueError("Email and password are required")

    password_hash = generate_password_hash(password)
    user_doc = {
        "email": email_clean,
        "password_hash": password_hash,
        "name": name.strip(),
        "role": role,
        "student_id": student_id,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        users_col = get_users_collection()
        existing = users_col.find_one({"email": email_clean})
        if existing:
            raise ValueError(f"User with email '{email_clean}' already exists in database")

        res = users_col.insert_one(user_doc)
        user_doc["_id"] = str(res.inserted_id)
        user_doc.pop("password_hash", None)
        return user_doc
    except Exception as e:
        logger.warning(f"MongoDB register failed/offline ({e}), using in-memory store fallback.")
        if email_clean in IN_MEMORY_USERS:
            raise ValueError(f"User with email '{email_clean}' already exists")
        IN_MEMORY_USERS[email_clean] = user_doc
        res_doc = dict(user_doc)
        res_doc.pop("password_hash", None)
        return res_doc

def authenticate_user(email: str, password: str) -> dict:
    email_clean = email.strip().lower()
    
    try:
        users_col = get_users_collection()
        user = users_col.find_one({"email": email_clean})
        if user:
            if check_password_hash(user["password_hash"], password):
                user["_id"] = str(user["_id"])
                user.pop("password_hash", None)
                return user
            else:
                raise ValueError("Invalid password")
    except ValueError as ve:
        raise ve
    except Exception as e:
        logger.warning(f"MongoDB auth lookup failed ({e}), checking in-memory fallback.")

    # Fallback to in-memory store
    user = IN_MEMORY_USERS.get(email_clean)
    if user and check_password_hash(user["password_hash"], password):
        res_doc = dict(user)
        res_doc.pop("password_hash", None)
        return res_doc

    raise ValueError("Invalid email or password")
