"""
Integration Test Suite for LearnPulse AI Backend
"""

import sys
import unittest

from backend.app import create_app
from backend.data.seed_data import get_student_by_id

class LearnPulseBackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertIn("healthy", res.get_json()["status"])

    def test_get_students(self):
        res = self.client.get("/api/students")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("students", data)
        self.assertGreater(len(data["students"]), 0)

    def test_ananya_student_data(self):
        ananya = get_student_by_id("s00")
        self.assertIsNotNone(ananya)
        self.assertEqual(ananya["name"], "Ananya Sharma")
        self.assertEqual(ananya["history"], [76, 68, 57, 43])
        self.assertEqual(ananya["weakTopic"], "Quadratic Equations")
        self.assertEqual(ananya["detectedDifficulty"], "Factorization")

    def test_smart_alerts_engine(self):
        res = self.client.get("/api/alerts")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("alerts", data)
        alerts = data["alerts"]
        self.assertGreater(len(alerts), 0)
        ananya_alert = next((a for a in alerts if a["student_id"] == "s00"), None)
        self.assertIsNotNone(ananya_alert)
        self.assertGreaterEqual(len(ananya_alert["evidence_reasons"]), 2)
        self.assertIn("confidence_percentage", ananya_alert)
        self.assertEqual(ananya_alert["status"], "Needs review")
        
        # Test marking as reviewed
        res_review = self.client.post("/api/alerts/s00/review")
        self.assertEqual(res_review.status_code, 200)
        self.assertEqual(res_review.get_json()["result"]["status"], "Teacher reviewed")

    def test_teacher_copilot_ask(self):
        res = self.client.post("/api/copilot/ask", json={"question": "Which students need my attention today?"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("answer", data)
        self.assertTrue(len(data["answer"]) > 10)

    def test_class_learning_heatmap(self):
        res = self.client.get("/api/heatmap")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("domains", data)
        self.assertIn("heatmap", data)
        self.assertIn("class_insight", data)
        self.assertIn("class_averages", data)

    def test_practice_and_reassessment(self):
        # Submit Practice
        res = self.client.post("/api/practice/s00/submit", json={"answers": {"1": "(x + 2)(x + 3)"}})
        self.assertEqual(res.status_code, 200)
        self.assertIn("score_percentage", res.get_json()["result"])
        
        # Submit Reassessment (Ananya 43% -> 72%, +29%)
        res = self.client.post("/api/reassessment/s00/submit", json={"answers": {"101": "x = 4 or x = 5"}})
        self.assertEqual(res.status_code, 200)
        result = res.get_json()["result"]
        self.assertEqual(result["before_score"], 43)
        self.assertEqual(result["after_score"], 72)
        self.assertEqual(result["improvement_delta"], "+29%")

if __name__ == "__main__":
    unittest.main()
