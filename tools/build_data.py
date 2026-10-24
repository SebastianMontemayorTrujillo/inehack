"""Reproduce the official CCPC 2024 national and state snapshots, fail closed."""
import argparse
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip"
PORTAL = "https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
EXPECTED_HASH = "c0de34d04e782ad99579b83591a6e3e6c8d1e20f4914d4845743bd79d2bd28b2"
FIELDS = "AELEC FELECCION EDOCVE EDONOM MPIOCVE MPIONOM SECCION TIPOSEC DEF DEL SEXO EDAD LN SV NV NS".split()


def rate(numerator, denominator):
    return 100.0 * numerator / denominator if denominator else None


def build_bundle(path, expected_hash=EXPECTED_HASH, retrieved_at=None):
    with path.open("rb") as raw:
        digest = hashlib.file_digest(raw, "sha256").hexdigest()
    if digest != expected_hash:
        raise ValueError(f"Source hash changed: {digest}; investigate before reuse")
    groups = {0: {"ln": 0, "sv": 0, "nv": 0, "ns": 0, "geography_name": "México"}}
    rows = 0
    with ZipFile(path) as archive:
        members = sorted(n for n in archive.namelist() if n.lower().endswith(".csv"))
        if len(members) != 32:
            raise ValueError("Expected 32 complete state CSV files")
        for member in members:
            with archive.open(member) as raw:
                reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig", newline=""))
                if reader.fieldnames != FIELDS:
                    raise ValueError(f"Unexpected schema: {member}")
                for line, row in enumerate(reader, 2):
                    if row["AELEC"] != "2024":
                        raise ValueError(f"Unexpected year: {member}:{line}")
                    state = int(row["EDOCVE"])
                    counts = {key.lower(): int(row[key]) for key in ("LN", "SV", "NV", "NS")}
                    if state not in range(1, 33) or min(counts.values()) < 0:
                        raise ValueError(f"Invalid geography/count: {member}:{line}")
                    if counts["ln"] != counts["sv"] + counts["nv"] + counts["ns"]:
                        raise ValueError(f"LN reconciliation failed: {member}:{line}")
                    if state not in groups:
                        groups[state] = {"ln": 0, "sv": 0, "nv": 0, "ns": 0, "geography_name": row["EDONOM"]}
                    for key in counts:
                        groups[state][key] += counts[key]
                        groups[0][key] += counts[key]
                    rows += 1
    if set(groups) != set(range(33)):
        raise ValueError("Missing state coverage")
    records = []
    for state in sorted(groups):
        record = groups[state]
        classified = record["sv"] + record["nv"]
        records.append({"id": "national" if state == 0 else f"state_{state:02}", "year": 2024,
                        "geography_level": "national" if state == 0 else "state",
                        "geography_code": f"{state:02}" if state else None, **record,
                        "classified_count": classified, "participation_pct": rate(record["sv"], classified),
                        "unknown_pct": rate(record["ns"], record["ln"])})
    return {"schema_version": "1.0.0", "dataset_id": "ccpc-2024-v1",
            "source": {"url": SOURCE, "portal_url": PORTAL, "sha256": digest,
                       "retrieved_at_utc": retrieved_at or "not-recorded-in-test",
                       "dictionary_path": "DatosAbiertos_DECEyEC_ConteosCensales2024/01_descripcioncampos_conteoscensales2024.txt"},
            "method": {"year": 2024, "filters": [], "formula_id": "sv_over_sv_nv"},
            "records": records, "quest_refs": [{"quest_id": "printing", "record_ids": ["national"]}, {"quest_id": "comparison", "record_ids": ["state_01", "state_02"]}],
            "validation": {"csv_files": len(members), "rows": rows, "bad_sum_rows": 0,
                           "limits": ["Los registros no revelan preferencias partidistas ni motivos individuales.", "La clasificación desconocida no equivale a abstención ni a voto nulo.", "Los registros excluyen casillas especiales y voto desde el extranjero.", "Las comprobaciones aritméticas no acreditan unicidad o exhaustividad de la fuente."]}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "data/raw/ccpc2024.zip")
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()
    provenance = args.input.with_suffix(".source.json")
    if args.download and not args.input.exists():
        args.input.parent.mkdir(parents=True, exist_ok=True)
        partial = args.input.with_suffix(".part")
        subprocess.run(["curl", "-fsSL", "--retry", "3", "--continue-at", "-", "--max-time", "900", "-o", str(partial), SOURCE], check=True)
        partial.replace(args.input)
        provenance.write_text(json.dumps({"retrieved_at_utc": datetime.now(timezone.utc).isoformat()}))
    retrieved = json.loads(provenance.read_text())["retrieved_at_utc"] if provenance.exists() else datetime.fromtimestamp(args.input.stat().st_mtime, timezone.utc).isoformat()
    bundle = build_bundle(args.input, retrieved_at=retrieved)
    output = ROOT / "game/content/ccpc.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n")
    report = ROOT / "data/validation_report.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps({"source": bundle["source"], **bundle["validation"]}, ensure_ascii=False, indent=2) + "\n")
    print(f"Validated {bundle['validation']['rows']:,} rows; wrote {len(bundle['records'])} aggregates to {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
