
import unittest

from ai_engine.orchestrator import orchestrate_incident


class TestOrchestrator(unittest.TestCase):

    def test_critical_medical_incident(self):
        result = orchestrate_incident({
            "incident_id": "INC-001",
            "title": "Unconscious person",
            "description": "A person is unconscious after an accident",
        })

        self.assertEqual(result["incident_id"], "INC-001")
        self.assertEqual(result["category"], "medical_emergency")
        self.assertEqual(result["severity"], "Critical")
        self.assertEqual(result["priority"], "P1")
        self.assertTrue(result["needs_human_review"])
        self.assertTrue(result["recommended_actions"])
        self.assertTrue(result["resource_needs"])

    def test_road_blockage(self):
        result = orchestrate_incident({
            "incident_id": "INC-002",
            "title": "Road blocked",
            "description": "A fallen tree blocks the road",
        })

        self.assertEqual(result["category"], "road_blockage")
        self.assertEqual(result["severity"], "Medium")
        self.assertEqual(result["priority"], "P3")

    def test_unknown_incident_requires_review(self):
        result = orchestrate_incident({
            "incident_id": "INC-003",
            "title": "Need assistance",
            "description": "Details are not available",
        })

        self.assertEqual(result["category"], "other")
        self.assertTrue(result["needs_human_review"])
        self.assertTrue(result["uncertainty"])

    def test_invalid_input_is_rejected(self):
        with self.assertRaises(ValueError):
            orchestrate_incident("not a dictionary")


if __name__ == "__main__":
    unittest.main()
