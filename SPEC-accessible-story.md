# SPEC: accessible-story

**Campaign amendment · 27 October 2026:** Provide the same ordered speech, optional libre music, Inés dispatch, Luz printing and explicit FIN through independent semantic HTML navigation. Download the actual Carta PDF locally. Migrate saves to version 3 while keeping selections/jobs/ballots memory-only; no cross-route storage synchronization. See [contract](docs/campaign_finale.md).

**Classroom amendment · 25 October 2026:** The independent semantic HTML route has three enterable house sections, restored focus, the same six activities and two transfers, optional mathematics, artifacts and ending. Shared content validation rejects missing fields. Keyboard and responsive checks run against the assembled export; assistive-technology observations are scoped in the verification record. See [design](docs/classroom_redesign.md), [tasks](tasks/todo.md#classroom-revision) and [current evidence](docs/verification.md).

Version 2 · 25 October 2026 · Owner: web contributor; integration: main.
Implementation and current verification evidence are recorded in [verification](docs/verification.md). Run the applicable suites and exported journeys after changes; previous results do not certify a changed artifact. Formal user evaluation remains distinct from automated checks.
Depends on `ccpc-data`, `evidence-quests`, and `community-choice`.

## Objective

Deliver a first-class semantic HTML route through the same civic story, two data quests, sourced exhibit, consultation, and ending. It must work independently of the Godot canvas. A user must be able to understand a real pattern, identify its limits, and choose a meaningful follow-up through keyboard and assistive technology.

## Structure, commands, and provider boundaries

HTML/CSS/JavaScript belongs under the web owner's chosen `web/` structure. Read or package copies of the canonical `game/content/ccpc.json` and `game/content/story.json`; do not maintain a second hand-edited dataset. Main and web reconcile relative paths and release output locations before packaging. Shared data/rule contracts are defined in the provider specs.

```sh
python3 tools/build_data.py
node --test tests/*.test.mjs
python3 tools/export_game.py --target web --asset-set original
python3 -m http.server 8765 --bind 127.0.0.1
```

These entry points are implemented. The web export assembles `web/` and canonical JSON into `build/web/`, with Godot under `game/`. For the smoke runner's default layout, serve repository root and open `http://127.0.0.1:8765/build/web/`; run `node tests/browser_smoke.mjs` with the installed browser tooling. Serving `build/web` directly is a separate manual preview. Neither method establishes hosting, offline caching or `file://` support.

Use semantic headings, real buttons/links, labelled form groups, tables with captions/headers, restrained live announcements, visible focus, and focus restoration on panel close. Prefer vanilla web APIs and a static delivery over new dependencies. Any code sample or path remains a contract to reconcile with actual files, not proof they already exist.

## Content and interaction

Provide an introduction, settings, both quest interactions with hints/feedback/transfer cases, source details, final exhibit, synthetic choice, and reflection. Preserve the distinction between independent and assisted completion. Values and accepted answers follow provider records/rules; data changes must update the interface consistently.

Every chart has equivalent exact-value text/table content with year, geography, denominator, source and limitation. Use labels or patterns as well as color. All essential narrative/audio information appears as text. HTML remains usable if the game engine fails; invalid/missing content instead produces an honest unavailable state with recovery guidance.

The optional archive poster workshop implements EVID-06 with labelled keyboard selectors, a preview and a distinct publication action. Changing the states, count/proportion lens or neutral discussion prompt changes the public artifact. The same publication appears in the archive, exhibit and meeting; editing/cancelling cannot silently replace it. Keep it in session memory only, clear it on reset and never claim an old saved example was authored in the current session.

Progress may be local to this route; cross-route save synchronization is not required. Apply the play-session save allowlist and consultation privacy rules. Storage refusal/corruption permits a fresh or memory-only session; no account or network telemetry.

## Acceptance and verification

- HTML-01: Complete both quests, all consultation actions, and the ending without running the canvas. Expected answers and aggregate outcomes match shared fixtures; sources and limitations match the game.
- HTML-02: A full keyboard run has visible focus, logical order, no traps, and equivalent controls for every manipulation. Enlarged text and 200% zoom preserve controls/content; check a narrow viewport for reflow.
- HTML-03: Test headings, labels, tables, announcements, and reading/focus order with an actual available screen reader. Record browser, OS, assistive tool and result. Do not substitute static markup inspection for a claimed screen-reader pass.
- HTML-04: Check contrast against WCAG 2.2 practical benchmarks (4.5:1 normal text, 3:1 large text and meaningful UI graphics), mute/reduced motion, missing data, repeated clicks, reset and unavailable storage. These checks alone do not establish full WCAG conformance.
- HTML-05: Record exact tested desktop browser/version and verify asset/content relative URLs from the packaged location. Additional browsers, touch, and standalone offline web caching are unverified until tested.

Always keep the HTML route independent and equivalent in learning content, not merely a transcript. Main/web may refine implementation paths under the approved scope and update docs together. Ask only for material expansion or public release. Never claim automatic canvas screen-reader support or untested accessibility results.
