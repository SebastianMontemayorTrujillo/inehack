# Architecture and implementation contracts

**Campaign revision, 27 October:** [The finale contract](campaign_finale.md) supersedes earlier three-step ending, audio and persistence descriptions. Story schema 3 supplies speech and campaign copy; saves are Godot 2 / HTML 3. Only the nearby press finishes the fourth objective. Shared font/layout resources produce local Carta PDFs; queued jobs and selections remain session-only. Music is a separately credited CC0 dependency.

**Interface revision, 27 October:** `interface_theme.gd` owns shared paper/ink control styling and `interface_shell.gd` builds the bounded HUD, passive progress and backdrop. The play-session root still owns navigation, progress and panel state; open panels disable focus/mouse behavior in the world-controls branch. No visual progress indicator is a travel action. See [interface contract](interface_polish.md).

**Movement/poster revision, 26 October 2026:** the persistent session root owns one active `room.tscn`, a persistent player and interface. `room.gd` configures the plaza or one of three interiors. Physical WASD movement crosses door/exit areas; E/Enter and the contextual button interact with nearby hosts/exhibits. No menu, Escape, prerequisite or poster action changes location. Reset begins a new session in the plaza. See [design](classroom_redesign.md), [tasks](../tasks/todo.md), and the current export identities in [verification](verification.md).

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

Godot: installed 4.7.2, matching official-SHA-512-verified templates, typed GDScript, native scenes/signals/JSON/Control UI, Compatibility renderer and single-threaded web export. GUT 9.7.1 tests rules, recovery and real room/Area2D interactions. `tools/verify.py` records current counts, logs and source/output fingerprints. Dialogue Manager is not required. Keep dependency/licence notices with releases.

HTML: static semantic HTML/CSS/JavaScript, independently usable without the canvas. `logic.mjs` validates content and calculates results; `views.mjs` renders exact tables, bars and source details; `app.mjs` owns activity/focus state. Playwright checks the six activities with keyboard events, all five consultation actions, privacy, recovery, assistance, responsive layouts, contrast and locally installed axe. Isolated assistive-technology observations are recorded separately; automated checks do not establish universal accessibility.

The story contract is `2.0.0`: six canonical activities, three houses, two conceptual transfer fixtures, optional mathematics, and canonical consultation projects/roster/scenarios. Both consumers reject missing required content. `CivicRules.first_missing` and HTML prerequisites preserve the evidence order while all houses remain enterable. Exact integer ratio comparisons avoid rounded ties (continued fractions in Godot, `BigInt` cross-products in JavaScript). Zero classified records produce an explicit unavailable state with assisted continuation.

Persistence: explicit versioned allowlist for progress/settings and limited local assessment summaries. Never serialize ballot choice, option-linked results, personal identifiers, or political profiles. Consultation calculations remain in memory; after resume show a neutral completion summary. Handle corrupt/mismatched/no storage without blocking the current journey. Cross-route progress migration is not required.

The optional archive workshop lets the learner compose a public story from any two bundled states, a count/proportion lens and a neutral discussion question. Canonical `poster_workshop` content supplies wording; generic exact record comparisons produce the finding. Godot keeps composition/view code in `poster_workshop.gd` and `poster_view.gd`. Draft and published selections are separate session memory: cancelling an edit preserves the published artifact, navigation preserves it, reset clears it, and it never enters saved progress. Publishing refreshes the exhibit in place; the player walks to Inés, who acknowledges it without changing the synthetic vote. The final poster uses a spacious paper layout with finding, comparison and conversation sections. This optional interaction does not add a required assessment.

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
| `submission/` | Classroom HTML/PDF, narrative, deck, video, local candidate ZIP and hash manifest |
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

Invalid data/schema/provenance produces a helpful unavailable state, never invented replacement counts. Canonical content validation runs in both routes. Runtime checks cover focus restoration, repeated actions, interrupted save, enlarged text, mute and reduced motion. `native_window_smoke.py` drives an isolated Linux release window; `godot_browser_smoke.mjs` drives the exported browser canvas. Their screenshots and assertions supplement GUT and compiled-PCK checks. No human pilot or measured learning gain is implied.

`node tools/render_submission.mjs --handout-only` prepares the classroom resources required by web export. The full renderer updates submission PDFs after runtime screenshots are ready. The exporter includes teacher HTML, the printable sheet, canonical content and all original role assets. `tools/package_candidate.py` refuses any source or runtime output that differs from the latest verification fingerprints. Signing, publishing and sending are separate team actions.

Keep a command/result record with actual tool versions, tested OS/browser, asset set, data version, and artifact identity. Distinguish missing tools, blocked downloads, failing tests and not-run checks. Submission assembly may proceed while external signatures/hosting/deadline checks are pending; the final checklist must expose them.
