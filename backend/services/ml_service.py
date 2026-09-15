"""
ML Model Evaluation and Inspection Service for LearnPulse AI
Uses the project's trained Random Forest Classifier (gap_classifier.joblib)
to compute model accuracy, feature importances, confusion matrix, and sample batch evaluations.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from ..ml.gap_detector import get_model, predict_gap
from ..ml.train_model import generate_synthetic_training_data

def get_ml_model_details():
    """Returns model architecture, hyperparameters, and feature importance rankings."""
    model = get_model()
    
    feature_names = [
        "current_score", "previous_score", "score_trend",
        "assignment_score", "quiz_score", "attendance",
        "engagement", "topic_accuracy", "submission_rate",
        "consecutive_declines"
    ]
    
    importances = getattr(model, "feature_importances_", [0.1] * len(feature_names))
    feature_importance_list = sorted(
        [{"feature": name, "importance": round(float(imp) * 100, 2)} for name, imp in zip(feature_names, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )

    hyperparameters = {
        "model_type": "RandomForestClassifier",
        "n_estimators": getattr(model, "n_estimators", 100),
        "max_depth": getattr(model, "max_depth", 6),
        "class_weight": str(getattr(model, "class_weight", "balanced")),
        "random_state": getattr(model, "random_state", 42),
        "n_features": len(feature_names),
        "classes": [str(c) for c in getattr(model, "classes_", ["Emerging Gap", "Persistent Gap", "Stable"])]
    }

    return {
        "hyperparameters": hyperparameters,
        "feature_importances": feature_importance_list
    }

def run_full_model_evaluation(n_test_samples=300):
    """
    Generates a realistic test dataset, runs batch predictions with the project's ML model,
    and returns comprehensive metrics: Accuracy, Precision, Recall, F1, Confusion Matrix, and Sample Data.
    """
    model = get_model()
    test_df = generate_synthetic_training_data(n_samples=n_test_samples, seed=123)

    feature_cols = [
        "current_score", "previous_score", "score_trend",
        "assignment_score", "quiz_score", "attendance",
        "engagement", "topic_accuracy", "submission_rate",
        "consecutive_declines"
    ]

    X_test = test_df[feature_cols]
    y_true = test_df["label"]

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)
    classes = [str(c) for c in model.classes_]

    acc = float(accuracy_score(y_true, y_pred))
    precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred, labels=classes, zero_division=0)

    cm = confusion_matrix(y_true, y_pred, labels=classes)

    class_metrics = {}
    for idx, cls_name in enumerate(classes):
        class_metrics[cls_name] = {
            "precision": round(float(precision[idx]) * 100, 2),
            "recall": round(float(recall[idx]) * 100, 2),
            "f1_score": round(float(f1[idx]) * 100, 2),
            "support": int(support[idx])
        }

    # Format confusion matrix for UI display
    matrix_formatted = []
    for r_idx, true_label in enumerate(classes):
        row_data = {"true_label": true_label}
        for c_idx, pred_label in enumerate(classes):
            row_data[pred_label] = int(cm[r_idx][c_idx])
        matrix_formatted.append(row_data)

    # Prepare sample records for interactive auto-feed evaluation
    sample_records = []
    for i in range(min(15, len(test_df))):
        rec = test_df.iloc[i].to_dict()
        feat_dict = {col: round(float(rec[col]), 1) if isinstance(rec[col], float) else int(rec[col]) for col in feature_cols}
        probs = {cls: round(float(prob) * 100, 1) for cls, prob in zip(classes, y_proba[i])}
        sample_records.append({
            "sample_id": f"sample_{i+1:02d}",
            "features": feat_dict,
            "ground_truth": rec["label"],
            "prediction": str(y_pred[i]),
            "probabilities": probs,
            "is_correct": bool(rec["label"] == y_pred[i])
        })

    model_details = get_ml_model_details()

    return {
        "accuracy": round(acc * 100, 2),
        "total_test_samples": n_test_samples,
        "classes": classes,
        "class_metrics": class_metrics,
        "confusion_matrix": matrix_formatted,
        "feature_importances": model_details["feature_importances"],
        "hyperparameters": model_details["hyperparameters"],
        "sample_records": sample_records
    }
