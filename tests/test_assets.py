"""Asset integrity and submission isolation; no engine or network required."""
import copy
import json
from pathlib import Path
import shutil
import struct
import tempfile
import unittest
from unittest.mock import patch
import wave
import xml.etree.ElementTree as ET
import zipfile

from tools import assets, create_original_assets, export_game


INTERIOR_SIZES = {
    "terrain.floor": [16, 16],
    "terrain.wall": [16, 16],
    "prop.desk": [32, 24],
    "prop.bookshelf": [24, 32],
    "prop.chair": [24, 24],
    "prop.exit": [24, 32],
}


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
        # The music is a separately acquired dependency, never generated art.
        for relative in ("game/assets/audio/sunset-walk.ogg", "game/assets/audio/CC0-1.0.txt", "assets/music_manifest.json"):
            source = assets.ROOT / relative
            destination = self.root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        assets.record_original(self.root)

    def test_original_catalog_has_every_role_and_valid_hashes(self):
        catalog = assets.verify_catalog(self.root, "original")
        self.assertEqual(set(catalog["assets"]), assets.REQUIRED_ROLES)
        for role, item in catalog["assets"].items():
            expected = "third-party" if role == "music.plaza" else "dependency" if role.startswith("font.") else "team-original"
            self.assertEqual(item["origin"], expected)

    def test_plaza_music_is_an_explicit_cc0_dependency(self):
        item = assets.verify_catalog(self.root)["assets"].get("music.plaza")
        self.assertIsNotNone(item)
        self.assertEqual(item["path"], "res://assets/audio/sunset-walk.ogg")
        self.assertEqual(item["origin"], "third-party")
        self.assertEqual(item["author"], "KiluaBoy")
        self.assertEqual(item["license"], "CC0-1.0")
        self.assertEqual(item["license_path"], "res://assets/audio/CC0-1.0.txt")
        self.assertTrue(item["loop"])
        manifest = json.loads((self.root / "assets/original_manifest.json").read_text())
        self.assertFalse(any("assets/audio/" in entry["path"] for entry in manifest["files"]))

    def test_music_and_cc0_notice_cannot_be_missing_or_modified(self):
        for name in ("sunset-walk.ogg", "CC0-1.0.txt"):
            path = self.root / "game/assets/audio" / name
            data = path.read_bytes()
            for contents in (None, b"tampered"):
                with self.subTest(name=name, contents=contents):
                    if contents is None:
                        path.unlink()
                    else:
                        path.write_bytes(contents)
                    try:
                        with self.assertRaisesRegex(ValueError, "missing|checksum"):
                            assets.verify_catalog(self.root)
                    finally:
                        path.write_bytes(data)

    def test_music_cannot_be_miscredited_or_broaden_the_original_allowlist(self):
        path = self.root / "game/assets/catalogs/original.json"
        original = json.loads(path.read_text())
        self.assertIn("music.plaza", original["assets"])
        mutations = (("origin", "team-original"), ("author", "Voces de la Plaza"),
                     ("license", "unknown"), ("license_path", "res://assets/fonts/OFL.txt"),
                     ("path", "res://assets/audio/other.ogg"))
        for key, value in mutations:
            changed = copy.deepcopy(original)
            changed["assets"]["music.plaza"][key] = value
            assets.write_json(path, changed)
            with self.subTest(key=key), self.assertRaises(ValueError):
                assets.verify_catalog(self.root)
        changed = copy.deepcopy(original)
        changed["assets"]["sound.select"] = copy.deepcopy(original["assets"]["music.plaza"])
        assets.write_json(path, changed)
        with self.assertRaises(ValueError):
            assets.verify_catalog(self.root)

    def test_missing_music_role_fails_both_catalogs(self):
        original = json.loads((self.root / "game/assets/catalogs/original.json").read_text())
        for asset_set in ("original", "development"):
            changed = copy.deepcopy(original)
            changed["asset_set"] = asset_set
            del changed["assets"]["music.plaza"]
            assets.write_json(self.root / f"game/assets/catalogs/{asset_set}.json", changed)
            with self.subTest(asset_set=asset_set), self.assertRaisesRegex(ValueError, "roles"):
                assets.verify_catalog(self.root, asset_set)

    def test_music_provenance_is_required_and_validated(self):
        path = self.root / "assets/music_manifest.json"
        original = json.loads(path.read_text())
        path.unlink()
        with self.assertRaises(FileNotFoundError):
            assets.verify_catalog(self.root)
        for field, value in (("role", "sound.select"), ("author", "team"), ("license", "unknown"), ("source_page", "https://example.com")):
            changed = copy.deepcopy(original)
            changed[field] = value
            assets.write_json(path, changed)
            with self.subTest(field=field), self.assertRaisesRegex(ValueError, "music"):
                assets.verify_catalog(self.root)
        changed = copy.deepcopy(original)
        changed["audio"]["path"] = "../elsewhere.ogg"
        assets.write_json(path, changed)
        with self.assertRaisesRegex(ValueError, "unapproved"):
            assets.verify_catalog(self.root)

    def test_reacquisition_rejects_changed_upstream_bytes_without_overwriting(self):
        manifest = assets.verify_music(self.root)
        before = {key: (self.root / manifest[key]["path"]).read_bytes() for key in assets.MUSIC_DOWNLOADS}

        def download_changed(url, destination):
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(b"changed upstream response")
            return url

        with patch.object(assets, "download", side_effect=download_changed):
            with self.assertRaisesRegex(ValueError, "checksum"):
                assets.acquire_music(self.root)
        for key, contents in before.items():
            self.assertEqual((self.root / manifest[key]["path"]).read_bytes(), contents)

    def test_interior_roles_have_pixel_geometry_and_matching_dimensions(self):
        catalog = assets.verify_catalog(self.root, "original")["assets"]
        self.assertLessEqual(INTERIOR_SIZES.keys(), catalog.keys())
        for role, size in INTERIOR_SIZES.items():
            with self.subTest(role=role):
                item = catalog[role]
                self.assertEqual(item["size"], size)
                self.assertEqual(item["region"], [0, 0, *size])
                self.assertEqual(item["filter"], "nearest")
                source = self.root / "game" / item["path"].removeprefix("res://")
                drawing = ET.parse(source).getroot()
                self.assertEqual([int(drawing.attrib[key]) for key in ("width", "height")], size)
                self.assertEqual(drawing.attrib["viewBox"], f"0 0 {size[0]} {size[1]}")
                self.assertEqual(drawing.attrib["shape-rendering"], "crispEdges")
                # Opaque terrain tiles, isolated props, no embedded text or images.
                covered = set()
                for shape in drawing:
                    self.assertEqual(shape.tag, "{http://www.w3.org/2000/svg}rect")
                    x, y, w, h = (int(shape.attrib[key]) for key in ("x", "y", "width", "height"))
                    self.assertGreaterEqual(min(x, y), 0)
                    self.assertGreater(min(w, h), 0)
                    self.assertLessEqual(x + w, size[0])
                    self.assertLessEqual(y + h, size[1])
                    covered.update((px, py) for px in range(x, x + w) for py in range(y, y + h))
                self.assertGreater(len(covered), 0)
                if role.startswith("terrain."):
                    self.assertEqual(len(covered), size[0] * size[1])
                else:
                    self.assertNotIn((0, 0), covered)
                    self.assertLess(len(covered), size[0] * size[1])

    def test_missing_interior_role_is_rejected_in_either_catalog(self):
        original = json.loads((self.root / "game/assets/catalogs/original.json").read_text())
        self.assertLessEqual(INTERIOR_SIZES.keys(), original["assets"].keys())
        for asset_set in ("original", "development"):
            path = self.root / f"game/assets/catalogs/{asset_set}.json"
            for role in INTERIOR_SIZES:
                with self.subTest(asset_set=asset_set, role=role):
                    changed = copy.deepcopy(original)
                    changed["asset_set"] = asset_set
                    del changed["assets"][role]
                    assets.write_json(path, changed)
                    with self.assertRaisesRegex(ValueError, "roles"):
                        assets.verify_catalog(self.root, asset_set)

    def test_missing_interior_original_never_falls_back_to_reference(self):
        catalog = json.loads((self.root / "game/assets/catalogs/original.json").read_text())
        self.assertLessEqual(INTERIOR_SIZES.keys(), catalog["assets"].keys())
        development = copy.deepcopy(catalog)
        development["asset_set"] = "development"
        for role in INTERIOR_SIZES:
            with self.subTest(role=role):
                source = self.root / "game" / catalog["assets"][role]["path"].removeprefix("res://")
                data = source.read_bytes()
                reference = self.root / "game/assets/development" / source.name
                reference.parent.mkdir(parents=True, exist_ok=True)
                reference.write_bytes(data)
                development["assets"][role] = {"path": "res://assets/development/" + source.name, "origin": "reference"}
                assets.write_json(self.root / "game/assets/catalogs/development.json", development)
                source.unlink()
                try:
                    with self.assertRaisesRegex(ValueError, "missing asset"):
                        assets.verify_catalog(self.root, "original")
                finally:
                    source.write_bytes(data)

    def test_regeneration_syncs_original_development_roles_and_preserves_references(self):
        path = self.root / "game/assets/catalogs/development.json"
        catalog = json.loads((self.root / "game/assets/catalogs/original.json").read_text())
        catalog["asset_set"] = "development"
        reference = {"path": "res://assets/development/tiny-town.png", "origin": "reference", "size": [16, 16], "region": [0, 0, 16, 16]}
        catalog["assets"]["terrain.grass"] = reference
        for role in INTERIOR_SIZES:
            catalog["assets"].pop(role, None)
        # A later art revision must also update existing original metadata.
        catalog["assets"]["prop.desk"] = {"path": "res://assets/original/old.svg", "origin": "team-original", "size": [1, 1]}
        assets.write_json(path, catalog)
        entries = create_original_assets.generate(self.root)
        regenerated = json.loads(path.read_text())
        self.assertLessEqual(INTERIOR_SIZES.keys(), regenerated["assets"].keys())
        self.assertEqual(regenerated["asset_set"], "development")
        self.assertEqual(regenerated["assets"]["terrain.grass"], reference)
        for role in INTERIOR_SIZES:
            self.assertEqual(regenerated["assets"][role], entries[role])
        self.assertIn("music.plaza", entries)
        self.assertEqual(regenerated["assets"]["music.plaza"], entries["music.plaza"])

    def test_interior_manifest_matches_deterministic_generated_bytes(self):
        manifest = json.loads((self.root / "assets/original_manifest.json").read_text())
        files = {entry["path"]: entry for entry in manifest["files"]}
        create_original_assets.generate(self.root)
        self.assertEqual(manifest["generator_sha256"], assets.sha256(Path(create_original_assets.__file__)))
        for role in INTERIOR_SIZES:
            with self.subTest(role=role):
                relative = "game/assets/original/" + role.replace(".", "_") + ".svg"
                self.assertIn(relative, files)
                self.assertEqual(files[relative]["bytes"], (self.root / relative).stat().st_size)
                self.assertEqual(files[relative]["sha256"], assets.sha256(self.root / relative))

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
        for role in INTERIOR_SIZES:
            self.assertIn("assets/original/" + role.replace(".", "_") + ".svg", files)
        self.assertIn("assets/fonts/OFL.txt", files)
        self.assertIn("assets/audio/sunset-walk.ogg", files)
        for forbidden in ("development", "unregistered", "gut", "test.gd", "references", ".godot/", "catalogs/development"):
            self.assertFalse(any(forbidden in name for name in files), forbidden)
        self.assertEqual(json.loads((stage / "assets/active_catalog.json").read_text())["asset_set"], "original")
        self.assertEqual(json.loads((stage / "assets/active_catalog.json").read_text())["assets"]["music.plaza"],
                         json.loads((game / "assets/catalogs/original.json").read_text())["assets"]["music.plaza"])

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
        original = json.loads((self.root / "game/assets/catalogs/original.json").read_text())
        self.assertIn("music.plaza", catalog["assets"])
        self.assertEqual(catalog["assets"]["music.plaza"], original["assets"]["music.plaza"])
        for role in INTERIOR_SIZES:
            self.assertIn(role, catalog["assets"])
            self.assertEqual(catalog["assets"][role], original["assets"][role])
        for entry in manifest["selections"]:
            self.assertEqual(entry["archive_member"], selections[entry["pack"]])


if __name__ == "__main__":
    unittest.main()
