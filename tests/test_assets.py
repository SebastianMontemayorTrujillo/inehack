"""Asset integrity and submission isolation; no engine or network required."""
import copy
import json
from pathlib import Path
import struct
import tempfile
import unittest
import wave
import zipfile

from tools import assets, create_original_assets, export_game


class AssetTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        create_original_assets.generate(self.root)
        fonts = self.root / "game/assets/fonts"
        fonts.mkdir(parents=True)
        for name in ("AtkinsonHyperlegible-Regular.ttf", "AtkinsonHyperlegible-Bold.ttf", "OFL.txt"):
            (fonts / name).write_bytes(b"fixture font dependency")
        assets.record_original(self.root)

    def test_original_catalog_has_every_role_and_valid_hashes(self):
        catalog = assets.verify_catalog(self.root, "original")
        self.assertEqual(set(catalog["assets"]), assets.REQUIRED_ROLES)
        for role, item in catalog["assets"].items():
            self.assertEqual(item["origin"], "dependency" if role.startswith("font.") else "team-original")

    def test_missing_original_never_uses_development(self):
        (self.root / "game/assets/original/terrain_grass.svg").unlink()
        with self.assertRaisesRegex(ValueError, "missing|Missing"):
            assets.verify_catalog(self.root, "original")

    def test_changed_original_fails_checksum(self):
        (self.root / "game/assets/original/terrain_grass.svg").write_text("tampered")
        with self.assertRaisesRegex(ValueError, "checksum"):
            assets.verify_catalog(self.root, "original")

    def test_catalog_rejects_traversal_and_reference_paths(self):
        path = self.root / "game/assets/catalogs/original.json"
        original = json.loads(path.read_text())
        for bad in ("res://assets/original/../../secret", "res://assets/development/tile.png", "res://../secret", "/etc/passwd", "res://assets/original/..\\secret"):
            changed = copy.deepcopy(original)
            changed["assets"]["terrain.grass"]["path"] = bad
            path.write_text(json.dumps(changed))
            with self.subTest(path=bad), self.assertRaises(ValueError):
                assets.verify_catalog(self.root, "original")

    def test_safe_path_rejects_symlink_escape(self):
        outside = self.root / "outside"
        outside.mkdir()
        base = self.root / "base"
        base.mkdir()
        (base / "link").symlink_to(outside, target_is_directory=True)
        with self.assertRaises(ValueError):
            assets.safe_path(base, "link/file")

    def test_character_sheet_has_twelve_frames_and_logical_region(self):
        item = assets.verify_catalog(self.root, "original")["assets"]["character.player"]
        self.assertEqual(item["region"], [0, 0, 16, 24])
        self.assertEqual(item["frame_size"], [16, 24])
        self.assertEqual(set(item["animations"]), {"down", "left", "right", "up"})
        self.assertEqual(len({tuple(f) for row in item["animations"].values() for f in row}), 12)

    def test_original_wavs_are_short_non_silent_pcm(self):
        for role in ("focus", "select", "journal", "corrective", "chapter"):
            with wave.open(str(self.root / f"game/assets/original/sound_{role}.wav")) as wav:
                self.assertEqual((wav.getnchannels(), wav.getsampwidth()), (1, 2))
                self.assertLess(wav.getnframes() / wav.getframerate(), 2)
                self.assertGreater(len(set(wav.readframes(wav.getnframes()))), 20)

    def test_reference_archive_checksum_detects_tampering(self):
        directory = self.root / "references/assets"
        directory.mkdir(parents=True)
        archive = directory / "fixture.zip"
        archive.write_bytes(b"archive")
        manifest = {"schema_version": 1, "downloads": [{"id": ident, "path": "references/assets/fixture.zip", "sha256": assets.sha256(archive)} for ident in (*assets.PACKS, "AtkinsonHyperlegible-Regular.ttf", "AtkinsonHyperlegible-Bold.ttf", "OFL.txt")], "selections": []}
        assets.write_json(self.root / "assets/reference_manifest.json", manifest)
        assets.verify_references(self.root)
        archive.write_bytes(b"changed")
        with self.assertRaisesRegex(ValueError, "checksum"):
            assets.verify_references(self.root)

    def test_partial_download_manifest_cannot_pass_export_verification(self):
        path = self.root / "references/assets/partial.zip"
        path.parent.mkdir(parents=True)
        path.write_bytes(b"partial download run")
        assets.write_json(self.root / "assets/reference_manifest.json", {"schema_version": 1, "downloads": [{"id": "tiny-town", "path": "references/assets/partial.zip", "sha256": assets.sha256(path)}]})
        with self.assertRaisesRegex(ValueError, "incomplete"):
            assets.verify_references(self.root)

    def test_production_staging_copies_only_selected_originals(self):
        game = self.root / "game"
        (game / "project.godot").write_text("config_version=5")
        for name in ("assets/development/leak.png", "assets/original/unregistered.svg", "tests/test.gd", "addons/gut/plugin.cfg", ".godot/editor/cache", "references/ref.zip"):
            path = game / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("should not ship")
        stage = export_game.stage_project(self.root, "web", "original", verify_downloads=False)
        files = {p.relative_to(stage).as_posix() for p in stage.rglob("*") if p.is_file()}
        self.assertIn("assets/active_catalog.json", files)
        self.assertIn("assets/original/terrain_grass.svg", files)
        self.assertIn("assets/fonts/OFL.txt", files)
        for forbidden in ("development", "unregistered", "gut", "test.gd", "references", ".godot/", "catalogs/development"):
            self.assertFalse(any(forbidden in name for name in files), forbidden)
        self.assertEqual(json.loads((stage / "assets/active_catalog.json").read_text())["asset_set"], "original")

    def test_staging_rejects_unknown_target_and_asset_set(self):
        for target, asset_set in (("windows", "original"), ("web", "automatic")):
            with self.assertRaises(ValueError):
                export_game.stage_project(self.root, target, asset_set, verify_downloads=False)

    def test_production_requires_reference_provenance_before_staging(self):
        (self.root / "game/project.godot").write_text("config_version=5")
        with self.assertRaises((ValueError, FileNotFoundError)):
            export_game.stage_project(self.root, "web", "original")
        self.assertFalse((self.root / "build/staging-web").exists())

    def test_frame_metadata_rejects_out_of_sheet_regions(self):
        path = self.root / "game/assets/catalogs/original.json"
        catalog = json.loads(path.read_text())
        catalog["assets"]["character.player"]["region"] = [47, 0, 16, 24]
        path.write_text(json.dumps(catalog))
        with self.assertRaisesRegex(ValueError, "region"):
            assets.verify_catalog(self.root, "original")

    def test_production_rejects_hardcoded_reference_resource(self):
        (self.root / "game/project.godot").write_text("config_version=5")
        (self.root / "game/main.gd").write_text('var leaked = preload("res://assets/development/tile.png")')
        with self.assertRaisesRegex(ValueError, "reference"):
            export_game.stage_project(self.root, "web", "original", verify_downloads=False)

    def test_development_uses_real_sprite_member_with_region_not_pack_preview(self):
        directory = self.root / "references/assets"
        directory.mkdir(parents=True)
        selections = {
            "tiny-town": "Tiles/tile_0000.png",
            "roguelike-characters": "Spritesheet/roguelikeChar_transparent.png",
            "ui-pack": "PNG/Blue/Default/button_rectangle_flat.png",
            "interface-sounds": "Audio/click_001.ogg",
        }
        for pack, member in selections.items():
            with zipfile.ZipFile(directory / (pack + ".zip"), "w") as archive:
                archive.writestr("Preview.png", b"must never select this")
                archive.writestr(member, b"\x89PNG\r\n\x1a\n" + b"\0" * 8 + struct.pack(">II", 303, 135) if member.endswith(".png") else b"OggSfixture")
        manifest = {"schema_version": 1, "downloads": [], "licenses": [], "selections": []}
        assets.make_development(self.root, manifest)
        catalog = json.loads((self.root / "game/assets/catalogs/development.json").read_text())
        self.assertEqual(catalog["assets"]["character.player"]["region"], [0, 0, 16, 16])
        self.assertEqual(catalog["assets"]["character.player"]["origin"], "reference")
        for entry in manifest["selections"]:
            self.assertEqual(entry["archive_member"], selections[entry["pack"]])


if __name__ == "__main__":
    unittest.main()
