import csv
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

from tools.build_data import FIELDS, build_bundle, rate


class DataTests(unittest.TestCase):
    def test_shipped_aggregates_match_independent_research_fixtures(self):
        root = Path(__file__).resolve().parents[1]
        reference = (root / "tests/fixtures/verified_ccpc2024.json").read_bytes()
        self.assertEqual(hashlib.sha256(reference).hexdigest(), "6cb28e8551e5fe5f03aac1edd02376799921f56a3d56cc09846a1a121898e6d9")
        fixtures = json.loads(reference)
        actual = json.loads((root / "game/content/ccpc.json").read_text())
        records = {r["id"]: r for r in actual["records"]}
        self.assertEqual(actual["source"]["sha256"], fixtures["sha256"])
        self.assertEqual(actual["validation"]["rows"], 9773730)
        for current, prior in [("national", "national"), ("state_01", "state_1"), ("state_02", "state_2")]:
            for field in ["LN", "SV", "NV", "NS"]:
                self.assertEqual(records[current][field.lower()], fixtures["groups"][prior][field])
            self.assertAlmostEqual(records[current]["participation_pct"], fixtures["groups"][prior]["turnout_pct"])

    def test_same_input_produces_identical_bundle(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(directory)
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            self.assertEqual(build_bundle(source, digest), build_bundle(source, digest))
    def source(self, directory, invalid=False):
        path = Path(directory) / "source.zip"
        with ZipFile(path, "w") as archive:
            for state in range(1, 33):
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(FIELDS)
                writer.writerow(["2024", "06/02/2024", str(state), f"Estado {state}", "1", "Municipio", "1", "U", "1", "1", "0", "18", "100", "60", "30", "11" if invalid else "10"])
                archive.writestr(f"state_{state:02}.csv", output.getvalue())
        return path

    def test_zero_denominator_is_unavailable(self):
        self.assertIsNone(rate(0, 0))

    def test_classified_denominator_excludes_unknown(self):
        self.assertAlmostEqual(rate(60, 90), 66.6666666667)

    def test_valid_source_is_aggregated_before_division(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(directory)
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            result = build_bundle(source, expected_hash=digest)
            record = result["records"][0]
            self.assertEqual(record["sv"], 1920)
            self.assertAlmostEqual(record["participation_pct"], 100 * 60 / 90)
            self.assertEqual(len(result["records"]), 33)

    def test_changed_source_fails_instead_of_warning(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "hash"):
                build_bundle(self.source(directory))

    def test_arithmetic_violation_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(directory, invalid=True)
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            with self.assertRaisesRegex(ValueError, "LN"):
                build_bundle(source, expected_hash=digest)


if __name__ == "__main__":
    unittest.main()
