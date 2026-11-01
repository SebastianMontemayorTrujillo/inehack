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
DELIVERY_TESTS = ["test_assets.py", "test_data.py", "test_content.py", "test_campaign_pdf.py", "test_godot_delivery.py",
                  "__init__.py", "native_window_smoke.py", "native_pdf_save_smoke.py", "runtime_pdf_check.py",
                  "native_journey.gd", "godot_browser_smoke.mjs", "godot_boot_smoke.mjs", "campaign_pdf_samples.gd", "inspect_campaign_pdf.py"]


def fingerprint_sources():
    paths = set()
    for directory in ["game/scripts", "game/scenes", "game/tests", "game/content", "game/assets"]:
        paths.update(path for path in (ROOT / directory).rglob("*") if "development" not in path.parts
                     and path.is_file() and path.suffix in [".gd", ".tscn", ".json", ".html", ".css", ".mjs", ".py", ".svg", ".wav", ".ogg", ".ttf", ".txt"])
    paths.update(ROOT / "tests" / path for path in DELIVERY_TESTS if (ROOT / "tests" / path).is_file())
    paths.update(p for p in (ROOT / "tests/fixtures").rglob("*.json"))
    paths.update(ROOT / path for path in ["game/project.godot", "game/export_presets.cfg", "tools/export_game.py", "tools/verify.py",
                                         "tools/godot_web_shell_es.html", "tools/pagina_inicio_es.html", "tools/LEEME_WEB_es.md",
                                         "tools/package_candidate.py", "tools/check_candidate.py", "JUGAR.py", "JUGAR_WEB.sh", "JUGAR_LINUX.sh", "JUGAR_WINDOWS.cmd"])
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
    results.append(run("godot-tests", ["./tools/godot", "--headless", "--path", "game", "-s", "addons/gut/gut_cmdln.gd", "-gdir=res://tests", "-gexit"]))
    if args.build:
        for target in ["web", "linux"]:
            results.append(run(f"{target}-build", [sys.executable, "tools/export_game.py", "--target", target, "--asset-set", "original"], 180))
    if (ROOT / "build/linux/voces-de-la-plaza.x86_64").exists():
        results.append(run("linux-boot", ["build/linux/voces-de-la-plaza.x86_64", "--headless", "--quit-after", "10"]))
        results.append(run("compiled-pack-journeys", ["./tools/godot", "--headless", "--main-pack", "build/linux/voces-de-la-plaza.pck", "--script", str(ROOT / "tests/native_journey.gd")], 30))
    if args.browser:
        results.append(run("godot-boot", ["node", "tests/godot_boot_smoke.mjs"], 180))
    if args.native_window:
        # Physical visits, full-poster scroll comparisons and both FIN text sizes
        # extend the journey. The harness keeps its strict 2.5-second reveal gate.
        results.append(run("native-window-tests", [sys.executable, "tests/native_window_smoke.py"], 600))
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
              "gut": int(re.search(r"\nTests\s+(\d+)", (logs / "godot-tests.log").read_text())[1])}
    assertions = int(re.search(r"\nAsserts\s+(\d+)", (logs / "godot-tests.log").read_text())[1])
    report = {"created_at_utc": datetime.now(timezone.utc).isoformat(), "delivery": "godot-only", "results": results,
              "unit_tests": counts, "gut_assertions": assertions, "tested_sources": tested, "tested_outputs": outputs,
              "scope": "Entrega exclusiva de Godot; la ruta HTML independiente y sus pruebas quedan fuera del producto actual",
              "limits": ["Sin pilotaje con participantes; la interacción automatizada no demuestra aprendizaje",
                         "No se acredita acceso al canvas con lectores de pantalla; las observaciones HTML anteriores son históricas"]}
    (ROOT / "build/evidence/verification.json").write_text(json.dumps(report, indent=2) + "\n")
    print("Verification evidence: build/evidence/verification.json")


if __name__ == "__main__":
    main()
