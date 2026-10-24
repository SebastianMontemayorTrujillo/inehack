# Verification baseline · 24 October 2026

Final reconciliation of main's confirmed results and local evidence: **48 automated tests passed — Python 22, Node 17, Godot GUT 9/9; GUT recorded 40 assertions and zero orphans**. Browser all-path checks also passed. This documentation update reads records and main's confirmation; it does not rerun those suites. Results describe the tested working-tree candidate, not later changes, and no commit identity is invented.

| Area | Recorded result and scope | Evidence / provenance |
| --- | --- | --- |
| Toolchain | Godot 4.7.2 and matching export templates installed; archive SHA-512 values verified against official sums. GUT 9.7.1 installed. | Main confirmation; [toolchain manifest](../.tools/toolchain.json), `tools/bootstrap.py`. GUT archive has a recorded SHA-256; official SHA-512 verification refers to engine/templates. |
| CCPC | Official raw ZIP SHA-256 matched; 32 CSV, 9,773,730 rows, 33 aggregates: national + 32 states. Recorded arithmetic reconciliation failures: zero. | Main confirmation; [validation report](../data/validation_report.json), [runtime bundle](../game/content/ccpc.json). Does not establish source uniqueness/exhaustiveness or motives. |
| Python | **22 tests passed**, including the golden/reproduction and deterministic-build checks. | Main's final confirmed run; `python3 -m unittest discover -s tests`. The asset register preserves an earlier run's count; this final confirmation supersedes it. |
| Node | **17 tests passed** for web/shared rules. | Main report; `node --test tests/*.test.mjs`. No claim that this alone tests accessibility. |
| HTML journey | Playwright completed both evidence chapters, consultation and ending for **A/B/C/unmarked/decline**. Persisted completed progress survived reload; tested stored keys exclude choice/votes/decision/result/followup. | [Browser results](../build/evidence/browser-results.json), `tests/browser_smoke.mjs`, captures below. Not an independent privacy/security audit or a keyboard-only walkthrough. |
| Responsive HTML | No horizontal page overflow at **320/768/1440 px** in tested states; large-text/reduced-motion setting classes checked. | Same Playwright run. Does not establish every state's reflow, zoom behavior, contrast or formal accessibility conformance. |
| Godot web | Export succeeded; web game booted in Playwright Chromium; captured page/console errors were empty for HTML and game. | Main report, browser results and game captures. **Boot is not a complete Godot playthrough**. |
| Linux | Export succeeded; native binary **headless boot passed**. | Main report; [Linux export log](../build/evidence/linux-export.log), output `build/linux/voces-de-la-plaza.x86_64`. Interactive Linux journey, audio/input and installation portability are not established by headless boot. |
| Godot/GUT suite | **9/9 tests passed, 40 assertions, zero orphans**: 7 pure-rule tests + 2 repaired journey tests. | [Recorded GUT output](../build/evidence/godot-tests.log), `game/tests/test_civic_rules.gd` and `game/tests/test_journey.gd`. [Verification report](../build/evidence/verification.json) records commands and tested-source fingerprints. |
| Godot automated journeys | Declined-ballot full-story flow, wrong-answer retry, save allowlist, corrupt-save recovery, blocked chapter and focus-related repair verified by the passing suite. | Same GUT run. Direct scene/method automation is not a manual keyboard walkthrough of web/Linux exports. |
| Compiled PCK five-path QA | **Passed all five consultation paths with zero failures and clean teardown**. Separate from the 48 unit tests and native executable headless boot. | [Compiled-pack log](../build/evidence/compiled-pack-journeys.log). `tests/native_journey.gd` runs against the exported Linux PCK using the pinned editor's external-script runner; it is not a manual native GUI test. |
| Assets | Original/development validation, production staging and 26-role Godot import smoke recorded; original-set exports succeeded. | [Asset register](asset_register.md) and main's export report. Asset docs remain owned by the asset contributor. Final audiovisual behavior and human rights review remain separate. |

## Outputs and captures

