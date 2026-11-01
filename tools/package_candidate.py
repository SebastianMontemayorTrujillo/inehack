"""Construye la entrega local exclusiva de Godot con materiales actuales en español."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

if __package__:
    from .verify import DELIVERY_TESTS
else:
    from verify import DELIVERY_TESTS

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", ".tools", ".godot", "__pycache__", "development", "node_modules", "gut"}
DOCS = [
    "entrega_solo_godot_es.md", "arquitectura_godot_es.md", "datos_y_creditos_es.md",
    "verificacion_final_godot_es.md", "revision_final_godot_es.md",
    "presentacion_final_es.md", "guion_video_godot_es.md", "revision_humana_final_es.md",
    "deck_outline_es.md", "storyline_and_dissemination_es.md", "facilitator.md",
    "classroom_handout.md", "pitch_script_es.md", "institutional_reuse.md", "product_brief.md",
    "glossary_es_MX.md", "fuentes_convocatoria_es.md",
]
TOOL_FILES = [
    "assets.py", "bootstrap.py", "build_data.py", "build_campaign_font.py",
    "create_original_assets.py", "export_game.py", "verify.py", "package_candidate.py",
    "check_candidate.py", "godot", "browser-package.json", "pdf-requirements.txt",
    "godot_web_shell_es.html", "pagina_inicio_es.html", "LEEME_WEB_es.md",
    "render_submission.mjs", "record_pitch_godot.mjs",
]
OUTPUTS = [
    "voces_narrativa_y_difusion.pdf", "voces_presentacion.pdf", "classroom-handout.pdf", "classroom.pdf",
    "cartel_ciudadano_ejemplo.pdf", "voces_demo_godot.mp4", "demo_godot.srt",
    "demo_godot_transcripcion.txt", "team.json",
]


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_evidence():
    evidence = ROOT / "build/evidence"
    verification = json.loads((evidence / "verification.json").read_text())
    require(verification.get("delivery") == "godot-only", "Falta la verificación de esta entrega exclusiva de Godot")
    for item in verification["tested_sources"] + verification["tested_outputs"]:
        require(checksum(ROOT / item["path"]) == item["sha256"], f"Cambió un archivo verificado: {item['path']}")
    native = json.loads((evidence / "native-window.json").read_text())
    canvas = json.loads((evidence / "godot-web-journey.json").read_text())
    pdf = json.loads((evidence / "native-pdf-save.json").read_text())
    review = json.loads((evidence / "godot-only-review.json").read_text())
    require(review["status"] == "passed", "La revisión final independiente tiene bloqueos pendientes")
    require(native["status"] == canvas["status"] == pdf["status"] == "passed", "Faltan recorridos Godot/PDF aprobados")
    require(native["pack_sha256"] == checksum(ROOT / "build/linux/voces-de-la-plaza.pck"), "El recorrido Linux pertenece a otro PCK")
    require(canvas["served_pack_sha256"] == checksum(ROOT / "build/web/game/index.pck"), "El recorrido del navegador pertenece a otro PCK")
    require(native["test_sha256"] == checksum(ROOT / "tests/native_window_smoke.py"), "El recorrido Linux usa otro arnés")
    require(canvas["test_sha256"] == checksum(ROOT / "tests/godot_browser_smoke.mjs"), "El recorrido web usa otro arnés")
    require(pdf["pdfs"][0]["sha256"] == checksum(ROOT / "submission/cartel_ciudadano_ejemplo.pdf"), "El ejemplo no coincide con el PDF guardado")
    video = json.loads((evidence / "godot-demo-encoding.json").read_text())
    require(video["status"] == "passed" and video["duration_seconds"] <= 150, "Falta la revisión del video Godot de hasta 150 segundos")
    require(video["output"]["path"] == "submission/voces_demo_godot.mp4", "Nombre incorrecto del video Godot")
    require(video["output"]["sha256"] == checksum(ROOT / video["output"]["path"]), "Cambió el video revisado")
    require(any(row["path"] == "build/web/game/index.pck" for row in video["inputs"]), "El video no identifica su export Godot")
    for row in video["inputs"]:
        require(checksum(ROOT / row["path"]) == row["sha256"], f"El video utiliza una entrada anterior: {row['path']}")
    return verification


def main():
    team = json.loads((ROOT / "submission/team.json").read_text())
    require(team.get("team_name") == "Latas" and team.get("track") == "Reto 3", "Equipo/reto incorrectos")
    verification = validate_evidence()
    files = set()
    for relative in ["game", "assets", "build/web", "build/linux", "submission/forms"]:
        for path in (ROOT / relative).rglob("*"):
            if path.is_file() and not (set(path.relative_to(ROOT).parts) & EXCLUDE):
                require(not path.is_symlink(), f"Enlace simbólico inesperado: {path}")
                files.add(path)
    explicit = ["README.md", "JUGAR.py", "JUGAR_WEB.sh", "JUGAR_LINUX.sh", "JUGAR_WINDOWS.cmd",
                ".gitattributes", ".gitignore", ".tools/toolchain.json", "deploy/nginx_godot.conf"]
    explicit += ["docs/" + name for name in DOCS]
    explicit += ["tools/" + name for name in TOOL_FILES]
    explicit += ["tests/" + name for name in DELIVERY_TESTS if (ROOT / "tests" / name).is_file()]
    explicit += ["submission/" + name for name in OUTPUTS]
    for relative in explicit:
        path = ROOT / relative
        require(path.is_file() and not path.is_symlink(), f"Falta un archivo de entrega: {relative}")
        files.add(path)
    for pattern in ["tests/fixtures/*.json", "data/*.json", "Rúbrica*.pdf",
                    "build/evidence/godot-only-*.json", "build/evidence/godot-only-*.log",
                    "build/evidence/godot-only-*.png", "build/evidence/native-*.png",
                    "build/evidence/godot-web-*.png", "build/evidence/native-campaign*.pdf",
                    "build/evidence/godot-web-campaign.pdf", "build/media-review-godot-2026-10-31/*review.json"]:
        files.update(path for path in ROOT.glob(pattern) if path.is_file())
    for name in ["verification.json", "native-window.json", "native-pdf-save.json", "godot-web-journey.json",
                 "godot-demo-encoding.json", "godot-only-review.json", "python-tests.log", "godot-tests.log",
                 "linux-boot.log", "compiled-pack-journeys.log", "godot-boot.log"]:
        path = ROOT / "build/evidence" / name
        require(path.is_file(), f"Falta el recibo {name}")
        files.add(path)
    # No incluir recibos de otra versión ni la aplicación retirada.
    require(not any(p.relative_to(ROOT).as_posix().startswith("web/") for p in files), "Se incluyó la ruta retirada")
    require(not (ROOT / "build/web/app.mjs").exists(), "Quedan residuos de la ruta retirada")
    dataset = json.loads((ROOT / "game/content/ccpc.json").read_text())
    manifest = {
        "schema_version": "2.0.0", "delivery": "godot-only", "title": "Voces de la Plaza",
        "team_name": team["team_name"], "track": "Reto 3", "status": "candidato-local-revisado",
        "created_at_utc": datetime.now(timezone.utc).isoformat(), "language": "es",
        "godot_version": "4.7.2.stable", "working_tree": "sin commit solicitado",
        "data": {"source_sha256": dataset["source"]["sha256"], "rows": dataset["validation"]["rows"], "aggregates": len(dataset["records"])},
        "tests": {**verification["unit_tests"], "gut_assertions": verification["gut_assertions"]},
        "external_readiness": {"signed_letters": "pendientes del equipo", "hosting": "no realizado", "submission": "no realizada",
                               "participant_pilot": "no realizado", "screen_reader_canvas": "no acreditado"},
        "files": [{"path": path.relative_to(ROOT).as_posix(), "bytes": path.stat().st_size, "sha256": checksum(path)} for path in sorted(files)],
    }
    manifest_path = ROOT / "submission/release_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    files.add(manifest_path)
    output = ROOT / "submission/Latas_Reto_3.zip"
    with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=6) as archive:
        for path in sorted(files):
            archive.write(path, path.relative_to(ROOT).as_posix())
    with ZipFile(output) as archive:
        require(archive.testzip() is None, "Falló la integridad CRC del ZIP")
    print(f"Entrega Godot: {output.relative_to(ROOT)} · {len(files)} archivos · {output.stat().st_size / 1024 ** 2:.1f} MiB")
    print("Materiales en español. Firma, alojamiento y envío pendientes del equipo.")


if __name__ == "__main__":
    main()
