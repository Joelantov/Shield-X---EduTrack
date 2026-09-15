"""
Gap Detector wrapper for loading the trained Random Forest model and running predictions.
"""

import os
import joblib
import pandas as pd
from .train_model import train_and_save_model

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "gap_classifier.joblib")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            try:
                _model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model from {MODEL_PATH}: {e}. Retraining...")
                _model = train_and_save_model()
        else:
            print("Model file not found. Training model now...")
            _model = train_and_save_model()
    return _model

def predict_gap(student_features: dict) -> dict:
    """
    Expects dict with keys:
    - current_score
    - previous_score
    - score_trend
    - assignment_score
    - quiz_score
    - attendance
    - engagement
    - topic_accuracy
    - submission_rate
    - consecutive_declines
    """
    model = get_model()
    
    feature_cols = [
        "current_score", "previous_score", "score_trend",
        "assignment_score", "quiz_score", "attendance",
        "engagement", "topic_accuracy", "submission_rate",
        "consecutive_declines"
    ]
    
    df = pd.DataFrame([student_features])[feature_cols]
    prediction = model.predict(df)[0]
    probabilities = model.predict_proba(df)[0]
    classes = model.classes_
    
    prob_dict = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
    
    return {
        "classification": prediction,
        "probabilities": prob_dict
    }
