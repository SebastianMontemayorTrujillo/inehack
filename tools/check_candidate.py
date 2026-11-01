"""Verifica el ZIP Godot extraído y conserva fuera su recibo de aceptación."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shlex
import shutil
import signal
import stat
import subprocess
import sys
import tempfile
import time
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
RECEIPTS = {"build/evidence/clean-candidate.json", "build/evidence/clean-candidate.log"}
MANIFEST = "submission/release_manifest.json"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def safe_name(name):
    require(isinstance(name, str) and name and not any(c in name for c in "\\:\0"), f"Unsafe path: {name!r}")
    require(all(part not in ("", ".", "..") for part in name.removesuffix("/").split("/")), f"Unsafe path: {name!r}")
    return name.removesuffix("/")


def extract_verified(archive, destination):
    """Validate the full namespace before extracting into a new empty directory."""
    with ZipFile(archive) as zipped:
        members = {}
        for item in zipped.infolist():
            name = safe_name(item.filename)
            kind = stat.S_IFMT(item.external_attr >> 16)
            require(item.orig_filename == item.filename and name not in members, f"Ambiguous ZIP member: {name}")
            require(kind in (0, stat.S_IFDIR if item.is_dir() else stat.S_IFREG), f"Special ZIP member: {name}")
            require(not item.flag_bits & 1, f"Encrypted ZIP member: {name}")
            members[name] = item
        files = {name for name, item in members.items() if not item.is_dir()}
        require(not RECEIPTS.intersection(members), "Clean-check JSON/log must remain external companions")
        require(all(str(parent) not in files for name in members for parent in PurePosixPath(name).parents), "File/directory collision")
        require(zipped.testzip() is None, "ZIP CRC failure")
        manifest = json.loads(zipped.read(MANIFEST))
        require(manifest.get("team_name") == "Latas" and manifest.get("track") == "Reto 3", "Wrong team/track")
        entries = {safe_name(entry["path"]): entry for entry in manifest["files"]}
        require(all(name == entry["path"] for name, entry in entries.items()), "Noncanonical manifest path")
        require(len(entries) == len(manifest["files"]) and set(entries) == files - {MANIFEST}, "Manifest coverage/duplicates mismatch")
        destination.mkdir()  # Refuse an existing destination, including a symlink.
        zipped.extractall(destination)
    for name, entry in entries.items():
        path = destination / name
        require(path.stat().st_size == entry["bytes"] and checksum(path) == entry["sha256"], f"Manifest mismatch: {name}")
    return manifest


def inventory(root, paths):
    return [{"path": str(path), "bytes": (root / path).stat().st_size, "sha256": checksum(root / path)} for path in sorted(paths)]


def runtimes(root):
    return inventory(root, [p.relative_to(root).as_posix() for folder in ("build/web", "build/linux")
                            for p in (root / folder).rglob("*") if p.is_file()])


def run(argv, cwd, environment, report, log, timeout=30):
    command = {"argv": list(map(str, argv)), "cwd": str(cwd), "environment_overrides": environment, "timeout_seconds": timeout}
    report["commands"].append(command)
    log.write(f"\n$ {shlex.join(command['argv'])}\n"); log.flush()
    started = time.monotonic()
    with subprocess.Popen(command["argv"], cwd=cwd, env=os.environ | environment, stdout=subprocess.PIPE,
                          stderr=subprocess.STDOUT, text=True, start_new_session=True) as process:
        try:
            output = process.communicate(timeout=timeout)[0]
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            output = process.communicate()[0]
            command["timed_out"] = True
    command.update(exit_code=process.returncode, elapsed_seconds=round(time.monotonic() - started, 3), output=output)
    log.write(output + f"\nExit: {process.returncode}\n"); log.flush()
    require(process.returncode == 0 and not command.get("timed_out"), f"Command failed: {shlex.join(command['argv'])}")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", nargs="?", type=Path, default=ROOT / "submission/Latas_Reto_3.zip")
    archive = parser.parse_args().archive.resolve()
    evidence = ROOT / "build/evidence"
    evidence.mkdir(parents=True, exist_ok=True)
    report = {"status": "running", "started_at_utc": datetime.now(timezone.utc).isoformat(),
              "archive": str(archive), "commands": [],
              "scope": "ZIP Godot: integridad, iniciadores desde una ruta con espacios, cinco decisiones compiladas y arranque real del navegador. Herramientas de revisión del checkout."}
    (evidence / "clean-candidate.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    with (evidence / "clean-candidate.log").open("w") as log:
        try:
            report["archive_sha256"] = checksum(archive)
            report["archive_bytes"] = archive.stat().st_size
            temporary = Path(tempfile.mkdtemp(prefix="inehack Godot jurado "))
            unpacked = temporary / "entrega con espacios"
            report["unpack_directory"] = str(unpacked)
            manifest = extract_verified(archive, unpacked)
            require(manifest.get("delivery") == "godot-only" and manifest.get("language") == "es", "La entrega no está identificada como Godot en español")
            names = {row["path"] for row in manifest["files"]}
            required = {"README.md", "JUGAR.py", "JUGAR_WEB.sh", "JUGAR_LINUX.sh", "JUGAR_WINDOWS.cmd",
                        "docs/presentacion_final_es.md", "docs/guion_video_godot_es.md", "docs/revision_humana_final_es.md",
                        "submission/voces_demo_godot.mp4", "submission/demo_godot.srt"}
            require(required <= names, "Faltan instrucciones, iniciadores o materiales de presentación")
            require(not any(name.startswith("web/") or name in {"build/web/app.mjs", "build/web/content/story.json"} for name in names),
                    "Se incluyó la aplicación alternativa retirada")
            report.update(archive_integrity="passed", verified_files=len(manifest["files"]), manifest_sha256=checksum(unpacked / MANIFEST))
            expected = sorted((entry for entry in manifest["files"] if entry["path"].startswith(("build/web/", "build/linux/"))), key=lambda x: x["path"])
            require(expected and runtimes(ROOT) == expected, "El runtime del checkout difiere del ZIP")
            report["tested_runtime_files"] = expected
            editor = ROOT / ".tools/godot/Godot_v4.7.2-stable_linux.x86_64"
            browser = Path(os.environ.get("BROWSER_EXECUTABLE", "/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome")).resolve()
            node = shutil.which("node")
            require(node, "No se encontró Node para la revisión")
            tooling = [str(editor), str(browser), node, "tools/check_candidate.py", "tests/native_journey.gd",
                       "tests/godot_boot_smoke.mjs", "tests/native_window_smoke.py",
                       ".tools/browser/node_modules/playwright/package.json", ".tools/browser/node_modules/playwright-core/package.json"]
            report["checkout_tooling"] = inventory(ROOT, tooling)
            environment = {key: str(temporary / key.lower()) for key in
                           ("XDG_DATA_HOME", "XDG_CONFIG_HOME", "XDG_CACHE_HOME", "XDG_STATE_HOME", "XDG_RUNTIME_DIR", "TMPDIR")}
            for directory in environment.values():
                Path(directory).mkdir(mode=0o700)
            python_output = run([sys.executable, "-m", "unittest", "discover", "-s", "tests"], unpacked, environment, report, log, timeout=120)
            count = re.search(r"Ran (\d+) tests?", python_output)
            require(count and int(count[1]) == manifest["tests"]["python"], "No se reprodujeron las pruebas Python incluidas")
            report["packaged_python_tests"] = int(count[1])
            boot = run(["bash", unpacked / "JUGAR_LINUX.sh", "--headless", "--quit-after", "10"], unpacked, environment, report, log)
            require("Godot Engine v4.7.2." in boot, "El iniciador Linux no abrió el motor verificado")
            journeys = run([editor, "--headless", "--main-pack", unpacked / "build/linux/voces-de-la-plaza.pck",
                            "--script", ROOT / "tests/native_journey.gd"], unpacked, environment, report, log)
            require(not re.search(r"(?im)^\s*(?:SCRIPT ERROR|ERROR):|ObjectDB instances leaked|resources still in use", boot + journeys), "Errores o fugas del runtime Godot")
            completion = ("Compiled Linux journeys: 0 failures; five consultation paths and "
                          "normal/E/Enter/button/reduced ending modes exercised (code-call fixture, not GUI travel)")
            require(completion in journeys.splitlines(), "No terminaron las cinco decisiones y los modos del final")
            report.update(native_clean_boot="passed", native_launcher="passed", compiled_pck_paths=["A", "B", "C", "unmarked", "decline"])
            launcher_log = temporary / "iniciador-web.log"
            launcher_argv = [sys.executable, str(unpacked / "JUGAR.py"), "--sin-abrir", "--puerto", "0"]
            report["web_launcher"] = {"argv": launcher_argv, "cwd": str(unpacked)}
            with launcher_log.open("w") as output:
                launcher = subprocess.Popen(launcher_argv, cwd=unpacked, env=os.environ | environment,
                                            stdout=output, stderr=subprocess.STDOUT, start_new_session=True)
                try:
                    deadline = time.monotonic() + 10
                    origin = None
                    while time.monotonic() < deadline:
                        text = launcher_log.read_text()
                        match = re.search(r"http://127\.0\.0\.1:\d+/", text)
                        if match:
                            origin = match.group(0)
                            break
                        require(launcher.poll() is None, "El iniciador web terminó antes de abrir el servidor")
                        time.sleep(.1)
                    require(origin, "El iniciador web no publicó su enlace local")
                    report["web_launcher"]["origin"] = origin
                    browser_evidence = temporary / "browser-evidence"
                    run([node, ROOT / "tests/godot_boot_smoke.mjs"], unpacked, environment | {
                        "PREVIEW_URL": origin, "WEB_ROOT": "/", "CANDIDATE_ROOT": str(unpacked),
                        "EVIDENCE_DIR": str(browser_evidence), "BROWSER_EXECUTABLE": str(browser)},
                        report, log, timeout=180)
                finally:
                    launcher.send_signal(signal.SIGINT)
                    try:
                        launcher.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        os.killpg(launcher.pid, signal.SIGKILL)
                        launcher.wait()
                report["web_launcher"].update(exit_code=launcher.returncode, log_sha256=checksum(launcher_log))
                require(launcher.returncode == 0, "El servidor local no cerró correctamente con Ctrl+C")
            result = json.loads((browser_evidence / "godot-only-boot.json").read_text())
            report["browser_clean_check"] = result
            require(result["status"] == "passed" and result["errors"] == [] and result["request_failures"] == []
                    and result["lang"] == "es" and result["retired_route"] == "ausente", "Falló el arranque Godot extraído")
            report["browser_evidence"] = inventory(temporary, [p.relative_to(temporary).as_posix() for p in browser_evidence.rglob("*") if p.is_file()])
            require(runtimes(ROOT) == expected == runtimes(unpacked) and checksum(archive) == report["archive_sha256"], "Cambió el runtime o el ZIP durante la revisión")
            require(inventory(ROOT, tooling) == report["checkout_tooling"], "Cambiaron las herramientas durante la revisión")
            report["status"] = "passed"
        except Exception as error:
            report["status"] = "failed"
            report["error"] = f"{type(error).__name__}: {error}"
            log.write(report["error"] + "\n")
    report["finished_at_utc"] = datetime.now(timezone.utc).isoformat()
    report["log_sha256"] = checksum(evidence / "clean-candidate.log")
    (evidence / "clean-candidate.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Comprobación del ZIP: {report['status']} · {evidence / 'clean-candidate.json'}")
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
