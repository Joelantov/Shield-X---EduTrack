"""
Analysis Service for LearnPulse AI
Handles score trend analysis, temporal persistence evaluation, topic gap detection,
ML Random Forest prediction, priority assignment, and evidence-based explainability.
"""

from ..ml.gap_detector import predict_gap

def analyze_student_performance(student: dict) -> dict:
    history = student.get("history", [student.get("currentScore", 50)])
    current_score = student.get("currentScore", history[-1] if history else 50)
    previous_score = student.get("previousScore", history[-2] if len(history) >= 2 else current_score)
    
    # 1. Trend & Temporal Persistence Analysis
    score_trend_delta = current_score - previous_score
    consecutive_declines = 0
    if len(history) >= 2:
        for i in range(len(history) - 1, 0, -1):
            if history[i] < history[i-1]:
                consecutive_declines += 1
            else:
                break
                
    if consecutive_declines >= 3:
        trend = "Declining"
        persistence = "High"
    elif consecutive_declines >= 2:
        trend = "Declining"
        persistence = "Medium"
    elif len(history) >= 3 and history[-2] < history[-3] and history[-1] > history[-2]:
        trend = "Temporary decline"
        persistence = "Low"
    elif score_trend_delta < 0:
        trend = "Slight decline"
        persistence = "Low"
    elif score_trend_delta > 0:
        trend = "Improving"
        persistence = "Low"
    else:
        trend = "Stable"
        persistence = "Low"

    # 2. Topic-Level Gap Detection
    topic_perf = student.get("topicPerformance", {})
    weak_topic = student.get("weakTopic")
    weak_topic_accuracy = student.get("weakTopicAccuracy", 100)
    detected_difficulty = student.get("detectedDifficulty", "General Concept Application")

    if not weak_topic and topic_perf:
        min_topic = min(topic_perf.items(), key=lambda x: x[1])
        weak_topic = min_topic[0]
        weak_topic_accuracy = min_topic[1]
    
    # Identify stable topics to support contrast in explainability
    stable_topics = [t for t, acc in topic_perf.items() if acc >= 70 and t != weak_topic]

    # 3. Random Forest ML Prediction
    signals = student.get("signals", {})
    features = {
        "current_score": float(current_score),
        "previous_score": float(previous_score),
        "score_trend": float(score_trend_delta),
        "assignment_score": float(signals.get("assignmentScore", current_score)),
        "quiz_score": float(signals.get("quizScore", current_score)),
        "attendance": float(signals.get("attendance", 90)),
        "engagement": float(signals.get("engagement", 80)),
        "topic_accuracy": float(weak_topic_accuracy),
        "submission_rate": float(signals.get("submissionRate", 80)),
        "consecutive_declines": int(consecutive_declines)
    }
    
    ml_result = predict_gap(features)
    classification = ml_result["classification"]

    # 4. Intervention Priority Calculation
    if persistence == "High" or classification == "Persistent Gap" or weak_topic_accuracy < 50:
        priority = "HIGH"
    elif persistence == "Medium" or classification == "Emerging Gap" or weak_topic_accuracy < 65:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    # 5. Explainability Evidence ("Why was this flagged?")
    reasons = []
    
    if consecutive_declines > 0:
        reasons.append(f"{consecutive_declines} consecutive performance declines ({' → '.join(map(str, history))})")
    
    if weak_topic and weak_topic_accuracy < 65:
        reasons.append(f"{weak_topic} accuracy is {weak_topic_accuracy}% (below 65% mastery benchmark)")
        
    if detected_difficulty:
        reasons.append(f"Repeated {detected_difficulty.lower()} errors detected in assessments")

    if signals.get("homeworkCompletion", 100) < 65 or signals.get("submissionRate", 100) < 65:
        reasons.append("Independent practice & homework completion rate is declining")
        
    if signals.get("attendance", 100) < 80:
        reasons.append(f"Attendance at {signals['attendance']}% is below instructional threshold")

    if stable_topics:
        reasons.append(f"Other {student.get('subject', 'subject')} topics ({', '.join(stable_topics[:2])}) remain stable")

    return {
        "student_id": student["id"],
        "name": student["name"],
        "subject": student.get("subject", "Mathematics"),
        "history": history,
        "current_score": current_score,
        "previous_score": previous_score,
        "trend": trend,
        "persistence": persistence,
        "consecutive_declines": consecutive_declines,
        "weak_topic": weak_topic,
        "weak_topic_accuracy": weak_topic_accuracy,
        "detected_difficulty": detected_difficulty,
        "error_patterns": student.get("errorPatterns", []),
        "classification": classification,
        "priority": priority,
        "reasons": reasons,
        "ml_probabilities": ml_result["probabilities"]
    }
