"""Assemble the local review candidate without tools, raw data or reference packs."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", ".tools", ".godot", "__pycache__", "development", "node_modules", "gut"}


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    team = json.loads((ROOT / "submission/team.json").read_text())
    if not team.get("team_name") or team.get("track") != "Reto 3":
        raise ValueError("A confirmed team name and track are required")
    required = ["build/web/index.html", "build/web/game/index.pck", "build/web/game/index.wasm",
                "build/linux/voces-de-la-plaza.x86_64", "build/linux/voces-de-la-plaza.pck",
                "submission/voces_narrativa_y_difusion.pdf", "submission/voces_presentacion.pdf",
                "submission/voces_pitch_borrador.mp4", "submission/classroom-handout.pdf",
                "build/web/classroom.html", "build/evidence/browser-results.json", "build/evidence/native-window.json",
                "build/evidence/godot-web-journey.json"]
    for relative in required:
        if not (ROOT / relative).is_file():
            raise ValueError(f"Candidate missing required local output: {relative}")
    verification_path = ROOT / "build/evidence/verification.json"
    verification = json.loads(verification_path.read_text())
    for source in verification["tested_sources"] + verification["tested_outputs"]:
        if checksum(ROOT / source["path"]) != source["sha256"]:
            raise ValueError(f"Source changed since verification: {source['path']}; rerun tools/verify.py")
    native = json.loads((ROOT / "build/evidence/native-window.json").read_text())
    canvas = json.loads((ROOT / "build/evidence/godot-web-journey.json").read_text())
    if native["status"] != "passed" or native["pack_sha256"] != checksum(ROOT / "build/linux/voces-de-la-plaza.pck"):
        raise ValueError("Native-window evidence does not match the current export")
    if canvas["status"] != "passed" or canvas["served_pack_sha256"] != checksum(ROOT / "build/web/game/index.pck"):
        raise ValueError("Canvas-journey evidence does not match the current export")
    pitch = json.loads((ROOT / "build/evidence/pitch-encoding.json").read_text())
    if pitch["output_sha256"] != checksum(ROOT / "submission/voces_pitch_borrador.mp4"):
        raise ValueError("Pitch recording hash mismatch")
    for source in pitch["inputs"]:
        if source["sha256"] != checksum(ROOT / source["source"]):
            raise ValueError(f"Pitch shows an older input: {source['source']}")
    files = set()
    files.add(ROOT / ".tools/toolchain.json")
    files.add(ROOT / "submission/team.json")
    for relative in ["docs", "tasks", "tools", "tests", "game", "web", "assets", "build/web", "build/linux", "submission/forms"]:
        for path in (ROOT / relative).rglob("*"):
            if path.is_file() and not (set(path.relative_to(ROOT).parts) & EXCLUDE):
                if path.is_symlink():
                    raise ValueError(f"Unexpected symlink: {path}")
                files.add(path)
    for pattern in ["README.md", "AGENTS.md", "CAPABILITY_MAP.md", "SPEC-*.md", ".gitignore", "data/*.json",
                    "submission/*.pdf", "submission/*.mp4", "submission/*.html", "submission/*.srt", "submission/*.txt",
                    "build/evidence/*.json", "build/evidence/*.log", "build/evidence/godot-*.png", "build/evidence/native-*.png", "build/evidence/html-overview.png", "build/evidence/html-desktop.png",
                    "build/evidence/assistive-workshop-final/*", "build/evidence/assistive-*/assistive-run.json"]:
        files.update(p for p in ROOT.glob(pattern) if p.is_file())
    # Preserve the small research originals required by the recorded references.
    for pattern in ["INEhack_*.md", "INEhack_*.docx", "INEhack_Research_Annex.zip", "Rúbrica*.pdf"]:
        files.update(ROOT.glob(pattern))
    # The clean-unpack receipt identifies the finished ZIP and lives beside it;
    # including it would create a recursive archive/hash dependency.
    files.discard(ROOT / "build/evidence/clean-candidate.json")
    files.discard(ROOT / "build/evidence/clean-candidate.log")
    dataset = json.loads((ROOT / "game/content/ccpc.json").read_text())
    manifest = {"schema_version": "1.0.0", "title": "Voces de la Plaza", "track": "Reto 3",
                "status": "local-review-candidate", "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "team_name": team["team_name"], "working_tree": "uncommitted", "godot_version": "4.7.2.stable",
                "data": {"source_sha256": dataset["source"]["sha256"], "rows": dataset["validation"]["rows"], "aggregates": len(dataset["records"])},
                "tests": {**verification["unit_tests"], "gut_assertions": verification["gut_assertions"]},
                "external_readiness": {"signed_letters": "pending-team; official blank forms included", "hosting": "pending-authorization", "deadline_timezone": "unconfirmed", "user_pilot": "not-run", "formal_screen_reader_evaluation": "not-run; scoped Orca observations in docs/accessibility_review.md"},
                "files": [{"path": p.relative_to(ROOT).as_posix(), "bytes": p.stat().st_size, "sha256": checksum(p)} for p in sorted(files)]}
    report = ROOT / "submission/release_manifest.json"
    report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    files.add(report)
    output = ROOT / "submission/Latas_Reto_3.zip"
    with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=6) as archive:
        for path in sorted(files):
            archive.write(path, path.relative_to(ROOT).as_posix())
    with ZipFile(output) as archive:
        bad = archive.testzip()
        if bad:
            raise ValueError(f"Candidate integrity failed: {bad}")
    print(f"Candidate: {output.relative_to(ROOT)} · {len(files)} files · {output.stat().st_size / 1024 ** 2:.1f} MiB")
    print("Local review candidate for Latas: signed letters, hosting and external readiness remain pending.")


if __name__ == "__main__":
    main()
