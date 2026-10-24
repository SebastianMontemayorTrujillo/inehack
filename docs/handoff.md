# Handoff · current documentation and runtime evidence

24 October 2026. Documentation owner reconciles main's runtime reports and local records; no code/data/asset-document edits, executable scripts or git commits are part of this contribution. The current evidence record is [verification.md](verification.md).

## Accepted decisions

The user approved the plan and instructed implementation, including specifications and implementation across the six stable module IDs. Continue within that scope without renewed phase approval. Confirmed Linux fallback, simplepixels direction, 45–65 focused person-hours, original 10–15 minute adventure with one town, three speaking characters, two CCPC quests, synthetic consultation and semantic HTML equivalent. Main owns code/data/integration; web/assets are separate parallel owners.

## Files prepared

`AGENTS.md`; six root `SPEC-*.md` files; `tasks/plan.md`; `tasks/todo.md`; `docs/product_brief.md`; `docs/architecture.md`; `docs/source_register.md`; `docs/glossary_es_MX.md`; `docs/facilitator.md`; `docs/submission_checklist.md`; `docs/pitch_script_es.md`; `docs/storyline_and_dissemination_es.md`; `docs/deck_outline_es.md`; `docs/verification.md`; this file; updated `README.md` and `CAPABILITY_MAP.md`.

Original blueprint/learning-outline Markdown and DOCX, research ZIP and rubric PDF remain research inputs. Preserve them. The map's old proposal gates are superseded by the user's approval; these new specs document that authorized scope, not additional unapproved work.

## Checks performed by this contribution

- Read original map, blueprint, learning outline, repository file inventory and initial `git status --short`.
- Used an inline read-only `python3` invocation with `zipfile`/`xml.etree.ElementTree` to inspect both DOCX relationship parts and match hyperlink labels. Recovered 14 + 12 = 26 external hyperlink relationships, recorded exact targets/IDs in `source_register.md`.
- Read annex member names, READMEs and recorded JSON using `ZipFile.read`; did not execute the annex reproduction script or acquire raw data.
- Applied documentation patches only. Final documentation integrity checks are recorded below after execution.

Subsequent runtime evidence supersedes the research-only baseline: Godot 4.7.2/templates installed and verified against official SHA-512 sums; GUT 9.7.1 installed. CCPC raw SHA-256 matched and 32 CSV/9,773,730 rows yielded 33 national/state aggregates. Main's final report confirms **22 Python, 17 Node and 9/9 Godot GUT tests passing, 40 GUT assertions, zero orphans**; the current Godot log records nine passing tests and 40 assertions. Both previously failing journey tests are repaired.

Original-set web/Linux exports succeeded. Playwright report confirms full HTML journey/all five ballot actions/persistence, 320/768/1440 px overflow checks and Godot web boot with no captured page/console errors; Linux headless boot passed. These are observed automated results reported by main and read in records, not suites rerun by this documentation contributor. Formal screen-reader evaluation and user pilot have not run; full manual exported interactions, contrast/zoom/audio/input checks and user-session duration remain open.

## Local candidate handoff

The candidate ZIP and hash manifest are produced. Clean extraction passed integrity and manifest checks, isolated Linux headless startup, the complete HTML journey with all five choices, responsive/persistence checks and Godot web startup. The final reconciliation preserves the verified runtime files. The downloaded CC0 reference packs remain local development inputs; original audiovisual assets and licensed fonts ship in the candidate. Continue with team review and the open external-readiness checklist.

1. Preserve parallel work and the tested working-tree baseline. Save mutable tool/test logs with the final candidate; no revision ID is invented.
2. Produced and packaged local drafts: narrative PDF **4 pages, Letter, 11 pt**; presentation PDF **10 pages, 16:9**. Asset QA visually inspected all **14 pages with no clipping**. MP4 actual screen recording is **108.07 s (1:48.07), 1920×1080, 30 fps, H.264 High, yuv420p**. It is silent with captions; SRT and separate transcript are included. No narration was recorded; human voice-over is optional subject to review. No draft generation/recording is outstanding.
3. Keep `game/content/ccpc.json` and `story.json` canonical. The asset register records original role validation/staging/import and Atkinson Hyperlegible/OFL notices; no asset-owner document was edited here.
4. All **48 tests pass: Python 22, Node 17, Godot GUT 9/9**, with 40 GUT assertions and zero orphans. Browser full HTML/five-choice/persistence/privacy/three-width and Godot boot checks remain passing. Completed implementation and draft production are distinct from the team's final review.
5. Outstanding reviews: **team review, signed letters, read-only hosting/access, formal screen-reader evaluation and user pilot**. Do not invent participant findings, universal accessibility or voice recordings. Formal screen-reader evaluation and pilot have not run.
6. `tools/package_candidate.py` assembles `submission/voces_de_la_plaza_Reto_3_candidato.zip` and its release manifest, guarded by the tested-source fingerprints in `build/evidence/verification.json`. Compiled-PCK QA now passes all five consultation paths, separately from the 48 unit tests. This harness uses the editor with `--main-pack`; direct external-script execution by the release executable is not supported and was stopped. Signing, sending and publishing retain their separate authorization requirements.

## Implemented entry points, not rerun by this documentation update

```sh
python3 tools/bootstrap.py
python3 tools/build_data.py
./tools/godot --editor --path game
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
python3 tools/export_game.py --target web --asset-set development
python3 tools/export_game.py --target linux --asset-set development
python3 -m http.server 8765 --bind 127.0.0.1
```

Exports are `build/web/` (HTML plus `game/`) and `build/linux/voces-de-la-plaza.x86_64` plus PCK. Serve repository root and browse `http://127.0.0.1:8765/build/web/` for the default `node tests/browser_smoke.mjs` layout. Directly serving `build/web` is a separate manual preview. Record actual results rather than inferring passes from a command list.

## Final documentation verification

Initial documentation-only delivery passed checks for 18 files, 41 relative links and all 26 recovered DOCX targets/IDs, with no whitespace errors. At that earlier point no implementation tasks were checked; the current task list now incorporates main's subsequent confirmed results. Pitch/deck/narrative structural checks were also run without generating deliverables. The final reconciliation is checked for local links, status consistency and whitespace; runtime results are attributed in `verification.md`.

Patch-scope review shows documentation edits only; no before/after original-file hash comparison is claimed. Original research inputs and concurrent implementation/asset-owner files were left untouched. No git commit was made. Checked tasks reflect recorded automated acceptance; remaining manual and final submission criteria stay open.
