"""
Seed Data for LearnPulse AI — PS-05 Early Learning Intervention
Includes primary demonstration student 'Ananya' and class roster students.
"""

STUDENTS_DATA = [
    {
        "id": "s00",
        "name": "Ananya Sharma",
        "grade": "Grade 8",
        "age": 13,
        "subject": "Mathematics",
        "guardian": "Priya Sharma",
        "avatarColor": "oklch(0.65 0.22 27)",
        "currentScore": 43,
        "previousScore": 57,
        "history": [76, 68, 57, 43],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Algebra": 81,
            "Functions": 78,
            "Matrices": 75,
            "Probability": 71,
            "Quadratic Equations": 43
        },
        "weakTopic": "Quadratic Equations",
        "weakTopicAccuracy": 43,
        "detectedDifficulty": "Factorization",
        "errorPatterns": [
            "Incorrect splitting of middle terms in quadratic expressions",
            "Sign errors during factoring (a*c term calculation)",
            "Confusion between roots and factors"
        ],
        "scores": {
            "phonics": 75,
            "fluency": 78,
            "comprehension": 81,
            "numberSense": 71,
            "arithmetic": 68,
            "problemSolving": 43
        },
        "previousScores": {
            "phonics": 76,
            "fluency": 78,
            "comprehension": 80,
            "numberSense": 75,
            "arithmetic": 72,
            "problemSolving": 57
        },
        "signals": {
            "attendance": 88,
            "engagement": 72,
            "homeworkCompletion": 58,
            "submissionRate": 60,
            "assignmentScore": 54,
            "quizScore": 48,
            "isELL": False,
            "weeksTracked": 12,
            "consecutiveDeclines": 3
        },
        "note": "Demonstrates high skill in algebra/matrices, but currently experiencing a persistent struggle with Quadratic Equations (factorization)."
    },
    {
        "id": "s01",
        "name": "Aarav Sharma",
        "grade": "Grade 8",
        "age": 13,
        "subject": "Literacy & Math",
        "guardian": "Meera Sharma",
        "avatarColor": "oklch(0.62 0.19 25)",
        "currentScore": 44,
        "previousScore": 50,
        "history": [62, 55, 50, 44],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": 42,
            "Reading Fluency": 38,
            "Comprehension": 45,
            "Number Sense": 71,
            "Arithmetic": 68,
            "Problem Solving": 64
        },
        "weakTopic": "Reading Fluency",
        "weakTopicAccuracy": 38,
        "detectedDifficulty": "Sound-Blending Speed",
        "errorPatterns": ["Hesitation on multi-syllable vowel digraphs"],
        "scores": {
            "phonics": 42,
            "fluency": 38,
            "comprehension": 45,
            "numberSense": 71,
            "arithmetic": 68,
            "problemSolving": 64
        },
        "previousScores": {
            "phonics": 48,
            "fluency": 46,
            "comprehension": 52,
            "numberSense": 70,
            "arithmetic": 66,
            "problemSolving": 63
        },
        "signals": {
            "attendance": 74,
            "engagement": 58,
            "homeworkCompletion": 61,
            "submissionRate": 65,
            "assignmentScore": 55,
            "quizScore": 52,
            "isELL": True,
            "weeksTracked": 12,
            "consecutiveDeclines": 2
        },
        "note": "Recently moved from another district. Speaks Hindi at home."
    },
    {
        "id": "s02",
        "name": "Sofia Alvarez",
        "grade": "Grade 8",
        "age": 14,
        "subject": "Literacy & Math",
        "guardian": "Luis Alvarez",
        "avatarColor": "oklch(0.6 0.16 300)",
        "currentScore": 87,
        "previousScore": 81,
        "history": [78, 80, 81, 87],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": 88,
            "Reading Fluency": 91,
            "Comprehension": 86,
            "Number Sense": 84,
            "Arithmetic": 82,
            "Problem Solving": 89
        },
        "weakTopic": None,
        "weakTopicAccuracy": 82,
        "detectedDifficulty": None,
        "errorPatterns": [],
        "scores": {
            "phonics": 88,
            "fluency": 91,
            "comprehension": 86,
            "numberSense": 84,
            "arithmetic": 82,
            "problemSolving": 89
        },
        "previousScores": {
            "phonics": 82,
            "fluency": 85,
            "comprehension": 80,
            "numberSense": 79,
            "arithmetic": 78,
            "problemSolving": 83
        },
        "signals": {
            "attendance": 97,
            "engagement": 92,
            "homeworkCompletion": 95,
            "submissionRate": 98,
            "assignmentScore": 90,
            "quizScore": 92,
            "isELL": False,
            "weeksTracked": 12,
            "consecutiveDeclines": 0
        },
        "note": "Consistently ahead of pace. Enjoys reading challenges."
    },
    {
        "id": "s03",
        "name": "Liam O'Connor",
        "grade": "Grade 8",
        "age": 13,
        "subject": "Mathematics",
        "guardian": "Erin O'Connor",
        "avatarColor": "oklch(0.58 0.14 240)",
        "currentScore": 47,
        "previousScore": 49,
        "history": [52, 50, 49, 47],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": 64,
            "Reading Fluency": 61,
            "Comprehension": 58,
            "Number Sense": 41,
            "Arithmetic": 37,
            "Problem Solving": 44
        },
        "weakTopic": "Arithmetic",
        "weakTopicAccuracy": 37,
        "detectedDifficulty": "Timed Math Drills",
        "errorPatterns": ["Pacing anxiety during timed mental math tests"],
        "scores": {
            "phonics": 64,
            "fluency": 61,
            "comprehension": 58,
            "numberSense": 41,
            "arithmetic": 37,
            "problemSolving": 44
        },
        "previousScores": {
            "phonics": 60,
            "fluency": 59,
            "comprehension": 57,
            "numberSense": 45,
            "arithmetic": 43,
            "problemSolving": 48
        },
        "signals": {
            "attendance": 89,
            "engagement": 67,
            "homeworkCompletion": 55,
            "submissionRate": 70,
            "assignmentScore": 58,
            "quizScore": 42,
            "isELL": False,
            "weeksTracked": 12,
            "consecutiveDeclines": 2
        },
        "note": "Strong reader but freezes during timed math tasks."
    },
    {
        "id": "s04",
        "name": "Chen Wei",
        "grade": "Grade 8",
        "age": 14,
        "subject": "Literacy",
        "guardian": "Hua Chen",
        "avatarColor": "oklch(0.6 0.15 160)",
        "currentScore": 67,
        "previousScore": 65,
        "history": [61, 63, 65, 67],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": 55,
            "Reading Fluency": 49,
            "Comprehension": 43,
            "Number Sense": 88,
            "Arithmetic": 90,
            "Problem Solving": 79
        },
        "weakTopic": "Comprehension",
        "weakTopicAccuracy": 43,
        "detectedDifficulty": "Academic Vocabulary",
        "errorPatterns": ["Difficulty mapping idiom meanings"],
        "scores": {
            "phonics": 55,
            "fluency": 49,
            "comprehension": 43,
            "numberSense": 88,
            "arithmetic": 90,
            "problemSolving": 79
        },
        "previousScores": {
            "phonics": 52,
            "fluency": 48,
            "comprehension": 44,
            "numberSense": 85,
            "arithmetic": 86,
            "problemSolving": 77
        },
        "signals": {
            "attendance": 93,
            "engagement": 74,
            "homeworkCompletion": 80,
            "submissionRate": 85,
            "assignmentScore": 72,
            "quizScore": 65,
            "isELL": True,
            "weeksTracked": 12,
            "consecutiveDeclines": 0
        },
        "note": "Excellent numeracy; comprehension limited by vocabulary."
    },
    {
        "id": "s06",
        "name": "Noah Williams",
        "grade": "Grade 8",
        "age": 14,
        "subject": "All Subjects",
        "guardian": "Tanya Williams",
        "avatarColor": "oklch(0.55 0.18 20)",
        "currentScore": 33,
        "previousScore": 40,
        "history": [52, 46, 40, 33],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": 33,
            "Reading Fluency": 29,
            "Comprehension": 31,
            "Number Sense": 39,
            "Arithmetic": 35,
            "Problem Solving": 30
        },
        "weakTopic": "Reading Fluency",
        "weakTopicAccuracy": 29,
        "detectedDifficulty": "Chronic Absences & Engagement",
        "errorPatterns": ["Missed core foundational lessons"],
        "scores": {
            "phonics": 33,
            "fluency": 29,
            "comprehension": 31,
            "numberSense": 39,
            "arithmetic": 35,
            "problemSolving": 30
        },
        "previousScores": {
            "phonics": 40,
            "fluency": 38,
            "comprehension": 39,
            "numberSense": 44,
            "arithmetic": 42,
            "problemSolving": 38
        },
        "signals": {
            "attendance": 61,
            "engagement": 44,
            "homeworkCompletion": 33,
            "submissionRate": 35,
            "assignmentScore": 38,
            "quizScore": 31,
            "isELL": False,
            "weeksTracked": 12,
            "consecutiveDeclines": 3
        },
        "note": "Attendance dropped sharply this term. Needs a home check-in."
    }
]

