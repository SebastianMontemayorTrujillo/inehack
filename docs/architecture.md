# Architecture and implementation contracts

Approved direction · 24 October 2026. Implemented paths and toolchain are reconciled below; [verification.md](verification.md) records actual evidence and limits. The architecture contract does not certify unperformed manual/accessibility checks.

## Boundaries and ownership

| Module | Provider responsibility | Consumers | Owner |
| --- | --- | --- | --- |
| ccpc-data | Validated immutable real-data snapshot and provenance | evidence-quests, accessible-story | main |
| play-session | Godot town, input, panels, settings, allowlisted save | evidence-quests, community-choice | main |
| evidence-quests | Two shared chapters, rules, transfer checks, exhibit | community-choice, accessible-story | main, web integration |
| community-choice | Deterministic synthetic rules and ending | accessible-story | main |
| accessible-story | Independent semantic HTML rendering/interactions | submission-package | web contributor |
| submission-package | Tested assembled artifacts and evidence | team/evaluators | main |

Build `ccpc-data` and `play-session` independently, then integrate quests → consultation → HTML equivalence → package. HTML shell and asset production can proceed against the contracts in parallel. Main owns shared JSON, game code, build/export scripts, data and merge reconciliation. This documentation contributor owns AGENTS, root specs/map/README, tasks, and the requested docs; asset/web contributors keep their own files. Read before editing in the shared workspace; never revert another owner's changes.

## Data and content flow

Official ZIP + dictionary → Python validation/aggregation → `game/content/ccpc.json` + manifest/report → shared story/rule references → Godot and semantic HTML → sourced exhibit and reflection.

`game/content/story.json` is the canonical authored Spanish content and synthetic-scenario source. It contains stable IDs, record references, prompts, interpretations, hints, feedback, transfer items, exhibit templates, synthetic consultation rules/options, and ending. `ccpc.json` holds real counts and provenance only. The consumers may package copies but cannot maintain independent official values. Main and web agree on field names and evaluator fixtures before integration; serialized rules or parity-tested evaluators avoid drifting answer keys.

The data provider follows the blueprint schema `1.0.0`: source, method, records, quest_refs. Exact acquisition metadata is measured from bytes. Rerunning acquisition may change metadata; rebuilding the same snapshot should not change runtime outputs. Synthetic test records and consultation fixtures carry explicit labels and never reuse a verified-INE badge.

## Runtime decisions

Godot: installed 4.7.2, matching official-SHA-512-verified templates, typed GDScript, native scenes/signals/JSON/Control UI, Compatibility renderer and single-threaded web export. GUT 9.7.1 is installed; its 9/9 tests passed with 40 assertions and zero orphans (seven rules, two repaired journeys). Python standard-library suite: 22 passed; Node built-in suite: 17 passed. Dialogue Manager is not required. Keep dependency/licence notices with releases.

HTML: static semantic HTML/CSS/JavaScript, independently usable without the canvas, with exact tables/prose. Playwright completed both chapters, five consultation actions and ending, checked persistence and 320/768/1440 px overflow; this is form automation, not formal screen-reader or keyboard-only verification. Those manual checks remain open.

Persistence: explicit versioned allowlist for progress/settings and limited local assessment summaries. Never serialize ballot choice, option-linked results, personal identifiers, or political profiles. Consultation calculations remain in memory; after resume show a neutral completion summary. Handle corrupt/mismatched/no storage without blocking the current journey. Cross-route progress migration is not required.

Assets: role IDs decouple content/scenes from source files. Development roles may resolve to the specified Kenney CC0 packs; final visible art/sounds resolve to original team assets. Missing original roles are a release failure, not permission to fall back silently. Asset owner defines/records actual IDs, authorship and licences; these docs do not overwrite that register. Typography uses the approved Atkinson/OFL reference with actual files/version verified by its owner.

## Workspace and operations

| Path | Purpose |
| --- | --- |
| `game/` | Godot project, scenes/scripts and canonical content |
| `web/` | Web owner's independent HTML route and microsite |
| `tools/` | Main's bootstrap, data builder, export entry points and Godot wrapper |
| `data/` | Acquisition/validation provenance and methods (final layout reconciled by main) |
| `tests/` | Python and Node checks, labelled fixtures |
| `build/web/`, `build/linux/` | Implemented web/HTML and native Linux export outputs |
| `build/evidence/` | Browser JSON/screenshots and export logs |
| `releases/` | Planned final submission candidate/manifest location, not yet complete |
| Root `SPEC-*.md`, `tasks/`, `docs/` | Contracts, plan, status and handoff |

Implemented command entry points (recorded outcomes, not automatic passes for future runs):

```sh
python3 tools/bootstrap.py
python3 tools/build_data.py
./tools/godot --editor --path game
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
python3 tools/export_game.py --target web --asset-set development
python3 tools/export_game.py --target linux --asset-set development
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
```

Outputs: `build/web/index.html` (HTML/microsite), `build/web/game/index.html` (Godot web), `build/linux/voces-de-la-plaza.x86_64` plus PCK. Both original-set exports succeeded; web and Linux headless boot passed. From repository root use `python3 -m http.server 8765 --bind 127.0.0.1` and open `http://127.0.0.1:8765/build/web/`. `node tests/browser_smoke.mjs` uses that default layout. Serving directly from `build/web` is a separate manual preview variant. Local serving does not imply web offline caching, PWA or `file://` support.

## Evidence and failure behavior

Invalid data/schema/provenance produces a helpful unavailable state, never invented replacement counts. Invalid content references fail validation before export. Runtime tests must cover focus restoration, repeated actions, interrupted save, enlarged text, mute and reduced motion. Automated content checks do not establish exported game behavior or accessibility.

Keep a command/result record with actual tool versions, tested OS/browser, asset set, data version, and artifact identity. Distinguish missing tools, blocked downloads, failing tests and not-run checks. Submission assembly may proceed while external signatures/hosting/deadline checks are pending; the final checklist must expose them.
