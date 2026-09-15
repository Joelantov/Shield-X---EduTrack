"""
REST API Routes Blueprint for LearnPulse AI Backend
"""

from flask import Blueprint, jsonify, request
from ..data.seed_data import get_all_students, get_student_by_id, add_new_student
from ..services.analysis_service import analyze_student_performance
from ..services.intervention_service import (
    get_or_create_intervention,
    record_teacher_decision,
    submit_practice_answers,
    submit_reassessment_answers
)
from ..services.alert_service import get_smart_alerts, mark_alert_as_reviewed, get_class_learning_heatmap
from ..services.copilot_service import answer_copilot_query
from ..services.auth_service import register_user, authenticate_user, seed_default_users
from ..services.ml_service import run_full_model_evaluation, predict_gap

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Seed default users on blueprint initialization
try:
    seed_default_users()
except Exception:
    pass

@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "LearnPulse AI Backend"}), 200

# MONGODB AUTHENTICATION ENDPOINTS
@api_bp.route("/auth/register", methods=["POST"])
def auth_register():
    payload = request.get_json() or {}
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()
    name = payload.get("name", "").strip() or "User"
    role = payload.get("role", "teacher")
    student_id = payload.get("student_id")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = register_user(email, password, name, role, student_id)
        return jsonify({"message": "User registered successfully in MongoDB", "user": user}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Registration error: {str(e)}"}), 500

@api_bp.route("/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json() or {}
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = authenticate_user(email, password)
        return jsonify({"message": "Authentication successful", "user": user}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 401
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500

@api_bp.route("/students", methods=["GET"])
def list_students():
    students = get_all_students()
    return jsonify({"students": students, "total": len(students)}), 200

@api_bp.route("/students", methods=["POST"])
def create_student():
    payload = request.get_json() or {}
    name = payload.get("name", "").strip()
    if not name:
        return jsonify({"error": "Student name is required"}), 400
    new_student = add_new_student(payload)
    return jsonify({"message": "Student created successfully", "student": new_student}), 201

@api_bp.route("/interventions/assign", methods=["POST"])
def assign_intervention():
    payload = request.get_json() or {}
    student_id = payload.get("student_id")
    intervention_id = payload.get("intervention_id")
    intervention_title = payload.get("intervention_title", "Custom Intervention")
    
    if not student_id:
        return jsonify({"error": "student_id is required"}), 400
        
    decision = record_teacher_decision(student_id, "ACCEPT", {
        "assigned_intervention_id": intervention_id,
        "assigned_intervention_title": intervention_title
    })
    return jsonify({
        "message": f"Assigned '{intervention_title}' to student plan",
        "decision": decision
    }), 200

@api_bp.route("/students/<student_id>", methods=["GET"])
def get_student(student_id):
    student = get_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"student": student}), 200


@api_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    students = get_all_students()
    total = len(students)
    if total == 0:
        return jsonify({}), 200
        
    avg_mastery = round(sum(s["currentScore"] for s in students) / total)
    avg_attendance = round(sum(s["signals"]["attendance"] for s in students) / total)
    
    analyzed = [analyze_student_performance(s) for s in students]
    at_risk = sum(1 for a in analyzed if a["priority"] == "HIGH")
    watch = sum(1 for a in analyzed if a["priority"] == "MEDIUM")
    
    return jsonify({
        "totalStudents": total,
        "classMastery": f"{avg_mastery}%",
        "needIntervention": at_risk + watch,
        "atRiskCount": at_risk,
        "watchCount": watch,
        "avgAttendance": f"{avg_attendance}%"
    }), 200

@api_bp.route("/analyze/<student_id>", methods=["GET", "POST"])
def analyze_student(student_id):
    student = get_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    analysis = analyze_student_performance(student)
    return jsonify({"analysis": analysis}), 200

@api_bp.route("/gaps/<student_id>", methods=["GET"])
def get_student_gaps(student_id):
    student = get_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    analysis = analyze_student_performance(student)
    return jsonify({
        "student_id": student_id,
        "weak_topic": analysis["weak_topic"],
        "weak_topic_accuracy": analysis["weak_topic_accuracy"],
        "detected_difficulty": analysis["detected_difficulty"],
        "classification": analysis["classification"],
        "reasons": analysis["reasons"]
    }), 200

# FEATURE 1: Smart Alert Engine Endpoints
@api_bp.route("/alerts", methods=["GET"])
def get_alerts():
    alerts = get_smart_alerts()
    return jsonify({"alerts": alerts, "total": len(alerts)}), 200

@api_bp.route("/alerts/<student_id>/review", methods=["POST"])
def review_alert(student_id):
    result = mark_alert_as_reviewed(student_id)
    return jsonify({"message": "Alert marked as reviewed", "result": result}), 200

# FEATURE 2: Teacher Copilot Endpoint
@api_bp.route("/copilot/ask", methods=["POST"])
def ask_copilot():
    payload = request.get_json() or {}
    question = payload.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question parameter is required"}), 400
    res = answer_copilot_query(question)
    return jsonify(res), 200

# FEATURE 4: Class Learning Heatmap Endpoint
@api_bp.route("/heatmap", methods=["GET"])
def get_heatmap():
    heatmap_data = get_class_learning_heatmap()
    return jsonify(heatmap_data), 200

@api_bp.route("/interventions/<student_id>", methods=["GET", "POST"])
def get_intervention(student_id):
    try:
        record = get_or_create_intervention(student_id)
        return jsonify({"intervention": record}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@api_bp.route("/interventions/<student_id>/accept", methods=["POST"])
def accept_intervention(student_id):
    decision = record_teacher_decision(student_id, "ACCEPT")
    return jsonify({"message": "Intervention accepted by teacher", "decision": decision}), 200

@api_bp.route("/interventions/<student_id>/modify", methods=["POST"])
def modify_intervention(student_id):
    payload = request.get_json() or {}
    decision = record_teacher_decision(student_id, "MODIFY", payload)
    return jsonify({"message": "Intervention modified by teacher", "decision": decision}), 200

@api_bp.route("/interventions/<student_id>/override", methods=["POST"])
def override_intervention(student_id):
    payload = request.get_json() or {}
    decision = record_teacher_decision(student_id, "OVERRIDE", payload)
    return jsonify({"message": "Intervention overridden by teacher", "decision": decision}), 200

@api_bp.route("/practice/<student_id>", methods=["GET"])
def get_practice(student_id):
    try:
        record = get_or_create_intervention(student_id)
        questions = record["plan"].get("practice_questions", [])
        return jsonify({
            "student_id": student_id,
            "questions": questions,
            "hints": record["plan"].get("hints", []),
            "concept_review": record["plan"].get("concept_review", "")
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@api_bp.route("/practice/<student_id>/submit", methods=["POST"])
def submit_practice(student_id):
    payload = request.get_json() or {}
    answers = payload.get("answers", {})
    result = submit_practice_answers(student_id, answers)
    return jsonify({"result": result}), 200

@api_bp.route("/reassessment/<student_id>", methods=["GET"])
def get_reassessment(student_id):
    try:
        record = get_or_create_intervention(student_id)
        questions = record["plan"].get("reassessment_questions", [])
        return jsonify({
            "student_id": student_id,
            "questions": questions
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@api_bp.route("/reassessment/<student_id>/submit", methods=["POST"])
def submit_reassessment(student_id):
    payload = request.get_json() or {}
    answers = payload.get("answers", {})
    result = submit_reassessment_answers(student_id, answers)
    return jsonify({"result": result}), 200

# FEATURE 5: ML Model Analyzer & Inspection Endpoints
@api_bp.route("/ml/evaluation", methods=["GET"])
def get_ml_evaluation():
    eval_results = run_full_model_evaluation()
    return jsonify(eval_results), 200

@api_bp.route("/ml/predict", methods=["POST"])
def predict_ml_student():
    payload = request.get_json() or {}
    result = predict_gap(payload)
    return jsonify(result), 200

