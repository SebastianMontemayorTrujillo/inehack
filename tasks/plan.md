# Implementation plan · Voces de la Plaza

24 October 2026 · **Approved and implemented through the recorded automated scope**. User authorized specs/implementation across all six modules; no renewed phase approval is required. Main owns code/data/integration; documentation records results without editing original research. [Verification](../docs/verification.md) records all 48 tests passing (Python 22, Node 17, Godot GUT 9/9; 40 GUT assertions, zero orphans), successful exports/browser checks and produced drafts: 4-page narrative, 10-page deck and silent captioned 108.07-second MP4. Team review, signed forms, hosting, screen-reader evaluation and pilot remain open. The local candidate is packaged and clean-checked.

## Delivery and capacity

Protect the original 10–15 minute adventure: one compact town, three speaking characters, two real-data CCPC quests, a synthetic consultation, a complete ending, a semantic HTML equivalent, and Linux fallback. Confirmed simplepixels direction and **45–65 focused person-hours**. Hours are planning capacity, not measured time spent or a guarantee. Do not silently substitute the lean one-quest fallback.

| Phase | Hours | Observable checkpoint |
| --- | ---: | --- |
| Preflight and reproducible data | 6–9 | Actual engine/templates/export smoke plus validated sourced card |
| First complete quest and session | 8–12 | Keyboard inspect/answer/retry/transfer/save route |
| Second quest and exhibit | 8–11 | Correct counts/rates/aggregation and interpretation panels |
| Synthetic consultation and ending | 4–6 | All actions/tie behavior, private choice, follow-up |
| HTML equivalence and accessibility | 6–9 | Independent full route, shared fixtures and actual access checks |
| Original asset integration and fixes | 4–6 | Original role set complete; clean exported walkthrough |
| Evidence and mandatory package | 9–12 | Candidate, actual validation record, deck/PDF/video/letters checklist |
| Total | **45–65** | All acceptance requires evidence |

This is a total allocation, including contributors' work; do not add parallel hours twice. Adjust emphasis after preflight without inventing extra capacity. Cut decorative animation and unplanned extras before educational requirements or mandatory artifacts.

## Dependencies and ownership

`ccpc-data` + `play-session` → `evidence-quests` → `community-choice` → integrated `accessible-story` → `submission-package`.

Main owns engine/bootstrap, data acquisition/validation, canonical `game/content/ccpc.json` and `story.json`, game scripts/scenes, tests and exports. Web owner may build the HTML shell against contracts while data/game slices proceed; asset owner develops the original role set and records sources/rights. This contributor owns requested context/spec/plan/guide files only. Do not edit another stream's files incidentally. Main reconciles changing CLI/content/output paths across streams and docs.

Final visible art/sounds are original. Kenney CC0 tiny-town, roguelike-characters, ui-pack and interface-sounds are development references; Atkinson/OFL is the font reference. Shared role IDs allow swapping asset sets without rewriting gameplay. Asset register is owned elsewhere and is not edited here.

## Ordered slices

Use [todo.md](todo.md) as the single completion checklist. The IDs below are an ordered index, not a second status tracker.

1. **T00–T02: preflight and data card.** Review approved contracts, verify actual engine/templates, export a small native/web shell, obtain official bytes, validate and reproduce the bundle. Checkpoint C1: the real sourced card and export path work. Godot 4.7.2 is intended; main verifies availability and documents an actual compatible alternative if needed.
2. **T03–T05: first whole learning path.** Implement session/settings/checkpoints, shared narrative rules, and the printing quest with feedback, assistance, independent transfer and a persistent exhibit. Checkpoint C2: one complete exported keyboard route, not only isolated widgets.
3. **T06–T08: complete the adventure.** Implement state comparison, supported/unsupported/evidence-needed panels, synthetic consultation/tie handling, ending and neutral follow-up. Checkpoint C3: both quests and every consultation action finish without storing choice.
4. **T09–T11: both delivery modes and original role set.** Finish HTML parity, exported-game access checks, original assets, focus/text/zoom/storage checks, then full timed walkthroughs. Checkpoint C4: all routes use shared content and final asset set with recorded limitations.
5. **T12–T15: evidence and submission candidate.** Review content/data claims, run formative sessions only if feasible, prepare mandatory artifacts, assemble/recheck actual files and external requirements. Checkpoint C5: candid readiness checklist and identified candidate, not an invented submission receipt.

At checkpoints main records actual results and continues within approved scope. A failed check triggers a targeted repair and recheck; it is not an automatic request for the user to approve the same work again.

## Schedule priorities

24 Oct: preflight/data card. 25 Oct: first quest. 26 Oct: second quest/consultation. 27 Oct: town/HTML/accessibility integration and feature freeze. 28 Oct: feasible formative sessions and repairs. 29 Oct: package content and recording. 30 Oct: candidate freeze and clean run. 31 Oct: final independent check and separately authorized submission. These are targets, not completed milestones. Confirm deadline timezone; no time zone is stated in the supplied call research.

## Verification and adaptation

Implemented entry points: `python3 tools/bootstrap.py`, `python3 tools/build_data.py`, `./tools/godot --editor --path game`, `python3 -m unittest discover -s tests`, `node --test tests/*.test.mjs`, and `python3 tools/export_game.py --target web|linux --asset-set original|development` (choose one value for each option; do not execute the `|` notation literally). Full examples are in [architecture](../docs/architecture.md).

Main ran setup/data/test/export entry points; this documentation does not rerun them. GUT's seven rule and two repaired journey tests pass. C1–C5 remain checkpoints for their complete scope, not automatic passes from code completion. Serve repository root with `python3 -m http.server 8765 --bind 127.0.0.1` and open `/build/web/` for `node tests/browser_smoke.mjs` defaults. No suite or local server establishes formal screen-reader support, pilot findings, offline caching or external hosting.

Risks: unavailable intended engine/templates → verify early and document compatible choice; changed/unavailable data → keep failure explicit, investigate provenance rather than invent bytes; content/evaluator drift → shared fixtures and IDs; missing original asset roles → fail final asset acceptance and integrate originals; time pressure → protect complete path and mandatory files; no pilot → report internal checks and proposed evaluation; signatures/hosting/timezone → keep external checklist pending while local work proceeds.
