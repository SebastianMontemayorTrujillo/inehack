# SPEC: ccpc-data

Version 1 · 24 October 2026 · Owner: main, data/integration.
Approved scope implemented for the recorded data build. Raw SHA-256 matched; 32 CSV/9,773,730 rows produced 33 national/state aggregates. Python data/asset suite: 22 passed. Remaining source-review/package checks are scoped in [verification](docs/verification.md); no exhaustive source-quality audit is claimed.

## Objective and boundary

Provide both presentation routes with a small, reproducible 2024 federal-election CCPC snapshot. A displayed value must be traceable to official bytes, filters, aggregation, and a source version. This module has no runtime module dependencies and owns the data contract consumed by `evidence-quests` and `accessible-story`.

Use national, Aguascalientes, Baja California, and combined-state aggregates for the two quests. Aggregate all applicable categories for the selected year; age/sex profiling and historical or judicial-election comparisons are outside the MVP.

## Structure and commands

Authoritative runtime output: `game/content/ccpc.json`. Planned supporting outputs: `data/data_manifest.json`, `data/validation_report.json`, and a reproducibility note under `data/`. Raw download storage and intermediate names are main's implementation choice; never overwrite original research inputs. Tests live in `tests/`.

```sh
python3 tools/bootstrap.py
python3 tools/build_data.py
python3 -m unittest discover -s tests
```

Bootstrap and data entry points are implemented and have been run by main. `build_data.py` uses existing raw input by default; add `--download` to acquire a missing source. See the verification record for actual outcomes rather than inferring a fresh pass from these instructions.

## Provider contract and calculation style

Preserve the blueprint's schema version `1.0.0` and dataset identity `ccpc-2024-v1` unless actual source reconciliation requires a documented revision. The bundle contains:

- `source`: official portal/download URL, actual retrieval time, actual byte hash, dictionary path; include archive size and included-file ledger in the manifest.
- `method`: year 2024, explicit filters, `formula_id: sv_over_sv_nv`.
- `records`: stable ID, geography level/code/name, integer `ln`, `sv`, `nv`, `ns`, `classified_count`, nullable `participation_pct`, nullable `unknown_pct`, warnings.
- `quest_refs`: quest ID, record IDs, learning-objective IDs. Use stable references rather than copying real values into dialogue.

Declarative calculation example, **synthetic test only**: `ln=100, sv=60, nv=30, ns=10 → classified_count=90, participation_pct=66.666…, unknown_pct=10`. It is not an INE observation.

Participation is `100 * sum(SV) / (sum(SV) + sum(NV))`. Unknown share is `100 * sum(NS) / sum(LN)`. Zero denominator yields `null`, never 0%. Keep raw integer counts separate from display formatting and round only at presentation. Rate differences use percentage points. Preserve geographic codes as strings without guessing padding or joins; national code is null. Preserve raw FELECCION; establish year from AELEC.

Validate the dictionary and these 16 fields: AELEC, FELECCION, EDOCVE, EDONOM, MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF, DEL, SEXO, EDAD, LN, SV, NV, NS. Reject malformed/noninteger/negative counts, wrong year, missing provenance, duplicate aggregate keys, and unsupported schema versions. Reconcile LN = SV + NV + NS where the dictionary supports it. A source hash change requires investigation and a new documented source version; never silently reuse the old validation label.

## Fixtures and evidence status

These research-annex values have now been **reproduced against the matching official raw source** in the runtime build. The two-state combined row is calculated from the two state records, not an extra member of the 33-record bundle:

| Record | LN | SV | NV | NS | Classified rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| National | 98,330,348 | 54,899,228 | 37,105,466 | 6,325,654 | 59.6700% |
| Aguascalientes | 1,097,171 | 626,084 | 441,222 | 29,865 | 58.6602% |
| Baja California | 3,197,817 | 1,396,335 | 1,571,676 | 229,806 | 47.0462% |
| Both states | 4,294,988 | 2,022,419 | 2,012,898 | 259,671 | 50.1180% |

National NS/LN: 6.4331%. The two-state simple mean, 52.8532%, is an intentionally incorrect answer to the combined-count question. See [source register](docs/source_register.md) for historical provenance and [verification](docs/verification.md) for the actual reproduction. The original annex contains no raw official ZIP; main's implementation acquired it separately.

## Acceptance and tests

- DATA-01: Given actual official bytes, build a manifest with measured hash, included files, filters, dictionary, row ledger, and failure report. Compare with annex references and explain any discrepancy before release.
- DATA-02: Unit tests cover sum-before-divide, null denominators, LN identity, malformed records, aggregate uniqueness, count precision, and rounding. Two builds over the same inputs produce identical runtime content; retrieval timestamps belong to acquisition evidence, not a changing build timestamp.
- DATA-03: Both runtimes consume the same validated file. Changing a test record changes charts, accepted interpretations, and feedback consistently; missing/invalid data displays a useful unavailable state without substitute official-looking numbers.
- DATA-04: Every real exhibit exposes year, geography, counts, each denominator, source, dataset version, and limitations. CCPC booklet marks do not establish party choice, motives, causality, or this game's effects; source exclusions remain visible.

## Working boundaries and unresolved checks

Always validate before labelling content verified; use standard-library Python where sufficient. Ask only for decisions outside approved scope, such as introducing sensitive subgroup comparisons or changing the learning objective. Never invent provenance, silently discard bad rows, merge NS into NV, or infer individual motives. Main must verify dictionary semantics and actual source availability; this documentation does not download or execute the pipeline.
