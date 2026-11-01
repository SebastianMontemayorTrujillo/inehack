# Implementation plan · Voces de la Plaza

## Cierre exclusivo de Godot · 31 de octubre de 2026

Alcance autorizado: juego Godot web/Linux, material editorial en español, revisión final, exposición de siete minutos y demo de aproximadamente 2:15 con un máximo de 150 segundos. Main implementa exportador limpio, iniciadores, README/despliegue, pruebas y paquete; documentación y medios se preparan en paralelo con ámbitos separados. Primero validar la retirada de la aplicación alternativa y el arranque real, después los recorridos/PDF, luego congelar medios y comprobar el ZIP extraído. No cambiar la lógica del juego para grabarlo. Los criterios y límites están en `docs/entrega_solo_godot_es.md`; RV27–RV31 registran resultados reales. No se requieren nuevas aprobaciones de fase para este trabajo autorizado.

## Sequential interaction and pink campaign revision · 27 October 2026

Approved execution: keep all houses enterable while enforcing Luz → Mateo → Inés → nearby press → FIN. Early Mateo/Inés speech directs players to Luz on the left; after Luz, Inés directs them to Mateo in the center. Only hosts start lessons; the press is exclusively the final-poster machine. Remove floor text, move directions into a focused HUD, and show one nearby [E] prompt from the same resolved target that input activates. Keep WASD-only travel and independent semantic HTML navigation.

