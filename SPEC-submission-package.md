# SPEC: submission-package

Version 1 · 24 October 2026 · Owner: main, package integration; team owns signatures/submission.
Approved preparation scope implemented through local draft production: web/Linux exports, all 48 tests and scoped browser checks pass. Narrative PDF (4 pages), deck PDF (10 pages) and silent captioned MP4 (108.07 s) are produced; all 14 PDF pages passed visual QA. See [verification](docs/verification.md). Team review, signed forms, hosting, formal screen-reader evaluation and pilot remain open; the local candidate is packaged and clean-checked.

Formal screen-reader evaluation and user pilot are internal quality/evaluation checks, not asserted official submission requirements. Keep their evidence limits separate from mandatory artifacts/forms and do not introduce another approval gate for approved packaging.
Depends on all other five modules. This spec authorizes local preparation; it does not authorize signing, emailing, or public release.

## Objective and structure

Assemble one internally consistent Reto 3 candidate: web/HTML and Linux outputs with their tested scope, source/content, methods/licences, produced presentation/PDF/video drafts, required letters and evidence. Implemented packaging helper is `tools/package_candidate.py`; intended output is `submission/voces_de_la_plaza_Reto_3_candidato.zip` plus release manifest. Main records actual generated outputs and remaining team-name/forms/hosting items; packaging is not external submission.

See [submission checklist](docs/submission_checklist.md) for pending requirements, [facilitator guide](docs/facilitator.md) for reuse, and [source register](docs/source_register.md) for recovered official links. Research-source statements about the call are not a fresh online check of current requirements.

## Commands and package style

```sh
python3 tools/bootstrap.py
python3 tools/build_data.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
```

Commands/scripts are implemented; original-set web/Linux exports succeeded. Python 22, Node 17 and Godot GUT 9/9 passed (40 assertions, zero orphans), with HTML journey and boot scope in the verification record. A development export is not final originality acceptance. Serve repository root for the smoke runner's `/build/web/` path; direct output-folder serving is a separate preview variant.

Manifest style: exact artifact paths, measured hashes, source snapshot identity, actual engine/template versions, asset-set identity, licence notices, tested environment, test logs, known limitations, and pending items. If no commit was requested/created, record that the candidate comes from the working tree and identify the source copy; never invent a revision ID. This assignment makes no git commits.

## Required content and success criteria

- PACK-01: Complete visual prototype and first-class HTML route, plus Linux fallback, reproduce the same two evidence quests, synthetic consultation, and ending. A clean unpack/run walkthrough checks relative paths and packaged assets; the recorded demo matches the candidate.
- PACK-02: Presentation is at most 10 slides. Narrative/dissemination PDF is 3–5 pages. Pitch is MP4, 1080p, at most three minutes, with working accessible read-only hosting. Check duration, dimensions, page/slide counts, and captions/transcript against the actual files; these documents alone are not the artifacts.
- PACK-03: Include code/repository as applicable, both official letters with all required team signatures, and correctly team-and-track-named ZIP. Team registration for Reto 3 is user-confirmed; names, eligibility and signatures are not audited here.
- PACK-04: Source/method evidence, tested environment and limitations, original final visible art/sounds through role IDs, font/engine/dependency notices, facilitator reuse, audience-specific dissemination, and honest learning-evaluation status are included. No Kenney development fallback may silently replace a missing original release role.
- PACK-05: Every claim is classified as verified here, carried from research, proposed, or pending. Report actual formative observations separately from efficacy or turnout effects. Rubric weights remain 35/30/20/15; do not invent a fifth weight or guarantee a score.

## Verification, boundaries, and open checks

Main runs data and automated tests, exports both targets, verifies the clean package and full keyboard journey, and records checks in `docs/handoff.md` or linked evidence. Human checks cover civic wording, source interpretation, rights and mandatory files. Documentation preparation is complete independently of whether a runtime passes; implementation tasks stay unchecked until verified.

Always reconcile call requirements and links before final submission, confirm the deadline timezone, and aim for an internal candidate on 30 October 2026. The source call says 31 October 2026, 23:59 without timezone. Original research describes originality/unpublished-work and rights-letter conditions; team review remains outstanding. Do not turn these external release checks into a new approval gate for approved local work. Never sign for participants, send messages, change sharing permissions, or publish without explicit authority.
