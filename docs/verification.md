# Verification · sequential play and pink campaign · 27 October 2026

Team **Latas**, Reto 3. This revision separates people from objects, removes floor text, simplifies the six shared questions and gives the citizen poster and ending a coherent pink design. The route is **Luz (left) → Mateo (center) → Inés (right) → press (left) → FIN**. Every house remains enterable; WASD is the only Godot travel. The [design contract](sequential_campaign_design.md) and [poster review](poster_design.md) describe the implementation.

## Executed checks

| Check | Actual result |
| --- | --- |
| Python suite | 39 passed: data, content, assets, fonts, PDF contrast and export contracts. |
| Node suite | 46 passed: six activities, all 496 state pairs in both measures, exact comparison, campaign state/privacy and PDF generation. |
| Godot/GUT | 73/73 passed; 2,022 assertions; zero orphan reports. Covers target resolution, object/host separation, optional review, ending input/focus, migration, frozen jobs and all five consultation actions. |
| Original exports | Both release exports succeeded. `sequential-linux-build.log` and `sequential-web-build.log` identify the commands. |
| Compiled Linux PCK | All five consultation paths pass, including print, reveal/skip/reduced-motion checks and private saves. This scripted fixture is separate from real-input GUI acceptance. |
| Exported semantic HTML | Full keyboard/six-activity journey, all five actions, actual Carta downloads, frozen jobs, cancellation/failure/reload/reset and privacy pass in Chromium 153.0.8010.12. |
| HTML layout and ending | 320/768/1440 px and CSS text at 200% pass. Normal reveal measured 2.062 s in the final pass; button/E/Enter skip and reduced motion pass. Checked axe states have zero violations; the FIN contrast incomplete result is retained, not silently treated as certification. |
| Poster generation | Six native/JS pairs byte-identical and color rasters identical. All 12 color and 6 grayscale pages inspected; strict PDF offsets, embedded fonts, Spanish extraction, Carta bounds and exact data/source checks pass. |
| Actual Linux window | Passed in 459.925 s: 114 movement, 41 poster, 20 dialogue, 8 prompt and 8 finale checks; 138 captured checkpoints; zero runtime errors. First reveal observed in 2.371 s; normal/enlarged fixed controls, full-poster scrolling, save cancellation, privacy and reset pass. |
| Actual browser canvas | Passed in 729.119 s: 114 movement, 8 prompt and 5 finale checks; 136 captures and 14 save checkpoints. Seven full-card comparisons have F1=1.0 against the unchanged 0.90 gate. Real E skip, PDF download, enlarged controls and reset pass; zero browser/page/request errors or reference mismatches. |
| Native filesystem PDF | Passed in 149.857 s: two actual FileDialog saves, identical 132,861-byte Carta PDFs, exact values/source, 169 words inside page bounds and zero runtime errors. Fresh reduced-motion FIN observed in 0.511 s. |

`python3 tools/verify.py --browser` completed all seven commands again after the runtime harness and documentation freeze. `verification-core-sequential.json` preserves the final receipt: 97 sources and 39 exported files, with all current hashes independently matched. `sequential-core-initial.json` retains the earlier pass. `verification.json` aggregates the three separately completed real-input commands after auditing 443 artifact paths, including scripts, sources, exports, captures, native references and PDFs/renders. No source fingerprint was replaced with an untested revision. Four canvas GPU ReadPixels warnings remain recorded; they are not script errors.

## Findings resolved and visual review

New interaction regressions first reproduced the shared press/Luz action and prompt inconsistencies. One nearest-target resolver now supplies the prompt, contextual button and activation. The press never begins Luz's lesson; the noticeboard and ballot box have their own actions. Data removed from the floor remain available in the diary and evidence panels.

The independent source review found two revisit defects: closing the first FIN could leave focus on a hidden control, and completed hosts lost their optional review after the meeting. Both were fixed and covered by regressions. Ending tests exercise actual viewport input, contained movement, skip, reduced motion, reopening and safe cleanup. The sheet reveal waits for container layout, which fixes the initially misplaced sheet and narrow FIN title.

Main inspected the actual Linux proximity prompts for Luz and the press, the published full poster, normal/enlarged FIN and its scrolled evidence footer, the exported HTML summary/enlarged FIN, and the actual saved PDF plus color/default and long-label grayscale generator renders. The poster uses a 38 pt invitation and at least 10.5 pt PDF text. Pink/white contrast is 6.359:1; ink/white is 15.933:1. Direct labels and a common scale preserve the comparison in grayscale. Full sources, bases, NS and limits remain part of the poster, while the compact Godot ending has an enlarged view.

The six PDF cases include count, proportion, long names, unavailable proportions, exact ties and display-rounded near ties. Findings compare exact fractions; percentages alone are rounded. The guided example in `submission/cartel_ciudadano_ejemplo.pdf` is byte-identical to the actual-data default sample, SHA-256 `affd8a6f3177450221e1f341e956dc3ce7904b72529bd2cfb625e7abca254d38`. Synthetic regression fixtures are QA evidence, not dissemination examples.

