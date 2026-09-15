"""
Gemini Service for LearnPulse AI
Uses the official google-genai Python SDK to generate structured, personalized learning interventions.
Exclusively accepts ML/analytics structured context and outputs valid JSON.
Includes safe backend fallback if GEMINI_API_KEY is missing or API request fails.
"""

import json
import logging
from ..config import Config

logger = logging.getLogger(__name__)

# Fallback response structured JSON for Quadratic Equations / Factorization (Ananya & general fallback)
FALLBACK_INTERVENTION = {
    "explanation": "Ananya shows strong overall mathematical aptitude in algebra and matrices, but has encountered a persistent difficulty specifically in factoring quadratic equations. Her scores declined from 76% to 43% across 3 consecutive assessments.",
    "concept_review": "A quadratic equation is in the form ax² + bx + c = 0. Factoring involves finding two binomials (x + p)(x + q) such that p + q = b and p * q = c (when a = 1). When a > 1, we split the middle term bx into two terms whose coefficients multiply to a*c and sum to b.",
    "worked_example": {
        "problem": "Factor the quadratic equation: x² + 7x + 12 = 0",
        "steps": [
            "Step 1: Identify coefficients a = 1, b = 7, c = 12.",
            "Step 2: Find two numbers that multiply to 12 and add up to 7. The factors of 12 are (1,12), (2,6), (3,4). Note that 3 + 4 = 7.",
            "Step 3: Rewrite as (x + 3)(x + 4) = 0.",
            "Step 4: Solve for roots by setting each factor to zero: x = -3 or x = -4."
        ]
    },
    "intervention_steps": [
        "Review middle-term splitting rules using visual area models.",
        "Practice 5 guided factoring problems focusing on sign rules (+/-, -/+).",
        "Complete a 5-question targeted practice set with step-by-step hints.",
        "Take a mini reassessment quiz to measure score improvement."
    ],
    "practice_questions": [
        {
            "id": 1,
            "question": "Factor: x² + 5x + 6 = 0",
            "options": ["(x + 2)(x + 3)", "(x + 1)(x + 6)", "(x - 2)(x - 3)", "(x + 5)(x + 1)"],
            "correct_answer": "(x + 2)(x + 3)",
            "explanation": "2 and 3 multiply to 6 and add to 5."
        },
        {
            "id": 2,
            "question": "Factor: x² - 6x + 8 = 0",
            "options": ["(x - 2)(x - 4)", "(x + 2)(x + 4)", "(x - 1)(x - 8)", "(x - 6)(x - 2)"],
            "correct_answer": "(x - 2)(x - 4)",
            "explanation": "-2 and -4 multiply to +8 and add to -6."
        },
        {
            "id": 3,
            "question": "Factor: x² + 2x - 15 = 0",
            "options": ["(x + 5)(x - 3)", "(x - 5)(x + 3)", "(x + 15)(x - 1)", "(x - 2)(x + 15)"],
            "correct_answer": "(x + 5)(x - 3)",
            "explanation": "+5 and -3 multiply to -15 and add to +2."
        }
    ],
    "hints": [
        "Always list all pairs of numbers that multiply to c first.",
        "Pay close attention to signs: if c is positive, both factors have the same sign as b.",
        "If c is negative, factors have opposite signs, and the larger factor takes the sign of b."
    ],
    "supportive_feedback": "Great effort! Quadratic equations are a major milestone in algebra. You've already mastered basic algebra—with a bit of focused practice on factoring, you'll regain full confidence.",
    "reassessment_questions": [
        {
            "id": 101,
            "question": "Solve for x by factoring: x² - 9x + 20 = 0",
            "options": ["x = 4 or x = 5", "x = -4 or x = -5", "x = 2 or x = 10", "x = 1 or x = 20"],
            "correct_answer": "x = 4 or x = 5",
            "explanation": "(x - 4)(x - 5) = 0 gives roots x = 4 and x = 5."
        },
        {
            "id": 102,
            "question": "Solve for x by factoring: x² + x - 12 = 0",
            "options": ["x = -4 or x = 3", "x = 4 or x = -3", "x = -6 or x = 2", "x = 6 or x = -2"],
            "correct_answer": "x = -4 or x = 3",
            "explanation": "(x + 4)(x - 3) = 0 gives roots x = -4 and x = 3."
        }
    ]
}

def generate_personalized_intervention(analysis_data: dict) -> dict:
    """
    Generates personalized intervention using Gemini API (via google-genai SDK).
    Falls back to structured FALLBACK_INTERVENTION if key missing or call fails.
    """
    api_key = Config.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable is not set. Returning safe fallback intervention.")
        return {**FALLBACK_INTERVENTION, "source": "fallback_no_api_key"}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key, http_options={"timeout": 8000})

        prompt = f"""
You are an expert educational AI coach for early learning intervention in LearnPulse AI.
Given the following student diagnostic data, generate a high-quality, encouraging, and structured personalized intervention plan.

STUDENT DIAGNOSTIC DATA:
Student Name: {analysis_data.get('name')}
Subject: {analysis_data.get('subject')}
Weak Topic: {analysis_data.get('weak_topic')}
Topic Accuracy: {analysis_data.get('weak_topic_accuracy')}%
Detected Difficulty: {analysis_data.get('detected_difficulty')}
Performance History: {analysis_data.get('history')}
Trend: {analysis_data.get('trend')}
Persistence: {analysis_data.get('persistence')}
Learning Gap Classification: {analysis_data.get('classification')}
Intervention Priority: {analysis_data.get('priority')}
Evidence Reasons: {json.dumps(analysis_data.get('reasons', []))}
Error Patterns: {json.dumps(analysis_data.get('error_patterns', []))}

REQUIREMENTS:
Return ONLY a valid JSON object with the following EXACT structure:
{{
  "explanation": "Empathetic explanation of why student was flagged and what gap exists",
  "concept_review": "Clear, simple explanation of the weak topic and core rules",
  "worked_example": {{
    "problem": "Step-by-step example problem statement",
    "steps": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."]
  }},
  "intervention_steps": ["Step 1 action...", "Step 2 action...", "Step 3 action...", "Step 4 action..."],
  "practice_questions": [
    {{
      "id": 1,
      "question": "Question 1 text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why Option A is correct..."
    }}
  ],
  "hints": ["Hint 1...", "Hint 2..."],
  "supportive_feedback": "Supportive and non-stigmatizing encouragement text",
  "reassessment_questions": [
    {{
      "id": 101,
      "question": "Reassessment question 1...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Explanation..."
    }}
  ]
}}
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )

        content_text = response.text.strip()
        parsed_json = json.loads(content_text)
        parsed_json["source"] = "gemini_api"
        return parsed_json

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}. Utilizing safe backend fallback.")
        return {**FALLBACK_INTERVENTION, "source": f"fallback_api_error ({str(e)})"}

