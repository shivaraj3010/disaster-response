
import unittest

from ai_engine.resource_allocator import allocate_resources


class TestResourceAllocation(unittest.TestCase):

    def test_resources_go_to_highest_priority_first(self):
        incidents = [
            {
                "incident_id": "INC-1",
                "severity": "Low",
                "resource_needs": ["medical_team"],
            },
            {
                "incident_id": "INC-2",
                "severity": "Critical",
                "resource_needs": ["medical_team"],
            },
        ]

        inventory = {"medical_team": 1}

        result = allocate_resources(incidents, inventory)

        self.assertEqual(
            result["allocations"]["INC-2"],
            ["medical_team"],
        )
        self.assertEqual(result["allocations"]["INC-1"], [])
        self.assertEqual(
            result["unallocated"]["INC-1"],
            ["medical_team"],
        )

    def test_empty_incidents(self):
        result = allocate_resources([], {"medical_team": 1})

        self.assertEqual(result["allocations"], {})
        self.assertEqual(result["unallocated"], {})

    def test_invalid_inventory_is_rejected(self):
        with self.assertRaises(ValueError):
            allocate_resources([], {"medical_team": -1})


if __name__ == "__main__":
    unittest.main()