Implemented outputs: [assembled web/HTML entry](../build/web/index.html), [Godot web entry](../build/web/game/index.html), native Linux binary at `build/linux/voces-de-la-plaza.x86_64` with its packaged PCK. Exporting the game is distinct from packaging all mandatory submission artifacts.

Playwright captures: [HTML desktop](../build/evidence/html-desktop.png), [HTML ending](../build/evidence/html-ending.png), [HTML responsive](../build/evidence/html-responsive.png), [Godot web boot](../build/evidence/godot-browser.png), [Godot plaza](../build/evidence/godot-plaza.png). Screenshots are recorded evidence, not a claim this documentation update visually inspected every state.

With the server launched at repository root using `python3 -m http.server 8765 --bind 127.0.0.1`, the tested entry is `http://127.0.0.1:8765/build/web/`; Godot is under `build/web/game/index.html`. `node tests/browser_smoke.mjs` uses `PREVIEW_URL` (default `http://127.0.0.1:8765`) and an available Chromium/Playwright installation. Serving from `build/web` instead makes `/` the site entry; that is a manual preview variant, not the test runner's default path.

## Local drafts and delivery review

All local draft artifacts are produced. Main confirms the following measured/inspected facts; this documentation update does not claim to have repeated the media inspection:

| Artifact | Confirmed result |
| --- | --- |
| [Narrative/dissemination PDF](../submission/voces_narrativa_y_difusion.pdf) | **4 pages, Letter, 11 pt**. Asset QA worker visually inspected every page. |
| [Presentation PDF](../submission/voces_presentacion.pdf) | **10 pages, 16:9**. Asset QA worker visually inspected every page. |
| PDF visual QA | **All 14 pages inspected; no clipping reported**. This is layout QA, distinct from final team/civic/rights review. |
| [Actual screen-recorded MP4 draft](../submission/voces_pitch_borrador.mp4) | **108.07 seconds (1:48.07), 1920×1080, 30 fps, H.264 High, yuv420p**, measured with FFmpeg and confirmed by main. Silent, captioned demonstration; **no recorded narration/voice-over**. |
| [SRT captions](../submission/pitch_subtitulos.srt) and [separate transcript](../submission/pitch_transcripcion.txt) | Included. These describe the silent demonstration; no voice recording is implied. Human voice-over is optional and would require review of any new version. |

Draft generation, PDF layout QA and reported video measurements are complete. The [candidate ZIP](../submission/voces_de_la_plaza_Reto_3_candidato.zip) and [hash manifest](../submission/release_manifest.json) are produced by `tools/package_candidate.py`, guarded by tested-source fingerprints. Clean extraction into a new temporary directory passed ZIP CRC and every manifest file hash, then booted the extracted native binary with isolated user directories and no stderr. Playwright against a server rooted in that extracted directory completed both HTML quests, all five consultation choices, persistence and three-width checks, and booted Godot web with no captured errors. See [clean extraction evidence](../build/evidence/clean-candidate.json). Runtime files are unchanged by the final documentation reconciliation. Team review, team-name/forms and hosting/access remain separate. Candidate packaging is not external submission.

Delivery review items: **team review**, **required signed letters**, **read-only hosting/access**, **formal screen-reader evaluation** and **user pilot**. Screen-reader evaluation and user pilot have not run; no learning/retention/turnout effect is claimed. Forms, recipients and deadline checks remain with main/team's submission checklist; local implementation does not need renewed phase approval.

**Internal quality versus official submission:** formal screen-reader evaluation and user pilot are the project's internal quality/evaluation checks, not asserted official entry requirements. Their open status records evidence limits and does not imply missing mandatory contest artifacts. Official forms and required delivery/access conditions are tracked separately in the submission checklist.

The runtime/export results above are complete within their recorded automated scope. They do not establish untested browsers, universal accessibility, every manual interaction, offline web caching or Linux portability on arbitrary systems. The 10–15 minute activity duration is a design target rather than a participant-study result; the **108.07-second demonstration** is a different activity. No generation or recording remains outstanding for the listed drafts.

Update this record and [task status](../tasks/todo.md) only when new results are confirmed. Historical research checks remain attributed to their original sources; new implementation evidence above supersedes the old “research only / engine not installed” baseline.
