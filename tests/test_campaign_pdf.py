"""Build resource integrity; runtime/extraction checks live in the focused runners."""
import base64
import hashlib
import json
from pathlib import Path
import unittest

from tools.build_campaign_font import generate

ROOT = Path(__file__).resolve().parents[1]


class CampaignFontTests(unittest.TestCase):
    def test_committed_metrics_and_maps_are_reproducible(self):
        self.assertEqual((ROOT / "game/content/campaign_font.json").read_text(encoding="utf-8"), generate())

    def test_embedded_fonts_are_unmodified_and_cover_spanish(self):
        resource = json.loads(generate())
        for style, font in zip(("Regular", "Bold"), resource["fonts"]):
            original = (ROOT / f"game/assets/fonts/AtkinsonHyperlegible-{style}.ttf").read_bytes()
            self.assertEqual(base64.b64decode(font["ttf_base64"]), original)
            self.assertEqual(hashlib.sha256(original).hexdigest(), font["sha256"])
            for character in "¿¡áéíóúüñÁÉÍÓÚÜÑ·":
                self.assertIn(character, font["characters"])
            self.assertEqual(len(base64.b64decode(font["cid_map_base64"])), len(font["widths"]) * 2)


if __name__ == "__main__":
    unittest.main()
