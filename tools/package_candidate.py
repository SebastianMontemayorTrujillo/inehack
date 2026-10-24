"""Assemble the local review candidate without tools, raw data or reference packs."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", ".tools", ".godot", "__pycache__", "development", "node_modules", "gut"}


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    required = ["build/web/index.html", "build/web/game/index.pck", "build/web/game/index.wasm",
                "build/linux/voces-de-la-plaza.x86_64", "build/linux/voces-de-la-plaza.pck",
                "submission/voces_narrativa_y_difusion.pdf", "submission/voces_presentacion.pdf",
                "submission/voces_pitch_borrador.mp4", "build/evidence/browser-results.json"]
    for relative in required:
        if not (ROOT / relative).is_file():
            raise ValueError(f"Candidate missing required local output: {relative}")
    verification_path = ROOT / "build/evidence/verification.json"
    verification = json.loads(verification_path.read_text())
    for source in verification["tested_sources"]:
        if checksum(ROOT / source["path"]) != source["sha256"]:
            raise ValueError(f"Source changed since verification: {source['path']}; rerun tools/verify.py")
    for folder in ["build/web/licenses", "build/linux/licenses"]:
        destination = ROOT / folder
        destination.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / "game/GODOT_COPYRIGHT.txt", destination / "GODOT_COPYRIGHT.txt")
    files = set()
    files.add(ROOT / ".tools/toolchain.json")
    for relative in ["docs", "tasks", "tools", "tests", "game", "web", "assets", "build/web", "build/linux"]:
        for path in (ROOT / relative).rglob("*"):
            if path.is_file() and not (set(path.relative_to(ROOT).parts) & EXCLUDE):
                if path.is_symlink():
                    raise ValueError(f"Unexpected symlink: {path}")
                files.add(path)
    for pattern in ["README.md", "AGENTS.md", "CAPABILITY_MAP.md", "SPEC-*.md", ".gitignore", "data/*.json",
                    "submission/*.pdf", "submission/*.mp4", "submission/*.html", "submission/*.srt", "submission/*.txt",
                    "build/evidence/*.json", "build/evidence/*.log", "build/evidence/godot-*.png", "build/evidence/html-overview.png", "build/evidence/html-desktop.png"]:
        files.update(p for p in ROOT.glob(pattern) if p.is_file())
    # Preserve the small research originals required by the recorded references.
    for pattern in ["INEhack_*.md", "INEhack_*.docx", "INEhack_Research_Annex.zip", "Rúbrica*.pdf"]:
        files.update(ROOT.glob(pattern))
    dataset = json.loads((ROOT / "game/content/ccpc.json").read_text())
    manifest = {"schema_version": "1.0.0", "title": "Voces de la Plaza", "track": "Reto 3",
                "status": "local-review-candidate", "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "team_name": None, "working_tree": "uncommitted", "godot_version": "4.7.2.stable",
                "data": {"source_sha256": dataset["source"]["sha256"], "rows": dataset["validation"]["rows"], "aggregates": len(dataset["records"])},
                "tests": {**verification["unit_tests"], "gut_assertions": verification["gut_assertions"]},
                "external_readiness": {"signed_letters": "pending-team", "hosting": "pending-authorization", "deadline_timezone": "unconfirmed", "user_pilot": "not-run", "screen_reader_review": "not-run"},
                "files": [{"path": p.relative_to(ROOT).as_posix(), "bytes": p.stat().st_size, "sha256": checksum(p)} for p in sorted(files)]}
    report = ROOT / "submission/release_manifest.json"
    report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    files.add(report)
    output = ROOT / "submission/voces_de_la_plaza_Reto_3_candidato.zip"
    with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=6) as archive:
        for path in sorted(files):
            archive.write(path, path.relative_to(ROOT).as_posix())
    with ZipFile(output) as archive:
        bad = archive.testzip()
        if bad:
            raise ValueError(f"Candidate integrity failed: {bad}")
    print(f"Candidate: {output.relative_to(ROOT)} · {len(files)} files · {output.stat().st_size / 1024 ** 2:.1f} MiB")
    print("Local review candidate only: team name, signed letters, hosting and external readiness remain pending.")


if __name__ == "__main__":
    main()
