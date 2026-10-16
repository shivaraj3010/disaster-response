
import unittest

from ai_engine.ai_agents import assess_severity


class TestAssessSeverity(unittest.TestCase):

    def test_critical_incident(self):
        result = assess_severity(
            {"description": "A person is unconscious"},
            "medical_emergency",
        )
        self.assertEqual(result["severity"], "Critical")
        self.assertEqual(result["priority"], "P1")
        self.assertTrue(result["needs_human_review"])

    def test_high_incident(self):
        result = assess_severity(
            {"description": "Smoke and flames reported"},
            "fire",
        )
        self.assertEqual(result["severity"], "High")
        self.assertEqual(result["priority"], "P2")

    def test_road_blockage(self):
        result = assess_severity(
            {"description": "Road blocked by a fallen tree"},
            "road_blockage",
        )
        self.assertEqual(result["severity"], "Medium")
        self.assertEqual(result["priority"], "P3")

    def test_unclear_incident(self):
        result = assess_severity(
            {"description": "Please investigate"},
            "other",
        )
        self.assertEqual(result["severity"], "Medium")
        self.assertTrue(result["needs_human_review"])

    def test_explicit_severity_is_preserved(self):
        result = assess_severity(
            {"description": "Road blocked", "severity": "Low"},
            "road_blockage",
        )
        self.assertEqual(result["severity"], "Low")
        self.assertEqual(result["priority"], "P4")

    def test_invalid_incident_is_rejected(self):
        with self.assertRaises(ValueError):
            assess_severity("not a dictionary", "fire")


if __name__ == "__main__":
    unittest.main()
