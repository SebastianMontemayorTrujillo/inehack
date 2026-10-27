#!/usr/bin/env python3
"""Acquire approved references and verify both asset catalogs (stdlib only)."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import sys
import tempfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_ROLES = set((
    "terrain.grass terrain.path terrain.paving terrain.water terrain.floor terrain.wall "
    "building.printshop building.archive building.hall prop.tree prop.bench prop.printer "
    "prop.noticeboard prop.ballotbox prop.desk prop.bookshelf prop.chair prop.exit "
    "icon.shade icon.reading icon.garden character.player character.luz character.mateo "
    "character.ines sound.focus sound.select sound.journal sound.corrective sound.chapter font.regular font.bold music.plaza"
).split())
PACKS = {
    "tiny-town": "https://kenney.nl/media/pages/assets/tiny-town/a415fbeb49-1735736916/kenney_tiny-town.zip",
    "roguelike-characters": "https://kenney.nl/media/pages/assets/roguelike-characters/53ffff4133-1729196490/kenney_roguelike-characters.zip",
    "ui-pack": "https://kenney.nl/media/pages/assets/ui-pack/f651646eab-1718203990/kenney_ui-pack.zip",
    "interface-sounds": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
}
FONT_BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegible/"
MUSIC_ENTRY = {
    "path": "res://assets/audio/sunset-walk.ogg",
    "origin": "third-party",
    "author": "KiluaBoy",
    "source_page": "https://opengameart.org/node/87082",
    "license": "CC0-1.0",
    "license_path": "res://assets/audio/CC0-1.0.txt",
    "loop": True,
}
MUSIC_DOWNLOADS = {
    "audio": ("game/assets/audio/sunset-walk.ogg", "https://opengameart.org/sites/default/files/SunsetWalk.ogg"),
    "license_file": ("game/assets/audio/CC0-1.0.txt", "https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt"),
}


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path):
    with Path(path).open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def safe_path(base, relative):
    """Only canonical relative POSIX paths, including through existing symlinks."""
    if not isinstance(relative, str) or "\\" in relative or ":" in relative:
        raise ValueError(f"unsafe path: {relative!r}")
    parts = PurePosixPath(relative)
    if parts.is_absolute() or not parts.parts or any(p in ("..", ".") for p in relative.split("/")):
        raise ValueError(f"unsafe path: {relative!r}")
    resolved = (Path(base) / relative).resolve()
    if not resolved.is_relative_to(Path(base).resolve()):
        raise ValueError(f"path escapes root: {relative}")
    return resolved


def checked_file(root, entry):
    path = safe_path(root, entry["path"])
    if not path.is_file():
        raise ValueError(f"missing asset: {entry['path']}")
    if sha256(path) != entry["sha256"]:
        raise ValueError(f"checksum mismatch: {entry['path']}")
    return path


def record_original(root=ROOT):
    catalog = json.loads((root / "game/assets/catalogs/original.json").read_text())
    files = []
    paths = {item["path"].removeprefix("res://") for role, item in catalog["assets"].items() if role != "music.plaza"}
    paths.add("assets/fonts/OFL.txt")
    for relative in sorted(paths):
        path = safe_path(root / "game", relative)
        if not path.is_file():
            raise ValueError(f"missing original/dependency: {relative}")
        files.append({"path": "game/" + relative, "sha256": sha256(path), "bytes": path.stat().st_size})
    write_json(root / "assets/original_manifest.json", {
        "schema_version": 1,
        "generated_at_utc": utc_now(),
        "authoring": "Original procedural SVG geometry and synthesized WAV notation authored for the Voces de la Plaza team; no reference pixels, traces or samples used.",
        "generator": "tools/create_original_assets.py",
        "generator_sha256": sha256(Path(__file__).with_name("create_original_assets.py")),
        "font_dependency": "Atkinson Hyperlegible, Braille Institute of America, OFL-1.1; see reference_manifest.json and game/assets/fonts/OFL.txt",
        "music_dependency": "Sunset Walk by KiluaBoy, CC0-1.0; separately recorded in assets/music_manifest.json, not authored by this generator.",
        "files": files,
    })


def verify_references(root=ROOT):
    manifest = json.loads((root / "assets/reference_manifest.json").read_text())
    if manifest.get("schema_version") != 1 or not manifest.get("downloads"):
        raise ValueError("invalid reference manifest")
    required = set(PACKS) | {"AtkinsonHyperlegible-Regular.ttf", "AtkinsonHyperlegible-Bold.ttf", "OFL.txt"}
    identifiers = [entry["id"] for entry in manifest["downloads"]]
    if set(identifiers) != required or len(identifiers) != len(required):
        raise ValueError("incomplete or unexpected reference downloads")
    for entry in manifest["downloads"] + manifest.get("selections", []) + manifest.get("licenses", []):
        checked_file(root, entry)
    return manifest


def music_manifest(root=ROOT):
    manifest = json.loads((root / "assets/music_manifest.json").read_text())
    if manifest.get("schema_version") != 1 or manifest.get("role") != "music.plaza":
        raise ValueError("invalid music manifest")
    for field in ("author", "source_page", "license"):
        if manifest.get(field) != MUSIC_ENTRY[field]:
            raise ValueError(f"invalid music provenance: {field}")
    for key, (path, url) in MUSIC_DOWNLOADS.items():
        if manifest[key].get("path") != path or manifest[key].get("url") != url:
            raise ValueError(f"unapproved music dependency: {key}")
    return manifest


def verify_music(root=ROOT):
    manifest = music_manifest(root)
    for key in MUSIC_DOWNLOADS:
        entry = manifest[key]
        path = checked_file(root, entry)
        if path.stat().st_size != entry["bytes"]:
            raise ValueError(f"music byte count mismatch: {entry['path']}")
    return manifest


def verify_catalog(root=ROOT, asset_set="original"):
    if asset_set not in ("original", "development"):
        raise ValueError(f"unknown asset set: {asset_set}")
    catalog = json.loads((root / f"game/assets/catalogs/{asset_set}.json").read_text())
    if catalog.get("schema_version") != 1 or catalog.get("asset_set") != asset_set:
        raise ValueError("invalid catalog schema or asset set")
    if set(catalog["assets"]) != REQUIRED_ROLES:
        raise ValueError("catalog roles do not match required contract")
    original = json.loads((root / "assets/original_manifest.json").read_text())
    known = {e["path"]: e for e in original["files"]}
    verify_music(root)
    if asset_set == "development":
        refs = verify_references(root)
        known.update({e["path"]: e for e in refs.get("selections", [])})
    for role, item in catalog["assets"].items():
        path = item["path"]
        if not path.startswith("res://assets/"):
            raise ValueError(f"invalid resource path: {path}")
        relative = path.removeprefix("res://")
        safe_path(root / "game", relative)
        if role == "music.plaza":
            if item != MUSIC_ENTRY:
                raise ValueError("invalid CC0 music role or provenance")
            continue
        font = role.startswith("font.")
        allowed = ("assets/fonts/",) if font else (("assets/original/",) if asset_set == "original" else ("assets/original/", "assets/development/"))
        if not relative.startswith(allowed):
            raise ValueError(f"forbidden resource in {asset_set}: {path}")
        if asset_set == "original" and item.get("origin") != ("dependency" if font else "team-original"):
            raise ValueError(f"non-original role: {role}")
        if font and item.get("license") != "OFL-1.1":
            raise ValueError(f"font license missing: {role}")
        entry = known.get("game/" + relative)
        if entry is None:
            raise ValueError(f"unregistered resource: {path}")
        checked_file(root, entry)
        if "region" in item:
            bounds = item.get("sheet_size", item.get("size"))
            regions = [item["region"]]
            for frames in item.get("animations", {}).values():
                regions.extend(frames)
            if not isinstance(bounds, list) or len(bounds) != 2 or any(type(n) is not int or n <= 0 for n in bounds):
                raise ValueError(f"invalid region bounds: {role}")
            for region in regions:
                if (not isinstance(region, list) or len(region) != 4
                        or any(type(n) is not int for n in region)
                        or min(region[:2]) < 0 or min(region[2:]) <= 0
                        or region[0] + region[2] > bounds[0]
                        or region[1] + region[3] > bounds[1]):
                    raise ValueError(f"invalid region: {role}: {region}")
    checked_file(root, known["game/assets/fonts/OFL.txt"])
    return catalog


def download(url, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".part")
    request = urllib.request.Request(url, headers={"User-Agent": "VocesDeLaPlaza-AssetAcquisition/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=90) as response, temporary.open("wb") as output:
            resolved_url = response.url
            shutil.copyfileobj(response, output)
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)
    return resolved_url


def acquire(root=ROOT):
    """Download the explicit free allowlist, retaining source bytes and licenses."""
    manifest = {"schema_version": 1, "downloads": [], "licenses": [], "selections": []}
    requests = [(pack, url, f"references/assets/{pack}.zip", "CC0-1.0", f"https://kenney.nl/assets/{pack}") for pack, url in PACKS.items()]
    for filename in ("AtkinsonHyperlegible-Regular.ttf", "AtkinsonHyperlegible-Bold.ttf", "OFL.txt"):
        requests.append((filename, FONT_BASE + filename, "game/assets/fonts/" + filename, "OFL-1.1", "https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegible"))
    for ident, url, relative, license_id, source in requests:
        path = safe_path(root, relative)
        print(f"Downloading {ident} ...", flush=True)
        resolved = download(url, path)
        manifest["downloads"].append({"id": ident, "url": url, "resolved_url": resolved, "source_page": source, "license": license_id, "author": "Kenney" if ident in PACKS else "Braille Institute of America", "retrieved_at_utc": utc_now(), "path": relative, "sha256": sha256(path), "bytes": path.stat().st_size, "usage": "reference-only" if ident in PACKS else "runtime-font-dependency"})
        if ident in PACKS:
            with zipfile.ZipFile(path) as archive:
                licenses = [n for n in archive.namelist() if PurePosixPath(n).name.lower() in ("license.txt", "license.md")]
                if not licenses:
                    raise ValueError(f"archive has no license: {ident}")
                for index, member in enumerate(licenses):
                    license_path = root / f"assets/licenses/{ident}-{index}.txt"
                    license_path.parent.mkdir(parents=True, exist_ok=True)
                    license_path.write_bytes(archive.read(member))
                    manifest["licenses"].append({"pack": ident, "archive_member": member, "path": license_path.relative_to(root).as_posix(), "sha256": sha256(license_path)})
        write_json(root / "assets/reference_manifest.json", manifest)
    acquire_music(root)
    make_development(root, manifest)
    record_original(root)
    verify_references(root)
    verify_catalog(root, "original")
    verify_catalog(root, "development")
    return manifest


def acquire_music(root=ROOT):
    """Restore only the approved, pinned OGG and CC0 text; never bless new bytes."""
    manifest = music_manifest(root)
    with tempfile.TemporaryDirectory(prefix="plaza-music-") as directory:
        staging = Path(directory)
        for key in MUSIC_DOWNLOADS:
            entry = manifest[key]
            download(entry["url"], staging / entry["path"])
            checked_file(staging, entry)
        for key in MUSIC_DOWNLOADS:
            relative = manifest[key]["path"]
            destination = safe_path(root, relative)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(staging / relative, destination)
    return verify_music(root)


def make_development(root, manifest):
    """Select a few actual reference bytes; all other roles stay team-original."""
    catalog = json.loads((root / "game/assets/catalogs/original.json").read_text())
    catalog["asset_set"] = "development"
    # Exact source member names are recorded after selection, never guessed at runtime.
    choices = (("tiny-town", "terrain.grass", "Tiles/tile_0000.png"), ("roguelike-characters", "character.player", "Spritesheet/roguelikeChar_transparent.png"), ("ui-pack", None, "PNG/Blue/Default/button_rectangle_flat.png"), ("interface-sounds", "sound.select", "Audio/click_001.ogg"))
    for pack, role, member in choices:
        suffix = PurePosixPath(member).suffix
        with zipfile.ZipFile(root / f"references/assets/{pack}.zip") as archive:
            if member not in archive.namelist():
                raise ValueError(f"approved member missing from {pack}: {member}")
            relative = f"game/assets/development/{pack}{suffix}"
            destination = safe_path(root, relative)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(member))
            manifest["selections"].append({"pack": pack, "role": role, "archive_member": member, "path": relative, "sha256": sha256(destination), "bytes": destination.stat().st_size, "usage": "reference-only"})
            if role:
                # Reference sprite dimensions are independent of the original sheet.
                item = {"path": "res://" + relative.removeprefix("game/"), "origin": "reference", "license": "CC0-1.0", "source_pack": pack}
                if suffix == ".png":
                    import struct
                    width, height = struct.unpack(">II", destination.read_bytes()[16:24])
                    item.update({"size": [width, height], "region": [0, 0, width, height]})
                    if pack == "roguelike-characters":
                        item.update({"size": [16, 16], "sheet_size": [width, height], "region": [0, 0, 16, 16], "frame_size": [16, 16], "margin": 1})
                catalog["assets"][role] = item
    write_json(root / "game/assets/catalogs/development.json", catalog)
    write_json(root / "assets/reference_manifest.json", manifest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("fetch", "fetch-music", "verify", "record-original"))
    parser.add_argument("--asset-set", choices=("original", "development"), default="original")
    args = parser.parse_args()
    try:
        if args.command == "fetch":
            acquire()
        elif args.command == "fetch-music":
            acquire_music()
        elif args.command == "record-original":
            record_original()
        else:
            verify_references()
            verify_catalog(ROOT, args.asset_set)
        print(f"Assets OK ({args.command}, {args.asset_set})")
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as error:
        print(f"Asset validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