Keep six activity IDs/rules while simplifying Spanish questions, choices, hints and feedback for beginners. Use a shared pink (#B41476), white (#FFFFFF), ink (#242124) and pale-pink (#FBEAF3) design for the original citizen poster/preview/ending, inspired by earlier INE civic materials; preserve Atkinson/OFL and the pixel town. No official logo, Latas/INEhack mark or claimed endorsement appears on the poster. Keep searchable vector Carta PDFs, exact data, bases/NS/source/limitations and native/JS parity.

At printing, mark completion once and reveal the sheet/finished poster in at most 2.5 seconds, with E/Enter/button skip and immediate reduced-motion mode. The dedicated FIN screen keeps its heading and Download/Enlarge/Explore controls visible; expanded poster content may scroll. Reopening skips animation; closing never travels; reload never fabricates session-only PDF bytes. No save-format migration is needed.

Install and inspect Anthropic canvas-design/frontend-design at revision dbd4588f9e1033efb41dad4bef2f7947c8993d44. The installation does not replace established accessibility/data constraints. Work is divided into main-owned progression/content/HUD, poster/PDF, HTML, and ending slices with disjoint file ownership. Then freeze and verify actual exports, refresh materials/media, obtain a fresh independent official-rubric review (35/30/20/15) and clean-check the local Latas candidate. The older 100/100 remains historical; no predetermined score or user-pilot claim.

Acceptance and evidence are tracked in RV21–RV26 below; older unfinished external-release tasks are preserved.

## Interface follow-up · 27 October

The approved UI follow-up is RV17 in [todo](todo.md): first establish a shared paper/ink theme and bounded exploration HUD; then contain panel focus/mouse interaction and verify restoration; finally inspect normal/enlarged real exports and refresh media/context/local candidate. Keep passive progress separate from interaction, equally style all answers and consultation choices, and preserve WASD-only travel and exact-data/privacy rules. The [interface contract](../docs/interface_polish.md) records the reproduced focus bug and actual checks; [verification](../docs/verification.md) identifies final artifacts.

## Classroom revision

Implemented from the 24 October design during the 25 October completion pass: introductory ethics/civic courses in Mexico, simpler questions, a clearer rationale and three enterable houses. Current acceptance is recorded in [todo](todo.md#classroom-revision) and [verification](../docs/verification.md). The original 79/100 baseline and conditional 91/100 planning target are historical estimates; the [rubric review](../docs/rubric_review.md) assesses the revised artifacts independently. The user's 100/100 target does not authorize invented evidence or a guaranteed committee score.

The primary audience becomes high-school beginners approaching their first vote; adults new to civic education use the same respectful language. Core flow: understand evidence → compare fairly → listen and decide → follow up. Keep one town, three characters, two CCPC quests, the separate synthetic consultation, semantic HTML equivalence and Linux fallback. Add small interiors to the existing three houses. Calculations stay correct and available, while conceptual graph-reading replaces required formula exercises.

Revision task status lives only in [todo](todo.md#classroom-revision). Dependencies:

`RV01 content contract → RV02 house-1 navigation → RV03 first simple quest → RV04 comparison → RV05 house 2 → RV06 house 3/ending → RV10 exported interaction checks → RV12 refreshed candidate`.

`RV07 original room roles → RV08 asset records → RV10`; `RV01 + RV03 + RV04 + RV06 → RV09 equivalent HTML → RV10`; `RV01 + RV06 → RV11 teacher materials → RV12`.

The subsequent rubric review adds **RV13**, implementing the original supported-headline interaction as an optional poster workshop: canonical content and exact generic comparison → Godot/HTML composition and publication → all 496 state-pair checks plus actual keyboard journeys → updated classroom/media and renewed rubric review → RV12 package freeze. Existing six required questions and the synthetic consultation remain intact. A published poster survives navigation and cancelled edits in the current session but is never serialized with progress or ballots.

Build a complete first-house entry/quest/exit slice before rolling the room pattern out. Keep one active spatial scene below a persistent root, with safe spawns, current-room bounds and no automatic quest completion. The 26 October user amendment removes menu travel: WASD walking crosses the physical doorways, while E/Enter interacts only with nearby people/exhibits. All rooms are physically accessible from the start; only consultation activity depends on the two evidence artifacts.

Checkpoint A after RV01–RV03: enter/leave house 1 through actual input, publish a simpler sourced bulletin, retry safely and retain progress. Checkpoint B after RV04–RV06: both artifacts and every consultation action reach the same ending; room revisits do not leak ballots. Checkpoint C after RV07–RV10: original assets and both routes work in the revised exports with recorded accessibility results/limits. Checkpoint D after RV11–RV12: teacher materials and recorded media match the new candidate; remaining external requirements stay explicit. Checkpoints record acceptance evidence, not renewed phase-permission requests.

Main owns canonical JSON, data rules, session/navigation, scene integration and final checks. After RV01 freezes content IDs/schema, the asset owner can prepare RV07–RV08 while main develops room/quest slices. Web implementation follows the same questions/rules and can proceed once those are stable; main serializes changes to shared JSON and shared test fixtures. The teacher guide can be drafted in parallel. Do not have two owners edit `main.gd` or `story.json` simultaneously.

Rough additional implementation/review allowance: **18–30 focused person-hours**, excluding participant availability and external submission. This is a new estimate, not a measurement of time already spent or an assumption that the original 45–65-hour capacity has unused hours. First priorities are simpler shared content, one reusable interior, all three functioning houses and HTML equivalence. If time is tight, simplify room decoration and omit extra animations; preserve both quests, sources, accessibility paths and required package updates.

Verification commands after implementation:

```sh
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
./tools/godot --headless --path game -s addons/gut/gut_cmdln.gd -gdir=res://tests -gexit
node tools/render_submission.mjs --handout-only
python3 tools/verify.py --build --browser --native-window --godot-browser
node tools/render_submission.mjs
node tools/record_pitch.mjs --record
python3 tools/package_candidate.py
```

The browser checks require the documented preview server/tooling. Extend the meaningful tests for doors, new question parity and migration before running the aggregate verifier. Inspect revised PDFs, video and clean exports; do not treat the old 48-test report or code-call journeys as acceptance for new doors. Teacher/student feedback and screen-reader checks depend on actual availability and must be reported honestly. No learner results, formal curriculum approval or institutional adoption are asserted.

## Version-1 implementation baseline

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

Main runs the setup/data/test/export entry points; current commands, outcomes and fingerprints are recorded in [verification](../docs/verification.md). C1–C5 record their accepted scope rather than automatic passes from code completion. Serve repository root with `python3 -m http.server 8765 --bind 127.0.0.1` and open `/build/web/` for `node tests/browser_smoke.mjs` defaults. No suite or local server establishes formal screen-reader support, pilot findings, offline caching or external hosting.

Risks: unavailable intended engine/templates → verify early and document compatible choice; changed/unavailable data → keep failure explicit, investigate provenance rather than invent bytes; content/evaluator drift → shared fixtures and IDs; missing original asset roles → fail final asset acceptance and integrate originals; time pressure → protect complete path and mandatory files; no pilot → report internal checks and proposed evaluation; signatures/hosting/timezone → keep external checklist pending while local work proceeds.