def get_student_by_id(student_id: str):
    for s in STUDENTS_DATA:
        if s["id"] == student_id:
            return s
    # Default to Ananya if ID matched or s00 requested
    if student_id == "ananya" or student_id == "s00":
        return STUDENTS_DATA[0]
    return None

def get_all_students():
    return STUDENTS_DATA

def add_new_student(data: dict) -> dict:
    # Generate a guaranteed unique ID by finding the max existing numeric ID
    existing_nums = []
    for s in STUDENTS_DATA:
        try:
            existing_nums.append(int(s["id"].lstrip("s")))
        except (ValueError, AttributeError):
            pass
    next_num = max(existing_nums, default=-1) + 1
    new_id = f"s{next_num:02d}"
    
    scores = data.get("scores", {
        "phonics": data.get("phonics", 70),
        "fluency": data.get("fluency", 70),
        "comprehension": data.get("comprehension", 70),
        "numberSense": data.get("numberSense", 70),
        "arithmetic": data.get("arithmetic", 70),
        "problemSolving": data.get("problemSolving", 70)
    })
    
    score_vals = list(scores.values())
    calculated_avg = round(sum(score_vals) / max(1, len(score_vals)))
    current_score = data.get("currentScore", calculated_avg)
    prev_score = data.get("previousScore", current_score + 2)
    
    new_student = {
        "id": new_id,
        "name": data.get("name", "New Student"),
        "grade": data.get("grade", "Grade 8"),
        "age": int(data.get("age", 13)),
        "subject": data.get("subject", "General"),
        "guardian": data.get("guardian", "Guardian"),
        "avatarColor": data.get("avatarColor", "oklch(0.6 0.16 200)"),
        "currentScore": current_score,
        "previousScore": prev_score,
        "history": [prev_score + 4, prev_score + 2, prev_score, current_score],
        "historyDates": ["2026-08-01", "2026-08-15", "2026-09-01", "2026-09-15"],
        "topicPerformance": {
            "Phonics": scores.get("phonics", 70),
            "Reading Fluency": scores.get("fluency", 70),
            "Comprehension": scores.get("comprehension", 70),
            "Number Sense": scores.get("numberSense", 70),
            "Arithmetic": scores.get("arithmetic", 70),
            "Problem Solving": scores.get("problemSolving", 70)
        },
        "weakTopic": data.get("weakTopic", "Problem Solving" if current_score < 60 else None),
        "weakTopicAccuracy": current_score,
        "detectedDifficulty": data.get("detectedDifficulty", "Skill Consolidation"),
        "errorPatterns": [data.get("note", "Initial diagnostic tracking")],
        "scores": scores,
        "previousScores": {k: min(100, v + 3) for k, v in scores.items()},
        "signals": {
            "attendance": int(data.get("attendance", 90)),
            "engagement": int(data.get("engagement", 80)),
            "homeworkCompletion": int(data.get("homeworkCompletion", 85)),
            "submissionRate": 85,
            "assignmentScore": current_score,
            "quizScore": current_score,
            "isELL": bool(data.get("isELL", False)),
            "weeksTracked": 12,
            "consecutiveDeclines": 1 if current_score < prev_score else 0
        },
        "note": data.get("note", "Added by teacher into EduTrack system.")
    }
    
    STUDENTS_DATA.append(new_student)
    return new_student

