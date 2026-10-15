
import unittest

from ai_engine.resource_allocator import rank_incidents


class TestResourceAllocator(unittest.TestCase):

    def test_critical_incident_ranks_first(self):
        incidents = [
            {"incident_id": "INC-1", "severity": "Low"},
            {"incident_id": "INC-2", "severity": "Critical"},
            {"incident_id": "INC-3", "severity": "High"},
        ]

        ranked = rank_incidents(incidents)

        self.assertEqual(
            [item["incident_id"] for item in ranked],
            ["INC-2", "INC-3", "INC-1"],
        )

    def test_equal_severity_preserves_input_order(self):
        incidents = [
            {"incident_id": "INC-1", "severity": "High"},
            {"incident_id": "INC-2", "severity": "High"},
        ]

        ranked = rank_incidents(incidents)

        self.assertEqual(
            [item["incident_id"] for item in ranked],
            ["INC-1", "INC-2"],
        )

    def test_empty_list_returns_empty_list(self):
        self.assertEqual(rank_incidents([]), [])

    def test_invalid_input_is_rejected(self):
        with self.assertRaises(ValueError):
            rank_incidents("not a list")


if __name__ == "__main__":
    unittest.main()
