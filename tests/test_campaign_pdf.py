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

    def test_poster_contrast_in_color_and_grayscale(self):
        colors = json.loads((ROOT / "game/content/campaign_layout.json").read_text())["colors"]

        def luminance(hex_color):
            channels = [int(hex_color[index:index + 2], 16) / 255 for index in (0, 2, 4)]
            linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
                      for value in channels]
            return sum(value * weight for value, weight in zip(linear, (0.2126, 0.7152, 0.0722)))

        for foreground, background in (("ink", "white"), ("ink", "pale"),
                                       ("pink", "white"), ("white", "pink"), ("pink", "pale")):
            with self.subTest(foreground=foreground, background=background):
                # Luminance is also the contrast preserved by a linear grayscale conversion.
                values = sorted((luminance(colors[foreground]), luminance(colors[background])))
                self.assertGreaterEqual((values[1] + 0.05) / (values[0] + 0.05), 4.5)


if __name__ == "__main__":
    unittest.main()
