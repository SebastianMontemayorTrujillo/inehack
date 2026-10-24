"""Fetch pinned official tools into this repository, never the system install."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
VERSION = "4.7.2-stable"
BASE = f"https://github.com/godotengine/godot-builds/releases/download/{VERSION}"


def fetch(url, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        return target
    partial = target.with_suffix(target.suffix + ".part")
    print(f"Downloading {target.name}", flush=True)
    subprocess.run(["curl", "-fsSL", "--retry", "3", "--continue-at", "-", "--connect-timeout", "20", "--max-time", "900", "-o", str(partial), url], check=True)
    partial.replace(target)
    return target


def main():
    downloads = ROOT / ".tools/downloads"
    sums = fetch(f"{BASE}/SHA512-SUMS.txt", downloads / "SHA512-SUMS.txt")
    expected = {line.split()[-1].lstrip("*"): line.split()[0] for line in sums.read_text().splitlines() if line.strip()}
    files = [f"Godot_v{VERSION}_linux.x86_64.zip", f"Godot_v{VERSION}_export_templates.tpz"]
    evidence = []
    for name in files:
        archive = fetch(f"{BASE}/{name}", downloads / name)
        digest = hashlib.file_digest(archive.open("rb"), "sha512").hexdigest()
        if digest != expected[name]:
            raise ValueError(f"Official checksum mismatch: {name}")
        evidence.append({"name": name, "url": f"{BASE}/{name}", "sha512": digest})
        with ZipFile(archive) as z:
            if name.endswith(".zip"):
                member = f"Godot_v{VERSION}_linux.x86_64"
                target = ROOT / ".tools/godot" / member
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_suffix(".extract")
                with z.open(member) as src, temporary.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                temporary.chmod(0o755)
                temporary.replace(target)
            else:
                destination = ROOT / ".tools/share/godot/export_templates/4.7.2.stable"
                destination.mkdir(parents=True, exist_ok=True)
                required = {"version.txt", "web_debug.zip", "web_release.zip", "web_nothreads_debug.zip", "web_nothreads_release.zip", "linux_debug.x86_64", "linux_release.x86_64"}
                for member in z.namelist():
                    basename = Path(member).name
                    if basename in required:
                        with z.open(member) as src, (destination / basename).open("wb") as dst:
                            shutil.copyfileobj(src, dst)
                        required.remove(basename)
                if required:
                    raise ValueError(f"Missing export templates: {required}")
    gut_archive = fetch("https://codeload.github.com/bitwes/Gut/zip/refs/tags/v9.7.1", downloads / "gut-9.7.1.zip")
    with ZipFile(gut_archive) as z:
        for member in z.namelist():
            marker = "/addons/gut/"
            if marker in member and not member.endswith("/"):
                relative = Path(member.split(marker, 1)[1])
                if ".." in relative.parts:
                    raise ValueError("Unsafe GUT archive member")
                target = ROOT / "game/addons/gut" / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                with z.open(member) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
    evidence.append({"name": "GUT 9.7.1", "sha256": hashlib.file_digest(gut_archive.open("rb"), "sha256").hexdigest()})
    (ROOT / ".tools/toolchain.json").write_text(json.dumps(evidence, indent=2) + "\n")
    print("Official checksums verified; Linux and Web templates installed.", flush=True)


if __name__ == "__main__":
    main()
