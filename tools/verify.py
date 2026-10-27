"""Run the candidate's actual checks and retain their complete output."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
import re
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def fingerprint_sources():
    paths = set()
    for directory in ["game/scripts", "game/scenes", "game/tests", "game/content", "game/assets", "web", "tests"]:
        paths.update(path for path in (ROOT / directory).rglob("*") if "development" not in path.parts
                     and path.is_file() and path.suffix in [".gd", ".tscn", ".json", ".html", ".css", ".mjs", ".py", ".svg", ".wav", ".ogg", ".ttf", ".txt"])
    paths.update(ROOT / path for path in ["game/project.godot", "game/export_presets.cfg", "tools/export_game.py", "tools/verify.py"])
    return [{"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()} for path in sorted(paths)]


def run(name, command, timeout=120):
    environment = os.environ.copy()
    environment["XDG_DATA_HOME"] = str(ROOT / ".tools/share")
    result = subprocess.run(command, cwd=ROOT, env=environment, capture_output=True, text=True, timeout=timeout)
    log = result.stdout + result.stderr
    output = ROOT / f"build/evidence/{name}.log"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(log)
    if result.returncode or "SCRIPT ERROR:" in log or "\nERROR:" in log or "Failing Tests" in log or re.search(r"\b[1-9]\d* orphans\b", log):
        print(log)
        raise RuntimeError(f"{name} failed; see {output.relative_to(ROOT)}")
    print(f"PASS · {name}", flush=True)
    return {"check": name, "command": command, "returncode": result.returncode, "log": output.relative_to(ROOT).as_posix()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build", action="store_true", help="also create both original-catalog exports")
    parser.add_argument("--browser", action="store_true", help="requires local preview server on port 8765")
    parser.add_argument("--native-window", action="store_true", help="exercise Linux GUI using local Xvfb/xdotool tools")
    parser.add_argument("--godot-browser", action="store_true", help="exercise the exported canvas journey with real browser controls")
    args = parser.parse_args()
    source_start = fingerprint_sources()
    results = []
    results.append(run("python-tests", [sys.executable, "-m", "unittest", "discover", "-s", "tests"]))
    results.append(run("node-tests", ["node", "--test", "--test-isolation=none", *[str(path.relative_to(ROOT)) for path in sorted((ROOT / "tests").glob("*.test.mjs"))]]))
    results.append(run("godot-tests", ["./tools/godot", "--headless", "--path", "game", "-s", "addons/gut/gut_cmdln.gd", "-gdir=res://tests", "-gexit"]))
    if args.build:
        for target in ["web", "linux"]:
            results.append(run(f"{target}-build", [sys.executable, "tools/export_game.py", "--target", target, "--asset-set", "original"], 180))
    if (ROOT / "build/linux/voces-de-la-plaza.x86_64").exists():
        results.append(run("linux-boot", ["build/linux/voces-de-la-plaza.x86_64", "--headless", "--quit-after", "10"]))
        results.append(run("compiled-pack-journeys", ["./tools/godot", "--headless", "--main-pack", "build/linux/voces-de-la-plaza.pck", "--script", str(ROOT / "tests/native_journey.gd")], 30))
    if args.browser:
        results.append(run("browser-smoke", ["node", "tests/browser_smoke.mjs"], 180))
        results.append(run("browser-campaign", ["node", "tests/browser_campaign.mjs"], 180))
    if args.native_window:
        # The WASD journey physically walks every route; no teleport shortcuts.
        results.append(run("native-window-tests", [sys.executable, "tests/native_window_smoke.py"], 480))
        results.append(run("native-pdf-save", [sys.executable, "tests/native_pdf_save_smoke.py"], 300))
    if args.godot_browser:
        # The fourth mission adds a physical return, PDF download and dialogue
        # checks. Allow its 900-second watchdog to retain a failure receipt.
        results.append(run("godot-browser-journey", ["node", "tests/godot_browser_smoke.mjs"], 930))
    tested = fingerprint_sources()
    if tested != source_start:
        raise RuntimeError("Sources changed during verification; freeze the revision and rerun")
    outputs = [{"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
               for directory in ["build/web", "build/linux"] for path in sorted((ROOT / directory).rglob("*")) if path.is_file()]
    logs = ROOT / "build/evidence"
    counts = {"python": int(re.search(r"Ran (\d+) tests?", (logs / "python-tests.log").read_text())[1]),
              "node": int(re.search(r"\btests\s+(\d+)", (logs / "node-tests.log").read_text())[1]),
              "gut": int(re.search(r"\nTests\s+(\d+)", (logs / "godot-tests.log").read_text())[1])}
    assertions = int(re.search(r"\nAsserts\s+(\d+)", (logs / "godot-tests.log").read_text())[1])
    report = {"created_at_utc": datetime.now(timezone.utc).isoformat(), "results": results,
              "unit_tests": counts, "gut_assertions": assertions, "tested_sources": tested, "tested_outputs": outputs,
              "limits": ["No participant pilot; automated interaction is not human learning evidence", "Screen-reader observations are recorded separately when available"]}
    (ROOT / "build/evidence/verification.json").write_text(json.dumps(report, indent=2) + "\n")
    print("Verification evidence: build/evidence/verification.json")


if __name__ == "__main__":
    main()
