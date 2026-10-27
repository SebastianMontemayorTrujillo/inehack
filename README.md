# Voces de la Plaza · Equipo Latas · INEhack Reto 3

An original Godot adventure for introductory ethics/civic classes in Mexico, especially high-school beginners approaching their first vote and adults new to civic education. Visit three houses, answer six short conceptual questions, publish two CCPC exhibits, explore a clearly fictional consultation and choose a follow-up question. Calculations are optional. The design target is 10–15 minutes; learner duration and educational effects have not been measured.

**105 tests pass: 30 Python, 33 Node, 42 Godot/GUT; 1,418 Godot assertions, zero orphans.** [Verification and limits](docs/verification.md) records the exported HTML/Linux/browser-canvas journeys, all five consultation choices, artifact fingerprints and actual assistive-technology observations.

After Mateo's archive, an optional workshop lets you choose two of the 32 states, a count/proportion view and a discussion question. Preview and revise your sourced poster, then bring it to Inés. The published poster stays in memory for that session and never changes the fictional vote. All 496 state pairs are checked against exact references in both measures.

**26 October revision:** walk with **WASD** and cross doorways to enter or leave houses. Approach a person or exhibit and press **E/Enter** to interact. **Escape** closes panels; **J** opens the diary. There are no travel buttons. Save your designed poster in place, then walk to Inés to discuss it. The semantic HTML route retains its independent document navigation.

## Play and teach

**27 October interface:** location/objective and three passive progress indicators have distinct places in the header. Shared paper dialogs dim the world, keep keyboard focus inside and restore controls when closed. Buttons, source cards and enlarged text use the same paper/ink palette as the final poster.

From this repository, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open **http://127.0.0.1:8765/build/web/** for the complete HTML route and Godot link. The page also links the teacher guide and printable sheet. Native play uses the executable and PCK together:

```sh
./build/linux/voces-de-la-plaza.x86_64
```

- [Teacher guide](docs/facilitator.md), [classroom website](submission/classroom.html), [two-sided printable sheet](submission/classroom-handout.pdf), [glossary](docs/glossary_es_MX.md).
- [Institutional reuse proposal](docs/institutional_reuse.md): individual, pair, projector and paper modes; setup, maintenance and adaptation requirements.
- [Narrative/dissemination PDF](submission/voces_narrativa_y_difusion.pdf), [ten-slide presentation](submission/voces_presentacion.pdf), [captioned MP4](submission/voces_pitch_borrador.mp4), [captions](submission/pitch_subtitulos.srt), [transcript](submission/pitch_transcripcion.txt).
- [Latas Reto 3 candidate ZIP](submission/Latas_Reto_3.zip), [release manifest](submission/release_manifest.json), [rubric iterations](docs/rubric_review.md), [handoff](docs/handoff.md), [submission checklist](docs/submission_checklist.md).

The MP4 is a silent automated demonstration with captions, not a recording of learners. Official blank forms are in submission/forms; they are unsigned. Local candidate preparation is complete only to the extent recorded in the manifest/check receipts. Signing, public hosting and sending require separate authorization.

## Development and verification

[Capability map](CAPABILITY_MAP.md), [product brief](docs/product_brief.md), [architecture](docs/architecture.md), [tasks](tasks/todo.md) and six root SPEC files define the approved scope. Canonical content is game/content/ccpc.json (historical data) and game/content/story.json (authored story, activities, before/after poster copy and synthetic scenarios).

```sh
python3 tools/bootstrap.py
python3 tools/assets.py fetch
python3 tools/build_data.py --download
./tools/godot --editor --path game
node tools/render_submission.mjs --handout-only
python3 tools/verify.py --build --browser --native-window --godot-browser
node tools/render_submission.mjs
node tools/record_pitch.mjs --record
python3 tools/package_candidate.py
python3 tools/check_candidate.py
```

The aggregate browser checks require the local server. Native GUI QA uses isolated Xvfb/xdotool; scoped Orca QA has its own documented dependencies. For browser/PDF/video tooling, copy tools/browser-package.json to .tools/browser/package.json and install there. Set BROWSER_EXECUTABLE to Chromium if the recorded default is unavailable; review/approve the FFmpeg package's install script before its rebuild. These tools are not required to play the built exports.

Godot 4.7.2 and matching templates were verified against official SHA-512 sums; GUT is 9.7.1. Compatibility rendering and single-threaded web export are used. The unchanged CCPC snapshot reproduces 32 CSV, 9,773,730 rows and 33 aggregates; see the [source register](docs/source_register.md) and data validation report. Asset catalogs resolve 32 roles. Final artwork/sounds are original, and the font/engine notices ship.

## Data, privacy and evidence boundaries

Sum counts before dividing: participation is SV/(SV+NV), while unknown classification is NS/LN. NS is not abstention or a null ballot. Sources, year, geography, bases and limits remain visible. The consultation is synthetic; every project, an unmarked ballot and declining can finish. Ballot choice and option-linked results are never persisted.

The original blueprint/learning-outline Markdown and DOCX, research ZIP and rubric PDF remain preserved inputs. The old generic candidate ZIP is historical; use Latas_Reto_3.zip for this classroom revision. No commits or public release were made.

No teacher/student pilot, representative screen-reader-user evaluation, adoption or turnout effect is claimed. Other browsers/touch, arbitrary Linux portability, physical printing and audio listening remain unverified. Web use requires HTTP/HTTPS; it is not an offline PWA or a file:// application. Linux and paper provide the disconnected alternatives.
