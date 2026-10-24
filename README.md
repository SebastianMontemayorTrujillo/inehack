# Voces de la Plaza · INEhack 2026, Reto 3

A short civic data adventure in Mexican Spanish: repair two evidence exhibits using CCPC 2024, explore a visibly fictional community consultation, and reflect on participation and accountability. Target: 10–15 minutes, one compact town, three speaking characters, two CCPC quests, a complete ending, an independent semantic HTML route and Linux fallback.

Playable Godot prototype with an independent accessible HTML story and a native Linux build. **All 48 tests passed: Python 22, Node 17, Godot GUT 9/9 (40 assertions, zero orphans)**. Browser checks cover both HTML quests, all five consultation choices, saved-progress privacy, responsive layouts and Godot startup. The compiled Linux PCK also completes all five automated consultation paths; the native executable passes headless startup. See [evidence and limits](docs/verification.md). Team review, signed letters, hosting, formal screen-reader evaluation and a user pilot remain open.

## Play the local candidate

From this repository, start the preview server if it is not already running:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open **http://127.0.0.1:8765/build/web/**. The page offers the complete HTML route and a link to the Godot adventure. For native play, keep the executable and PCK together and run:

```sh
./build/linux/voces-de-la-plaza.x86_64
```

## Start here

- [Approved capability map](CAPABILITY_MAP.md), [product brief](docs/product_brief.md), [architecture and ownership](docs/architecture.md).
- [Implementation plan](tasks/plan.md) and [pending verification checklist](tasks/todo.md).
- Specs: [ccpc-data](SPEC-ccpc-data.md), [play-session](SPEC-play-session.md), [evidence-quests](SPEC-evidence-quests.md), [community-choice](SPEC-community-choice.md), [accessible-story](SPEC-accessible-story.md), [submission-package](SPEC-submission-package.md).
- [Recovered source register](docs/source_register.md), [Spanish glossary](docs/glossary_es_MX.md), [facilitator guide](docs/facilitator.md), [submission checklist](docs/submission_checklist.md), [handoff and evidence status](docs/handoff.md).
- Produced drafts: [narrative PDF](submission/voces_narrativa_y_difusion.pdf), **4 pages, Letter, 11 pt**; [presentation PDF](submission/voces_presentacion.pdf), **10 pages, 16:9**. Asset QA visually inspected all **14 pages with no clipping**.
- [Actual screen-recorded MP4](submission/voces_pitch_borrador.mp4): **108.07 s (1:48.07), 1920×1080, 30 fps, H.264 High, yuv420p**. Silent with captions; [SRT](submission/pitch_subtitulos.srt) and [separate transcript](submission/pitch_transcripcion.txt) included. No narration was recorded; human voice-over is optional subject to review.
- Stable sources: [pitch/optional voice-over script](docs/pitch_script_es.md), [narrative/dissemination](docs/storyline_and_dissemination_es.md), [ten-slide outline](docs/deck_outline_es.md).

The [review candidate ZIP](submission/voces_de_la_plaza_Reto_3_candidato.zip) contains source, both exports, context/specifications, asset briefs, PDF drafts and captioned video. Its [release manifest](submission/release_manifest.json) records file hashes. Clean extraction passed integrity/hash checks, Linux headless startup, the complete HTML journey with all five choices, and Godot web startup. Rebuild it with `python3 tools/package_candidate.py`; the helper rejects source changes made after verification. It is a review candidate, not a signed or submitted entry. Downloaded CC0 reference packs remain in the local development cache; the candidate ships original art/sounds and licensed fonts.

## Development commands

Installed stack: Godot 4.7.2 with matching official-SHA-512-verified templates, GUT 9.7.1, typed GDScript, Compatibility renderer and single-threaded web export. CCPC raw SHA-256 matched; 32 CSV/9,773,730 rows produced 33 aggregates (national + 32 states). Setup/data evidence and exact test scope are linked in the verification record. `build_data.py` uses the existing raw file; add `--download` to acquire missing input.

```sh
python3 tools/bootstrap.py
python3 tools/assets.py fetch
python3 tools/build_data.py --download
./tools/godot --editor --path game
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
python3 tools/export_game.py --target web --asset-set development
python3 tools/export_game.py --target linux --asset-set development
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
```

Canonical shared content: `game/content/ccpc.json` (real validated records/provenance) and `game/content/story.json` (authored Spanish story and synthetic scenarios). Outputs: `build/web/index.html` (HTML/microsite), `build/web/game/index.html` (Godot web), `build/linux/voces-de-la-plaza.x86_64` (native Linux, with PCK).

For optional browser/PDF/video tools on a fresh checkout, copy `tools/browser-package.json` to `.tools/browser/package.json`, run `npm --prefix .tools/browser install`, review/approve FFmpeg with `npm --prefix .tools/browser install-scripts approve ffmpeg-static`, then run `npm --prefix .tools/browser rebuild ffmpeg-static`. Set `BROWSER_EXECUTABLE` to an installed Chromium executable if the recorded local default is unavailable. These tools are not required to play the exports.

With browser tools and the preview server available, `python3 tools/verify.py --build --browser` runs the complete automated checks and saves logs/source fingerprints. `node tools/render_submission.mjs` regenerates the PDFs; `node tools/record_pitch.mjs` records an updated captioned pitch draft.

To use the browser smoke test's default paths, launch this server from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/build/web/`. With the server running, `node tests/browser_smoke.mjs` exercises the recorded Playwright scope using the installed browser tooling. The local server does not establish hosted access, offline web caching or `file://` support. Linux export/headless boot passed; complete interactive native play and portability remain separate checks.

## Content, assets and evidence

Historical CCPC observations determine quest charts/answers/feedback. Calculate `100 * SV / (SV + NV)` after summing counts; report unknown classification as `100 * NS / LN`, separately. NS is not abstention or a null ballot. Every exhibit includes source/year/geography/denominators/limits. Synthetic consultation values stay separate; every choice or declining can finish, and ballot choice is never persisted.

Development references: CC0 Kenney tiny-town, roguelike-characters, ui-pack and interface-sounds. Original final art/sounds resolve through role IDs. Atkinson Hyperlegible Regular/Bold ship with OFL notice. Validation/staging/import evidence is recorded in the [asset owner's register](docs/asset_register.md); final audiovisual and rights review remain separate checks.

The original [blueprint](INEhack_Development_Blueprint.md), [learning/pitch outline](INEhack_Learning_Evidence_and_Pitch_Outline.md), DOCX files, rubric PDF and research ZIP remain read-only inputs. Historical checks are distinguished from current implementation results. Godot journeys are passing; task status separates completed implementation/draft production from team review and external delivery checks. No learning gains, institutional adoption or turnout effects are established.

Research records a 31 October 2026, 23:59 deadline without timezone; internal candidate target is 30 October. Check the actual call and timezone before submission. Signing, sending and publication are separately authorized actions. Do not commit unless the user asks.
