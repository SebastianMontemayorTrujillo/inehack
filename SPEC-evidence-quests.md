# SPEC: evidence-quests

Version 1 · 24 October 2026 · Owner: main, authored content/game rules.
Approved scope implemented; printing/comparison code and automated flows verified in passing Node/GUT suites and the full HTML Playwright journey. Godot GUT 9/9 passed (40 assertions, zero orphans). Remaining manual/accessibility/content checks are in [verification](docs/verification.md).
Depends on `ccpc-data` and `play-session`; supplies shared quest content/rules to `accessible-story` and the completed exhibit to `community-choice`.

## Objective

Make official data change what the player constructs and understands. Two complete chapters repair a printing mechanism and a misleading noticeboard. Each starts with a civic question, lets the player inspect exact values and sources, supports interpretation with feedback/retry/hints, and leaves a sourced artifact in the plaza. Completion recognizes evidence and reflection, not a political choice or high turnout.

## Structure and commands

Content is `game/content/story.json`, with record references into `game/content/ccpc.json`; Godot scenes/rules live under `game/`, tests under `tests/`. Keep stable quest, objective, answer, and exhibit IDs. Spanish glossary: [glossary_es_MX](docs/glossary_es_MX.md).

```sh
python3 tools/build_data.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
./tools/godot --editor --path game
```

Actual suites are implemented: Python 22, Node 17 and Godot GUT 9/9 passed as reported by main. Node checks shared/web rules; Playwright completes the HTML chapters. These passes do not certify every manual or assistive-technology path.

## Shared narrative/rule contract

`story.json` describes quest IDs, prompts, record references, selectable interpretations, hint/feedback text, transfer items, exhibit text/templates, learning objectives, and consultation reference. Official numeric answers derive from data records. Do not hide authoritative rules in canvas-only callbacks; main and the web owner agree on serialized rules or matching evaluators with shared fixtures. Human-readable explanations and tables must be available to both routes.

Quest state style: `not_started → intro → inspect → answer → feedback → transfer → complete`; wrong answers return safely to inspection. Assistance is always available, including transparent assisted completion. Record assistance separately from first-attempt correctness; never label assisted completion independent mastery. Store only allowlisted local summaries, no identifying responses.

## Chapters and acceptance

| ID | Player action | Required result |
| --- | --- | --- |
| EVID-01 | La prensa de las voces: place SV, NV, NS cards using keyboard selection or equivalent controls. | Separate classified participation SV/(SV+NV) from unknown NS/LN. NS is never abstention, null ballots, or NV. National source and exact counts are visible. |
| EVID-02 | El mapa que no lo dice todo: compare Aguascalientes and Baja California in 2024. | Baja California has more SV records; Aguascalientes has the higher classified rate. Combine counts before calculating the reproduced 50.1180%, rather than 52.8532%. |
| EVID-03 | Assemble “El dato muestra”, “No permite saber”, and “Faltan datos” panels. | Correctly distinguish an observation, unsupported motives/causality, and what further evidence is needed. No civic-worth ranking. |
| EVID-04 | Attempt a new transfer case after each quest. | New clearly labelled synthetic values test the reasoning; hint/assistance status remains distinct from independent success. No memorized-state-only check. |
| EVID-05 | Reopen the final exhibit in either presentation. | Same findings, counts, denominators, year, geography, limitations, source links, and reflection. Visual encodings have text and exact-value table equivalents. |

A synthetic formula fixture `SV=60, NV=30, NS=10, LN=100` must produce 66.67% classified participation and 10% unknown share. No chart combines the classified percentages with NS/LN into one 100% composition. Zero classified denominator shows “Sin datos clasificables”. Synthetic transfer fixtures never carry an INE provenance badge.

## Verification and boundaries

Test correct/incorrect selections, null data, source visibility, dependent-answer changes after a fixture update, retries, interrupted/repeated completion, transfer scoring, save/resume, and parity between evaluators. Manually complete both quests with keyboard, enlarged text, no audio, and reduced motion; inspect the persistent exhibit. Record a timed exported walkthrough rather than declaring the 10–15 minute target achieved from a script test.

Always expose provenance and safe assisted progress. Main may reconcile JSON field names with implementation and the web owner without seeking renewed phase approval; update these contracts together. Ask only before material educational scope changes. Never claim learning improvement, infer motives, or duplicate official numbers into disconnected answer keys. Download and runtime checks remain main's verification work.
