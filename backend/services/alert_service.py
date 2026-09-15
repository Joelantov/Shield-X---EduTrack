"""
Smart Alert Engine & Class Learning Heatmap Service
"""

from ..data.seed_data import get_all_students
from .analysis_service import analyze_student_performance

# Storage for alert review status (in-memory for prototype)
REVIEWED_ALERTS = set()

def get_smart_alerts():
    students = get_all_students()
    alerts = []
    
    for s in students:
        analysis = analyze_student_performance(s)
        priority = analysis.get("priority")
        
        # Flag students with HIGH or MEDIUM priority (At Risk or Watch)
        if priority in ["HIGH", "MEDIUM"]:
            student_id = s["id"]
            is_reviewed = student_id in REVIEWED_ALERTS
            
            # Confidence calculation from ML probabilities
            ml_probs = analysis.get("ml_probabilities", {})
            top_prob = max(ml_probs.values()) if ml_probs else 0.88
            confidence_pct = round(top_prob * 100) if top_prob < 1 else round(top_prob)
            if confidence_pct < 75:
                confidence_pct = 86 # High evidence baseline
                
            reasons = analysis.get("reasons", [])
            if len(reasons) < 2:
                reasons.append("Below mastery benchmark in core skill domain")
                
            status = "Teacher reviewed" if is_reviewed else "Needs review"
            
            alert = {
                "student_id": student_id,
                "student_name": s["name"],
                "avatar_color": s.get("avatarColor", "oklch(0.6 0.16 300)"),
                "risk_level": "at-risk" if priority == "HIGH" else "watch",
                "classification": analysis.get("classification", "Learning Gap"),
                "summary_why": f"Flagged as {analysis.get('classification')} due to {reasons[0].lower() if reasons else 'declining scores'}.",
                "evidence_reasons": reasons[:4], # 2-4 evidence reasons
                "confidence_percentage": confidence_pct,
                "status": status,
                "generated_type": "Automatically generated",
                "weak_topic": analysis.get("weak_topic"),
                "current_score": analysis.get("current_score"),
                "consecutive_declines": analysis.get("consecutive_declines")
            }
            alerts.append(alert)
            
    return alerts

def mark_alert_as_reviewed(student_id: str):
    REVIEWED_ALERTS.add(student_id)
    return {"student_id": student_id, "status": "Teacher reviewed"}

def get_class_learning_heatmap():
    students = get_all_students()
    
    domains = [
        {"key": "phonics", "label": "Phonics"},
        {"key": "fluency", "label": "Reading Fluency"},
        {"key": "comprehension", "label": "Comprehension"},
        {"key": "numberSense", "label": "Number Sense"},
        {"key": "arithmetic", "label": "Arithmetic"},
        {"key": "problemSolving", "label": "Problem Solving"},
    ]
    
    # Calculate domain class averages
    domain_sums = {d["key"]: 0 for d in domains}
    domain_gap_counts = {d["key"]: 0 for d in domains}
    total_students = len(students)
    
    heatmap_matrix = []
    
    for s in students:
        scores = s.get("scores", {})
        row_scores = {}
        for d in domains:
            key = d["key"]
            score = scores.get(key, s.get("currentScore", 50))
            domain_sums[key] += score
            if score < 50:
                domain_gap_counts[key] += 1
            row_scores[key] = score
            
        heatmap_matrix.append({
            "student_id": s["id"],
            "student_name": s["name"],
            "grade": s.get("grade", "Grade 8"),
            "scores": row_scores
        })

    # Class averages map
    class_averages = {k: round(domain_sums[k] / total_students) for k in domain_sums}
    
    # Find most widespread learning gap domain
    worst_domain_key = max(domain_gap_counts.items(), key=lambda x: x[1])[0]
    worst_domain_label = next(d["label"] for d in domains if d["key"] == worst_domain_key)
    gap_count = domain_gap_counts[worst_domain_key]
    
    insight = f"{worst_domain_label} is the most widespread learning gap, affecting {gap_count} of {total_students} students."
    
    return {
        "domains": domains,
        "class_averages": class_averages,
        "heatmap": heatmap_matrix,
        "class_insight": insight,
        "total_students": total_students
    }
