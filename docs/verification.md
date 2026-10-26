# Verification · classroom candidate · 25 October 2026

Team **Latas**, Reto 3. The classroom revision has six canonical conceptual activities, three enterable houses, two sourced CCPC artifacts, an optional poster workshop, a fictional consultation, a neutral ending and an independent HTML route. The current suites pass **30 Python + 33 Node + 31 Godot tests = 94 tests; 1,128 GUT assertions, zero orphans**. [verification.json](../build/evidence/verification.json) fingerprints the tested source and exported files and records the final command results.

## Commands and observed results

| Executed check | Result and scope |
| --- | --- |
| Python unittest discovery in tests | 30 pass: data invariants, content and original/development asset contracts. |
| Node test runner, tests/web.test.mjs | 33 pass: exact comparisons, canonical content/scenarios, six activities, corrected/authored posters, all 496 state pairs in both measures and orders, privacy, legacy saves and optional mathematics. |
| Godot headless GUT, game/tests | 31/31, 1,128 assertions, zero orphan warnings. Includes all 496 state pairs in both measures, real Area2D door/exit input, retries, invalid content/state IDs, unavailable data, partial saves, ties, poster publication/cancellation/reset and readable journal status. |
| tools/export_game.py, web and linux, original assets | Both succeed. Import/build/export logs are in build/evidence. |
| Native binary with --headless --quit-after 10 | Boots successfully. This check alone does not prove interactive completion. |
| Pinned editor with the compiled Linux PCK and tests/native_journey.gd | Both quests and all five consultation choices finish; stored progress excludes ballot/result fields. |
| tests/browser_smoke.mjs | All six activities and five ballot actions through keyboard events; poster composition, preview/revision/publication, Inés acknowledgment, archive/exhibit persistence within the session, cancellation/reset/reload, exact sources, unavailable/close data, missing optional metadata, denied storage, classroom resources and Godot web startup pass. |
| Browser layout/access scan | No page overflow at 320/768/1024/1440 px; CSS text enlargement at 200%, sampled text contrast and axe-core 4.14.0 pass. Three house scans report zero violations and no incomplete rules in their tested states. This is not a WCAG certificate. |
| tests/native_window_smoke.py | Actual release window, isolated Xvfb and keyboard/mouse: physical entry/exit, all houses, both quests, poster composition/preview/source/publication/cancellation, Inés, ending, settings and reset. The strict run records 23 poster checks and zero runtime errors, including duplicate-state feedback and visible Tab/Shift+Tab focus with enlarged text. |
| tests/godot_browser_smoke.mjs | Exported canvas, fresh Chromium context: physical doors, all houses, six decisions, the authored poster and meeting, cancellation/reset, ending and private save. Pixel comparisons use current native references; the report records comparison scope and errors. |

Both original exports were regenerated with `python3 tools/export_game.py --target linux --asset-set original` and `--target web --asset-set original`. The final aggregate command is `python3 tools/verify.py --browser --native-window --godot-browser`. Earlier checks exposed an ambiguous teacher-guide selector, then actual interface defects described below. No failing product check was skipped or weakened. Verification rejects source changes during a run; packaging rejects changed source/output fingerprints.

## Direct interface and assistive observations

Main inspected revised native/browser captures: all three interiors have readable paths, the archive changes from an unchecked claim to a sourced count/proportion correction, comparison cards preserve separate bases, the doorway label is clear, and the ending fits. The Godot focus border was darkened after a measured 1.94:1 contrast problem; the replacement is 3.26:1 against the focused button fill. These are agent visual/operator checks, not participant feedback.

The workshop review found and repaired off-screen keyboard focus, an unsupported state ID, a physical archive label still showing the guided example, and missing browser-font status symbols. Scroll focus follows the selected control after layout; duplicate-state feedback stays visible. State IDs are restricted to 01–32. The physical archive now reflects the publication. The journal uses “Listo”/“Pendiente”; read-only inspection of the bundled TTF's character map confirmed the old circle/check symbols were absent and the remaining script/story characters were supported.

