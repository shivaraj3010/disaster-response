
import unittest

from ai_engine.orchestrator import (
    orchestrate_incident,
    orchestrate_incidents,
)
from ai_engine.resource_allocator import rank_incidents


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

    def test_multiple_incidents_can_be_ranked(self):
        incidents = [
            {"incident_id": "INC-101", "severity": "Low"},
            {"incident_id": "INC-102", "severity": "Critical"},
            {"incident_id": "INC-103", "severity": "High"},
        ]

        ranked = rank_incidents(incidents)

        self.assertEqual(
            [item["incident_id"] for item in ranked],
            ["INC-102", "INC-103", "INC-101"],
        )

    def test_batch_orchestration_returns_assessments_and_allocation(self):
        reports = [
            {
                "incident_id": "INC-201",
                "title": "Road blocked",
                "description": "A fallen tree blocks the road",
            },
            {
                "incident_id": "INC-202",
                "title": "Unconscious person",
                "description": "A person is unconscious after an accident",
            },
        ]

        result = orchestrate_incidents(
            reports,
            {
                "Qualified medical personnel": 1,
                "First-aid kit": 1,
                "Road clearance team": 1,
                "Traffic control equipment": 1,
            },
        )

        self.assertEqual(len(result["assessments"]), 2)
        self.assertEqual(
            result["assessments"][0]["incident_id"],
            "INC-202",
        )
        self.assertIn("resource_allocation", result)
        self.assertTrue(result["needs_human_review"])

    def test_batch_orchestration_rejects_invalid_input(self):
        with self.assertRaises(ValueError):
            orchestrate_incidents("not a list", {})


if __name__ == "__main__":
    unittest.main()
