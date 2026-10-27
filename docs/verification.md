# Verification · campaign finale · 27 October 2026

Team **Latas**, Reto 3. This revision adds libre music, translucent bottom NPC conversations, ordered learning and a citizen campaign PDF. After the consultation, Inés dispatches a frozen design; the player walks to the press in Luz's first house, prints it and reaches **FIN**. WASD-only travel and the independent HTML route remain. [The contract](campaign_finale.md) defines the behavior; [formal verification](../build/evidence/verification.json) identifies tested sources/exports.

## Executed checks

| Check | Actual result |
| --- | --- |
| Python suite | 38 passed. Content, data, assets, embedded-font reproducibility and export contracts. |
| Node suite | 43 passed. Six activities, exact comparisons, all 496 state pairs, campaign state/privacy and PDF parsing. |
| Godot/GUT | 53 passed; 1,608 assertions; zero orphans. Includes legacy saves, bottom-panel bounds, music, frozen jobs, all five consultation actions and nearby-only printing. |
| Original exports | Web and Linux release exports succeeded; logs are `campaign-web-build.log` and `campaign-linux-build.log`. |
| Compiled PCK | All five consultation actions reach the press ending; no ballot/poster selections in the save. |
| Semantic HTML | Complete keyboard journey, all five finales and real Carta downloads passed. axe found no violations in checked states; 320/768/1440 and enlarged-text checks passed. |
| PDF generation | Six native/JS pairs byte-identical; strict byte offsets, embedded fonts, Spanish text extraction, source links and one 612 × 792 point page verified. All twelve rendered pages reviewed. |
| Actual Linux window | Passed in 393.377 s: 103 movement, 31 poster, 17 dialogue and 5 finale checks; 98 captures; zero runtime errors. |
| Actual browser canvas | Passed in 653.581 s: 103 movement checks, 103 captures and 13 save checkpoints; zero browser/page/request errors or reference mismatches. Real PDF download parsed, extracted and rendered successfully. |
| Native filesystem save | Latest rerun passed in 142.769 s with prior output files present: two real FileDialog saves, identical 132,605-byte PDFs, strict parsing/extraction and Carta bounds; zero runtime errors. |

Commands: `python3 tools/verify.py --browser`, both original-catalog export commands, `python3 tests/native_window_smoke.py`, PDF sample/extraction runners and font-resource validation. The browser route additionally runs `tests/browser_campaign.mjs`. Receipts retain exact commands and artifact identities. An independent read-only code review found no blocking findings; its source review does not replace runtime checks.

`verification-core-campaign.json` preserves the formal unit/build-boot/HTML check receipt. `verification.json` aggregates the separately completed native/canvas/filesystem commands after rechecking every recorded hash. Its explicit source-update audit covers the one later supplemental-test change, which was executed successfully; no changed product source is covered by an earlier run.

## Observed fixes and visual review

New tests first reproduced the old three-step completion/save behavior and central NPC panel. The migration now accepts native schemas 1/2 without treating prior consultation completion as printing. An initial resource-loading failure was resolved by importing the newly acquired OGG. A JSON float/int array comparison was corrected in PDF page validation and save migration.

Visual inspection caught the bottom panel retaining its previous minimum height and extending past the viewport. Setting its requested size after the scroll minimum fixed it; a viewport-bound regression passes. Native captures now show the complete dialogue border at normal/enlarged text. Calculated sRGB contrast is **11.33:1** for cream speech against the 94%-opaque dark panel composited over white. Focus containment, nearby interaction and non-teleporting close behavior remain tested.

Main inspected the actual Luz conversation, early Inés redirection, dispatch, press and normal/enlarged ending captures, plus count/proportion PDFs and the file saved through Linux's dialog. The PDF uses vector bars, embedded Atkinson fonts and selectable Spanish text. Exact counts/bases/NS remain visible; percentage labels round to two decimals while findings use exact comparisons. The campaign contains no Latas/INEhack branding, synthetic tally or ballot choice. The verified guided default is included as `submission/cartel_ciudadano_ejemplo.pdf`; synthetic regression outputs remain QA fixtures, not dissemination examples.

The compiled scripted journey initially activated the press before physics had published its overlap. Waiting through physics and process phases fixed the test timing; the nearby interaction requirement was retained. Actual input-driven journeys independently verify walking to the press.

The canvas watchdog is 900 seconds, with a 930-second outer runner allowance, because the route now adds the return walk, press/PDF interaction and dialogue containment checks. Input, pixel-reference and runtime-error assertions remain strict. Four GPU ReadPixels stall warnings are retained in the browser receipt; they are not script errors or hidden exceptions.

## Provenance and evidence limits

The canonical CCPC data remain unchanged: federal election 2024, previously reproduced from 9,773,730 rows into 33 aggregates. The retained source SHA-256 is `c0de34d04e782ad99579b83591a6e3e6c8d1e20f4914d4845743bd79d2bd28b2`; no new acquisition or individual-level inference is claimed. Original blueprint/learning-outline files, rubric PDF and research ZIP remain preserved.

The approved CC0 music dependency is KiluaBoy's 76.8-second **Sunset Walk** OGG. Audio bytes are unchanged; source, author, license, hashes, decode and loop-boundary checks are recorded in [the asset register](asset_register.md). Playback/loop/mute/volume were exercised. Listening comfort and an inaudible loop seam have not been established by a listening review.

Earlier Orca observations belong to the 25 October HTML. The changed campaign interface has fresh keyboard/axe/responsive checks, but no fresh Orca run, native browser-zoom evaluation or formal accessibility certification. The searchable PDF is not tagged PDF/UA. No teacher/student pilot, learning-gain measurement, hardware-printer test or new official/model rubric score is claimed. The 10–15 minute learner duration remains a design target.

Two auxiliary captures were interrupted by process shutdown. Their failed logs are retained; the reason/sender was not established. They are not counted as passes. Isolated rerun outcomes are recorded separately.

## Media and local candidate

The campaign narrative (4 pages), deck (10 slides) and classroom sheet (2 pages) were regenerated and all 16 pages visually reviewed. The standalone citizen poster example is one additional reviewed Carta page. The refreshed demo has a 140.100-second video track (140.134-second container), 31 reviewed captions, 36 inspected encoded samples and a closing-tail sample. Maximum measured caption rate is 21.556 characters/s, within the retained 23-character/s gate and 150-second production cap. A failed timing check led to shorter captions; no quality gate was lowered. The demo is silent and sampled visual review is not continuous playback or participant research.

`document-render.json` and `pitch-campaign-media-review.json` identify the exact reviewed media; `pitch-encoding.json` binds the video to its current inputs. The assembled candidate passed safe extraction, CRC/every manifest hash, isolated Linux boot, all five compiled-PCK paths, HTML and Godot web startup. `clean-candidate.json` identifies the exact final ZIP and remains outside it. Signing, public hosting and external sending remain separate.

The earlier interface revision's verification text is retained as [historical context](verification_interface_2026-10-27.md); its counts and mutable artifact paths do not certify this revision.
