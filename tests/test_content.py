"""The classroom route must teach the same six decisions in either renderer."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ClassroomContentTests(unittest.TestCase):
    def setUp(self):
        self.story = json.loads((ROOT / 'game/content/story.json').read_text())

    def test_required_activities_are_short_conceptual_decisions(self):
        activities = self.story.get('activities', [])
        self.assertEqual(len(activities), 6)
        self.assertEqual(len({a['id'] for a in activities}), 6)
        self.assertEqual(sum(a.get('transfer', False) for a in activities), 2)
        for activity in activities:
            self.assertLessEqual(len(activity['prompt'].split()), 22)
            self.assertNotIn(activity['rule'], ['denominator', 'combined', 'transfer1', 'transfer2'])
            self.assertTrue(activity['hint'] and activity['explanation'])
            self.assertIn(activity['chapter'], ['printing', 'comparison'])

    def test_all_houses_have_stable_location_and_chapter_contract(self):
        locations = self.story.get('houses', [])
        self.assertEqual([h['id'] for h in locations], ['printshop', 'archive', 'hall'])
        self.assertEqual([h['chapter'] for h in locations], ['printing', 'comparison', 'consultation'])
        self.assertTrue(all(h['preview'] and h['title'] for h in locations))

    def test_optional_math_and_fictional_examples_remain_available(self):
        self.assertTrue(self.story.get('optional_math'))
        fixtures = self.story['assessment_fixtures']
        for record in [fixtures['printing'], *fixtures['comparison']]:
            self.assertEqual(record['ln'], record['sv'] + record['nv'] + record['ns'])
        self.assertIn('inventad', self.story['fiction_label'])


if __name__ == '__main__':
    unittest.main()