The Linux **release** export then reproduced the embedded-popup signal errors in [Godot issue 89657](https://github.com/godotengine/godot/issues/89657), which editor/GUT runs had not exposed. Linux dropdowns now use documented native popup windows; the web retains embedded popups. Repeating the actual release interaction produced zero runtime errors. The check still fails on engine errors; no debug export or error filtering was used to get a pass.

Actual Orca/AT-SPI smoke, native 200%/400% browser zoom, table reading and announcements are recorded in [accessibility_review.md](accessibility_review.md) and the assistive evidence. The first smoke exposed silent status feedback. The explicit polite announcer covers correct, wrong, repeated, corrected-after-retry, assisted and chapter-ready messages. The workshop checks add real select labels, selected state/question, preview/publication speech, cancellation and reset. A missing Inés acknowledgment was added to the meeting. Consult the final assistive report for current hashes, results and limits; a browser scan does not substitute for speech evidence.

Environment: Ubuntu 26.04.1 x86_64, Chromium 153.0.8010.12, Playwright 1.58.2 and Godot 4.7.2 Compatibility/single-threaded web. GUI tests use a private X display and isolated saves. Input-method and software-rendering V-Sync warnings are recorded; no game script errors occurred. Audio audibility, pronunciation and listening comfort were not evaluated; mute and reduced-motion controls were exercised.

## Source and asset provenance

The unchanged official federal-2024 CCPC ZIP was previously reproduced: **32 CSV, 9,773,730 rows, 33 aggregates**. SHA-256: `c0de34d04e782ad99579b83591a6e3e6c8d1e20f4914d4845743bd79d2bd28b2`. See data/validation_report.json and bundled metadata. This revision retains those data bytes; it does not claim a new acquisition, uniqueness audit or participant-level inference. Counts are summed before dividing; NS is unknown classification.

Godot/templates were verified against official SHA-512 sums; GUT is 9.7.1. Both asset catalogs resolve **32 roles**. Final illustrations/sounds are original; Atkinson fonts retain OFL notices. Engine copyright/license notices ship. Reference packs and raw data remain development inputs outside the ZIP. Original blueprint/learning-outline DOCX/Markdown, rubric PDF and research ZIP were preserved.

## Materials and limits

The classroom resources include a teacher guide and two-sided sheet. All **16 pages** of the four-page narrative, ten-slide presentation and two-page sheet passed visual review. The refreshed Latas demonstration measures **136.37 seconds, 1920×1080, 30 fps, H.264/yuv420p**, with 27 captioned scenes; all **32 encoded frames** passed visual review and the 27 subtitle cues match the transcript/receipt without overlap or truncation. The encoding receipt hashes its actual inputs and output. [Handoff](handoff.md) records the final review and clean-package scope; [rubric review](rubric_review.md) records the independent internal **100/100** assessment. The recording is automated interaction, not a learner timing study. The 10–15 minute adventure and 20-minute class remain planning targets; the poster workshop is optional.

`tools/package_candidate.py` writes submission/Latas_Reto_3.zip after checking runtime and video input/output hashes. [Clean extraction evidence](../build/evidence/clean-candidate.json) is a separate receipt identifying the finished archive; it is excluded from its own hash-dependent ZIP. Local packaging is distinct from external submission.

**Not performed:** a teacher/student pilot, representative screen-reader-user evaluation, audio listening assessment, touch/other-browser checks, physical printing in the receiving classroom, or deployment on arbitrary Linux systems. No learning gains, adoption, accessibility certification or turnout effects are asserted. Signed letters, authorized hosting/access and deadline-timezone confirmation remain team actions in [submission_checklist.md](submission_checklist.md). Blank official forms and their hashes are included; none was signed or sent.