The larger poster requires real scrolling. The runtime harness checks overlapping scroll frames and the full assembled card, including source and limits. Its ink and pixel-reference thresholds remain strict. The shorter neutral machine panel needed a crop beginning at y=210 instead of y=264; the old crop excluded its text. The first native run stopped at 391.470 s because a fixed-controls comparison extended to y=240 and included scrolling poster rows beginning at y=223. The actual heading and all controls through y=220 were pixel-identical. The corrected region retains exact equality; the failed receipt/log and captures are preserved in `sequential-native-attempt-1`. The fresh complete run passed. These are layout-specific test corrections, not suppressed product errors or relaxed thresholds.

The native outer runner now allows 600 seconds for the expanded physical route and scroll/ending checks, which took 459.925 seconds in the passing run. The internal 2.5-second reveal, exact-image, privacy and runtime-error assertions are unchanged. Canvas retains its 900-second watchdog and 930-second outer allowance.

Generated PDFs use fixed-width cross-reference rows with significant trailing spaces. `.gitattributes` now treats PDFs as binary, preventing text normalization; no PDF bytes were altered to satisfy a whitespace check. Source `git diff --check` passes.

The first clean-package check validated all 847 manifest entries and the extracted Linux boot, then rejected the compiled journey's updated completion line. The process had exited successfully with all five choices and normal/E/Enter/button/reduced ending modes exercised; the checker still expected the old shorter line. `tools/check_candidate.py` now requires the full current completion line exactly, retaining the exit-code and runtime-error gates. The failed receipt/log and former checker are preserved in `sequential-clean-attempt-1`. Rebuilding with the corrected validator and rerunning the complete clean check passed, including the extracted HTML journey and Godot startup.

## Provenance and limits

The canonical CCPC bytes are unchanged: federal election 2024, previously reproduced from 9,773,730 rows into 33 aggregates. Retained source SHA-256: `c0de34d04e782ad99579b83591a6e3e6c8d1e20f4914d4845743bd79d2bd28b2`. No new raw acquisition or individual-level inference is claimed. Historical observations and the synthetic consultation remain separate. Original blueprint, learning outline, rubric PDF and research ZIP remain preserved.

Original art/SFX, the separately credited CC0 Sunset Walk music and libre Atkinson fonts retain their provenance. Playback/loop/mute/volume checks are recorded; listening comfort and an inaudible loop seam have not been established by listening review. Six Chromium OGG range cancellations are retained separately; media playback and script/resource checks passed.

The 25 October Orca observations are historical. Current keyboard, responsive and axe checks do not establish a fresh screen-reader evaluation, native browser zoom or formal accessibility certification. The searchable PDF is not tagged PDF/UA. No teacher/student pilot, learning-gain measurement, hardware-printer test or official committee score is claimed. The 10–15 minute learner duration remains a design target.

## Media, rubric and candidate

The revised two-page Carta classroom sheet and guide are present in both the submission and web export. Its owner inspected both pages and checked 320/768/1440 px HTML layouts; `build/media-review-sequential-2026-10-27/classroom-review.json` records the reviewed bytes. The narrative (4 pages), presentation (10 slides) and classroom sheet (2 pages) have all 16 pages visually reviewed in `document-review.json`. Main additionally inspected the final presentation's ending slide.

The refreshed H.264 1920×1080/30 fps demo has a 141.833333-second video track and 141.867-second container. All 32 captions and 42 extracted samples (38 standard, four additional) were inspected. The maximum caption rate is 21.997 characters/s, within the unchanged 23-character/s gate and 150-second cap. Full decode passes. `pitch-review.json` and `final-review.json` in the same media-review directory bind the reviewed media to its current inputs; `pitch-encoding.json` identifies the MP4 and 21 production inputs. The actual personalized pink PDF download is also reviewed. The silent automated recording and sampled review are not continuous human playback, audio evaluation or participant research.

The runtime owner also records bound visual reviews in `sequential-native-visual-review.json`, `sequential-native-pdf-visual-review.json` and `sequential-canvas-visual-review.json`; `sequential-runtime-summary.json` consolidates exact identities, the corrected test crops and scope. Main additionally inspected the canvas full poster, downloaded PDF and enlarged FIN footer.

The [fresh independent rubric review](rubric_review.md) assigns **95/100: 35/35 thematic fit, 29/30 clarity, 18/20 creativity and 13/15 institutional viability**. It records residual density in supporting materials, familiar underlying interaction mechanisms and missing use/access validation as deductions. It found no remaining concrete code/runtime/media blocker. The earlier 100/100 report is preserved unchanged and is not reused.

The refreshed local candidate passes safe extraction, CRC/every manifest hash, isolated Linux boot, all five compiled consultation paths and ending modes, the HTML journey and Godot web startup. The validator records the checkout tooling used alongside the isolated runtimes. `submission/release_manifest.json` inventories the included files, and the external `build/evidence/clean-candidate.json` binds acceptance to the exact final ZIP. The archive is repackaged and rechecked after closing these documentation tasks; no recursive archive hash is embedded in its own contents. RV21–RV26 are complete within this recorded local scope. Signing, public hosting and external submission remain separate.

The prior campaign verification is preserved as [historical context](verification_campaign_2026-10-27.md). Its 134-test count, timings and media identities do not certify this revision.
