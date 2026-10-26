#!/usr/bin/env python3
"""Verify assets, stage only the selected catalog, and export through tools/godot."""
import argparse
import os
import json
import re
from pathlib import Path
import shutil
import subprocess
import sys

if __package__:
    from . import assets
else:
    import assets

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".godot", ".git", "tests", "test", "references", "development", "gut", "GUT", "__pycache__"}


def run_godot(command, root, environment, log_name):
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True)
    evidence = root / "build/evidence"
    evidence.mkdir(parents=True, exist_ok=True)
    log = result.stdout + result.stderr
    (evidence / log_name).write_text(log, encoding="utf-8")
    if result.returncode or "SCRIPT ERROR:" in log or "\nERROR:" in log:
        print(log, file=sys.stderr)
        raise ValueError(f"Godot failed; inspect build/evidence/{log_name}")


def stage_project(root=ROOT, target="web", asset_set="original", *, verify_downloads=True):
    if target not in ("web", "linux") or asset_set not in ("original", "development"):
        raise ValueError("unknown target or asset set")
    # Provenance verification is mandatory for every CLI export, even originals.
    if verify_downloads:
        assets.verify_references(root)
    catalog = assets.verify_catalog(root, asset_set)
    game = root / "game"
    if not (game / "project.godot").is_file():
        raise ValueError("missing game/project.godot; Main must bootstrap the game first")
    stage = root / f"build/staging-{target}"
    if stage.is_symlink():
        raise ValueError("staging directory may not be a symlink")
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir(parents=True)
    for source in sorted(game.rglob("*")):
        relative = source.relative_to(game)
        if "assets" == relative.parts[0] or set(relative.parts) & EXCLUDED:
            continue
        if source.is_symlink():
            raise ValueError(f"game source symlink is not allowed: {relative}")
        if source.is_file():
            if asset_set == "original" and source.suffix in (".gd", ".tscn", ".tres", ".godot", ".cfg", ".json"):
                text = source.read_text(encoding="utf-8")
                if any(prefix in text for prefix in ("res://assets/development/", "res://references/", "res://addons/gut/", "res://tests/")):
                    raise ValueError(f"reference/test resource in production source: {relative}")
            destination = stage / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
    paths = {item["path"].removeprefix("res://") for item in catalog["assets"].values()}
    paths.add("assets/fonts/OFL.txt")
    for relative in sorted(paths):
        source = assets.safe_path(game, relative)
        destination = assets.safe_path(stage, relative)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        # Reuse only selected resources' verified local import artifacts. This
        # avoids a Godot 4.7.2 headless font-compression stall observed in a clean
        # staging import; timestamps/content stay identical to the source files.
        metadata = source.with_name(source.name + ".import")
        if metadata.is_file():
            text = metadata.read_text(encoding="utf-8")
            match = re.search(r"dest_files=(\[.*?\])", text)
            if match:
                imported = json.loads(match.group(1))
                for resource in imported:
                    if not resource.startswith("res://.godot/imported/"):
                        raise ValueError("invalid imported resource path")
                    cache_relative = resource.removeprefix("res://")
                    cache_source = assets.safe_path(game, cache_relative)
                    cache_target = assets.safe_path(stage, cache_relative)
                    cache_target.parent.mkdir(parents=True, exist_ok=True)
                    if cache_source.is_file():
                        shutil.copy2(cache_source, cache_target)
                        md5 = cache_source.with_suffix(".md5")
                        if md5.is_file():
                            shutil.copy2(md5, cache_target.with_suffix(".md5"))
                shutil.copy2(metadata, destination.with_name(destination.name + ".import"))
    assets.write_json(stage / "assets/active_catalog.json", catalog)
    # Keep the selected named catalog for Main's explicit fallback.
    assets.write_json(stage / f"assets/catalogs/{asset_set}.json", catalog)
    assets.write_json(stage / "assets/export_manifest.json", {"schema_version": 1, "asset_set": asset_set, "target": target, "files": [{"path": path, "sha256": assets.sha256(stage / path)} for path in sorted(paths)]})
    return stage


def export(root=ROOT, target="web", asset_set="original"):
    stage = stage_project(root, target, asset_set)
    wrapper = root / "tools/godot"
    if not wrapper.is_file():
        raise ValueError("tools/godot is not installed; run Main's bootstrap first")
    environment = os.environ.copy()
    environment["XDG_DATA_HOME"] = str(root / ".tools/share")
    base = [str(wrapper), "--headless", "--path", str(stage)]
    run_godot(base + ["--editor", "--import", "--quit"], root, environment, f"{target}-import.log")
    output = root / ("build/web/game/index.html" if target == "web" else "build/linux/voces-de-la-plaza.x86_64")
    output.parent.mkdir(parents=True, exist_ok=True)
    run_godot(base + ["--export-release", "Web" if target == "web" else "Linux", str(output)], root, environment, f"{target}-export.log")
    if target == "web":
        for source in sorted((root / "web").rglob("*")):
            relative = source.relative_to(root / "web")
            if source.is_file() and not (set(relative.parts) & (EXCLUDED | {"node_modules", "game", "content"})):
                destination = root / "build/web" / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
        content = root / "game/content"
        if content.exists():
            shutil.copytree(content, root / "build/web/content", dirs_exist_ok=True)
        for name in ["classroom.html", "classroom-handout.html", "classroom-handout.pdf"]:
            resource = root / "submission" / name
            if not resource.is_file():
                raise ValueError(f"Missing classroom resource {name}; run node tools/render_submission.mjs --handout-only")
            shutil.copy2(resource, root / "build/web" / name)
    license_dir = root / ("build/web/licenses" if target == "web" else "build/linux/licenses")
    license_dir.mkdir(parents=True, exist_ok=True)
    for name in ["GODOT_LICENSE.txt", "GODOT_COPYRIGHT.txt", "THIRD_PARTY_NOTICES.txt", "assets/fonts/OFL.txt"]:
        source = root / "game" / name
        if source.is_file():
            shutil.copy2(source, license_dir / source.name)
    print(f"Export complete ({asset_set}): {output}")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", choices=("web", "linux"), required=True)
    parser.add_argument("--asset-set", choices=("original", "development"), default="original")
    parser.add_argument("--stage-only", action="store_true", help="verify and stage without invoking Godot")
    args = parser.parse_args()
    try:
        if args.stage_only:
            print(stage_project(ROOT, args.target, args.asset_set))
        else:
            export(ROOT, args.target, args.asset_set)
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print(f"Export failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
