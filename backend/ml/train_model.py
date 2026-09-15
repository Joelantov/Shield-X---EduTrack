"""
Train Random Forest Classifier for LearnPulse AI Learning Gap Detection
Outputs: 'Stable', 'Emerging Gap', 'Persistent Gap'
Saves trained model to backend/models/gap_classifier.joblib
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

def generate_synthetic_training_data(n_samples=1000, seed=42):
    np.random.seed(seed)
    
    current_scores = np.random.uniform(30, 95, n_samples)
    previous_scores = current_scores + np.random.uniform(-20, 15, n_samples)
    score_trends = current_scores - previous_scores
    assignment_scores = current_scores + np.random.uniform(-10, 10, n_samples)
    quiz_scores = current_scores + np.random.uniform(-10, 10, n_samples)
    attendances = np.random.uniform(50, 100, n_samples)
    engagements = np.random.uniform(40, 100, n_samples)
    topic_accuracies = current_scores + np.random.uniform(-15, 10, n_samples)
    submission_rates = np.random.uniform(30, 100, n_samples)
    consecutive_declines = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.4, 0.25, 0.15, 0.1, 0.1])
    
    labels = []
    for i in range(n_samples):
        cs = current_scores[i]
        st = score_trends[i]
        cd = consecutive_declines[i]
        ta = topic_accuracies[i]
        att = attendances[i]
        
        # Classification rules for synthetic ground truth:
        if (cd >= 2 and st < -8) or (cs < 55 and cd >= 2) or (ta < 50 and cd >= 2):
            labels.append("Persistent Gap")
        elif (st < -3 or cs < 65 or cd == 1 or ta < 60 or att < 80):
            labels.append("Emerging Gap")
        else:
            labels.append("Stable")
            
    df = pd.DataFrame({
        "current_score": current_scores,
        "previous_score": previous_scores,
        "score_trend": score_trends,
        "assignment_score": assignment_scores,
        "quiz_score": quiz_scores,
        "attendance": attendances,
        "engagement": engagements,
        "topic_accuracy": topic_accuracies,
        "submission_rate": submission_rates,
        "consecutive_declines": consecutive_declines,
        "label": labels
    })
    return df

def train_and_save_model():
    df = generate_synthetic_training_data(n_samples=1500)
    
    feature_cols = [
        "current_score", "previous_score", "score_trend",
        "assignment_score", "quiz_score", "attendance",
        "engagement", "topic_accuracy", "submission_rate",
        "consecutive_declines"
    ]
    
    X = df[feature_cols]
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight="balanced"
    )
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    print("Model Training Accuracy & Performance:")
    print(classification_report(y_test, y_pred))
    
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "gap_classifier.joblib")
    
    joblib.dump(rf, model_path)
    print(f"Model saved successfully to: {model_path}")
    return rf

if __name__ == "__main__":
    train_and_save_model()
