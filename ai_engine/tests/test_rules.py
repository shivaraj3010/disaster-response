import unittest

from ai_engine import classify_incident


class TestClassification(unittest.TestCase):

    def test_supported_categories(self):
        examples = [
            ({"incident_type": "flood"}, "flood"),
            ({"description": "Smoke and flames reported"}, "fire"),
            ({"description": "Earthquake tremor reported"}, "earthquake"),
            ({"description": "Road blocked by a fallen tree"}, "road_blockage"),
            ({"description": "An injured person needs help"}, "medical_emergency"),
        ]

        for incident, expected in examples:
            with self.subTest(expected=expected):
                self.assertEqual(
                    classify_incident(incident)["category"], expected
                )

    def test_unknown_report(self):
        result = classify_incident({"description": "Please investigate"})
        self.assertEqual(result["category"], "other")
        self.assertLess(result["confidence"], 0.5)

    def test_missing_description(self):
        result = classify_incident({})
        self.assertEqual(result["category"], "other")
        self.assertTrue(result["uncertainty"])

    def test_ambiguous_report(self):
        result = classify_incident({
            "description": "Fire reported and flood water is rising"
        })
        self.assertEqual(result["category"], "other")
        self.assertLess(result["confidence"], 0.5)

    def test_explicit_type_takes_precedence(self):
        result = classify_incident({
            "incident_type": "earthquake",
            "description": "Flood water is rising",
        })
        self.assertEqual(result["category"], "earthquake")

    def test_deterministic_output(self):
        incident = {"description": "Flood water is rising"}
        self.assertEqual(
            classify_incident(incident),
            classify_incident(incident),
        )

    def test_malformed_input(self):
        with self.assertRaises(ValueError):
            classify_incident("not a dictionary")

        with self.assertRaises(ValueError):
            classify_incident({"description": 123})


if __name__ == "__main__":
    unittest.main()
