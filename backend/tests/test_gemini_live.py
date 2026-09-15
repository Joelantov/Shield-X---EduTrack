"""
Live test for Gemini API using the provided GEMINI_API_KEY
"""

import sys
from backend.services.analysis_service import analyze_student_performance
from backend.services.gemini_service import generate_personalized_intervention
from backend.data.seed_data import get_student_by_id

def test_live_gemini():
    student = get_student_by_id("s00") # Ananya
    analysis = analyze_student_performance(student)
    print("Calling Gemini API live...")
    result = generate_personalized_intervention(analysis)
    
    print("\nGemini Response Source:", result.get("source"))
    print("\n--- Explanation ---")
    print(result.get("explanation"))
    print("\n--- Concept Review ---")
    print(result.get("concept_review"))
    print("\n--- Worked Example ---")
    print(result.get("worked_example"))
    print("\n--- Intervention Steps ---")
    print(result.get("intervention_steps"))
    
    if result.get("source") == "gemini_api":
        print("\nSUCCESS: Gemini API integrated and responding live!")
    else:
        print("\nFALLBACK TRIGGERED:", result.get("source"))

if __name__ == "__main__":
    test_live_gemini()
