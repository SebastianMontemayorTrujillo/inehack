# Reto 3: rubric review of the classroom candidate

25 October 2026. This is an internal model review, not a committee result or a prediction of winning. The user requested repeated improvement toward 100/100; scores must follow the evidence. No teacher, learner, institutional adoption or electoral-impact result is invented.

## Authority and scoring

The supplied three-page official rubric is `Rúbrica de evaluación_Hackaton -1.pdf`, SHA-256 `a5848c3f7100404a118cadd3efddaa73a8ad4c09942b452a345d86ab5b1f5f28`. Its four weights are 35/30/20/15. Excellent bands are 30–35, 26–30, 17–20 and 13–15; being in the excellent band does not automatically mean maximum points. The committee averages five individual assessments. Thematic fit, then clarity, break ties.

The [official call](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf) defines the Reto 3 artifacts and audience/message/prototype/dissemination requirements. Its five named considerations do not create a fifth numerical category absent from the supplied rubric. A teacher pilot and formal accessibility certification are not asserted contest requirements. They remain limits on claims about actual learning and accessibility.

## Iterations and changes

| Review | Findings | Action and evidence |
| --- | --- | --- |
| Planning baseline, 24 October | 79/100: thematic fit 31, clarity 23, originality 14, institutional reuse 11. Arithmetic barriers, no enterable interiors, weak classroom reuse. | Historical baseline in `classroom_redesign.md`; conditional 91 target was a planning estimate. |
| First implementation review | Required story fields insufficiently validated; zero-data assistance did not advance; consultation used duplicated constants; partial saves bypassed the proper prerequisite; float comparisons could misgrade close ratios. | Shared schema validation, explicit supported continuation, canonical roster/scenarios, first-missing prerequisite helper, exact integer ratio comparison. Regression failures were reproduced, then fixed. |
| Second code and interface review | Invalid display metadata could crash; rejected content still reached diary/reset; rounded-equal labels contradicted exact grading; tie feedback claimed a winner. | Strict display metadata/limits, guarded rejected-content actions, exact-derived plain explanation when rounded rates look alike, neutral follow-up after ties. GUT increased to 22 passing tests/103 assertions; HTML replacement-data journey also passes. |
| Actual assistive-technology smoke | Orca read controls/tables and zoomed layouts but did not announce implicit status feedback automatically. | Reproduced using actual Orca/AT-SPI in an isolated session. Repair and final observation are recorded in `accessibility_review.md`; a DOM inspection alone is insufficient evidence. |
| Independent provisional rubric review | 88/100: 33 thematic fit, 27 clarity, 16 originality, 12 institutional reuse. Four concrete gaps: an overstated transfer-assessment claim, paper consultation without numeric scenarios, an implicit poster correction and insufficient operational detail in dissemination. | The statement is qualified, the sheet adds the canonical baseline and two contrasting 25-participant examples, the poster now visibly changes from an unchecked claim to an exact-data correction, and the dissemination plan assigns proposed responsibilities and a versioned review cycle. This score predates the repairs and final media. |
| Independent completed-candidate review | 97/100: 35 thematic fit, 29 clarity, 18 originality, 15 institutional reuse. All criteria are in the excellent bands. Remaining gaps: stale package facts in the submission spec and largely fixed-choice interaction with automatically generated artifacts. | The stale facts were corrected. The optional archive workshop now implements the original capability map's public-story authorship: choose two actual states, a measure and a neutral question; preview, revise and bring the published poster to Inés. Its final runtime/media acceptance and subsequent assessment must be recorded before replacing this score. |
| Final independent model review, 25 October | **100/100: 35 thematic fit, 30 clarity, 20 originality, 15 institutional reuse.** Reviewer Raman found no remaining material descriptor gap or code blocker and approved local freeze/packaging. | Meaningful poster authorship is implemented in both routes and visible in the meeting. Current documentation, 16 reviewed PDF pages and the 136.37-second demonstration agree with the verified exports. All 70 tested source files and 32 outputs match the final runtime receipt. Fresh ZIP validation is recorded separately; this is not an official result or external-submission clearance. |

The poster repair is functional: changed, equal and unavailable source records change its caption consistently in both evaluators. The archive displays the claim before completion and the sourced correction afterwards; the HTML exhibit preserves both messages for discussion. New tests initially failed, then passed. The final aggregate passes **94 tests: Python 30, Node 33, Godot 31; 1,128 GUT assertions and zero orphans**. All 496 distinct state pairs are checked against independent exact references in both measures. The native release passes 23 workshop checks without runtime errors; the exported canvas and independent HTML complete their input-driven journeys. Actual Orca passes seven feedback, two chapter and twelve workshop cases within the documented scope.

## Evidence map for the final review

| Official criterion | Maximum | Revised candidate evidence |
| --- | ---: | --- |
| Apego a la temática | 35 | Real CCPC federal 2024 counts determine national reading and state comparisons. Two sourced artifacts carry findings, bases, unknown classification and limits into the story. The consultation is visibly fictional. Classroom audience and dissemination are explicit. |
| Claridad y solidez de la propuesta | 30 | Six shared short conceptual decisions, two new transfer examples, optional calculations, repeatable aggregation, exact comparison, source hashes, data validation, regression tests, export journeys and explicit evidence limits. |
| Originalidad y creatividad | 20 | An original town and three houses turn data interpretation into an honest bulletin and corrected poster for one meeting. In the optional workshop, learners choose any two bundled states, count/proportion and a neutral question, then preview, revise and carry a visibly changed publication to Inés. Distinct characters, original visual/audio roles, plural needs and follow-up connect the adventure; HTML and paper retain the learning path. |
| Viabilidad para el aprovechamiento institucional | 15 | Static web route, Godot and Linux fallback; teacher guide, two-sided sheet, individual/pairs/projector modes, source/method documentation, local-only progress and no saved ballot. Setup, dependencies, adaptation and rights requirements are disclosed. |

## Final criterion assessment

| Official criterion | Awarded | Independent review rationale |
| --- | ---: | --- |
| Apego a la temática | **35/35** | CCPC determines the learning tasks and learner-authored communication; historical evidence remains distinct from the fictional consultation. |
| Claridad y solidez de la propuesta | **30/30** | Exact comparisons, explicit denominators/NS, traceable sources and reproducible verification support the findings. Documentation and media agree with the implementation; impact claims stay within observed evidence. |
| Originalidad y creatividad | **20/20** | The learner chooses entities, measure and discussion question, previews/revises the message and brings the resulting publication to the meeting in both routes. This meaningful authorship resolves the previous automatic-artifact deduction. |
| Viabilidad para el aprovechamiento institucional | **15/15** | Independent HTML, Linux fallback, teacher guidance, printable activities and an operational maintenance/dissemination plan support practical reuse. |
| **Total** | **100/100** | Internal independent model assessment, not the committee's score. |

The final reviewer inspected the current source, exported interactions, refreshed PDFs and measured media; verified source/output identities matched. All 32 encoded frames were also visually reviewed and all 27 subtitle cues checked against the transcript and receipt. No unmeasured educational impact was credited, and no points were deducted for a pilot or formal certification that the rubric does not require. This maximum assessment does not imply universal accessibility, demonstrated learning gains or institutional adoption.

See `verification.md` for commands and artifact identities. The final review was issued before the new archive's clean check; `build/evidence/clean-candidate.json` independently records that finished ZIP's hash and outcomes. The user confirmed **Latas** as the registered team name. Signatures, roster, authorized hosting and external delivery are tracked separately in `submission_checklist.md`; local preparation cannot manufacture them.
