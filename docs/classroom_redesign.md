# Classroom revision: simpler civic learning and three playable houses

Design approved and implemented 25 October 2026 for introductory ethics/civic education in Mexico. This document preserves the design rationale and original 24 October assessment; those scores are historical, not the revised candidate's score. Current acceptance, artifact identities and limitations are in [verification](verification.md), [tasks](../tasks/todo.md#classroom-revision) and the [rubric review](rubric_review.md).

## Audience and purpose

Primary audience: high-school students approaching their first vote, approximately 15–18, in a teacher-supported introductory ethics class. Secondary audience: adults beginning civic education. Use the same respectful, plain Mexican Spanish for both; no separate age-based accounts or profiles. This is a proposed teaching use, not a claim of SEP curriculum certification or INE adoption.

The player should finish able to read one real participation finding, avoid inventing explanations for missing information, compare places fairly, respect different needs, and suggest one way to follow up on a collective decision. Mathematical fluency is not an entry requirement. Maintain two CCPC quests, the fictional consultation, equal endings for all five actions, the semantic HTML route and Linux fallback.

Target a 10–15 minute core adventure, with an optional 5-minute teacher-led discussion. These are design targets; measure them with actual players. Keep statistical details available for students and facilitators who want them, outside required progression.

## Self-assessment against the official rubric

Source: local `Rúbrica de evaluación_Hackaton -1.pdf`, all three pages extracted and visually reviewed. SHA-256: `a5848c3f7100404a118cadd3efddaa73a8ad4c09942b452a345d86ab5b1f5f28`. The table applies its four weighted criteria to the working prototype and proposed classroom use. Scores are reasoned internal estimates, not committee results or a prediction of winning. No student/teacher evaluation has taken place.

| Official criterion | Maximum | Current estimate | Evidence and weakness | Revision evidence needed | Conditional design target |
| --- | ---: | ---: | --- | --- | ---: |
| Apego a la temática | 35 | 31 | CCPC determines charts/answers; real national and territorial findings, provenance and a separate fictional consultation support Reto 3. Required statistical exercises weaken accessibility for this new audience. | Simple data stories remain central in both houses; changing source fixtures changes findings and accepted interpretations. Teaching purpose, audience and dissemination are explicit. | 33 |
| Claridad y solidez de la propuesta | 30 | 23 | Source reproduction, formulas, limits and automated checks are strong. The original adult audience, formula-heavy progression, and weak spatial/story connection obscure the learning logic. | Shared plain-language questions; clear reason for every house visit; guided observation before answering; teacher walkthrough and timed usability evidence with limits. | 27 |
| Originalidad y creatividad | 20 | 14 | Original art/story and two routes form a coherent prototype, but outdoor multiple-choice panels and inaccessible buildings resemble a quiz with a town backdrop. | Enter actual rooms, work on a bulletin and a comparison poster, and see those authored objects change and remain in the exhibit. The interaction serves a civic problem. | 18 |
| Viabilidad para el aprovechamiento institucional | 15 | 11 | Static HTML, Linux fallback, bundled data, notices and facilitator notes support reuse. Classroom instructions, simpler tasks and full access checks need work. | A concise teacher sheet, printable source/discussion card, modest equipment requirements, independent HTML use and documented real classroom/accessibility limitations. | 13 |
| **Total** | **100** | **79** | Internal baseline for prioritization. | Assess again only after implementation and evidence collection. | **91** |

The rubric's excellent bands begin at 30/35, 26/30, 17/20 and 13/15. The tie-break first considers thematic fit, then clarity. Prioritize those two criteria before decorative work. Enterable rooms have no separate rubric points; their value must come from improved storytelling and comprehension.

The downloaded official call's evaluation section lists five criterion names, while the supplied scoring rubric assigns weights to four. Use the rubric's explicit 35/30/20/15 allocation; discuss institutional applicability within the 15-point criterion rather than inventing another weighted category. Official interpretation remains the committee's responsibility.

Admission/delivery readiness is separate from this quality estimate: the actual call requires all mandatory artifacts before evaluation. Team name, signed letters and hosted video access remain pending in the existing checklist. A numerical self-assessment does not establish eligibility or a complete submission.

## Story and ethical logic

Opening: **“Villa Brisa quiere mejorar su plaza. Hay tres propuestas y recursos para empezar una. Antes de la reunión, ayuda a preparar información clara, comparar sin confundir y escuchar necesidades distintas.”** The player helps prepare the meeting rather than being assigned a political preference or asked to act as an eligible voter in real life.

The real-data story and the fictional practice have explicit purposes: CCPC shows historical electoral participation; the consultation lets the player practice collective discussion and follow-up. Before the consultation, explain: **“Los datos del INE nos hablan de la participación en 2024. Esta consulta es inventada para practicar cómo escuchar y tomar decisiones.”** Historical turnout does not select the plaza project or explain residents' preferences.

| Place and host | Problem/action | Learning and visible result | Target time |
| --- | --- | --- | --- |
| Plaza | Read a short invitation and choose walking or location buttons. One next-step prompt stays visible. | Understand why the three visits matter. | 1 minute |
| House 1: Imprenta de Luz | Help publish an honest bulletin using the national CCPC finding; separate missing information. Use selectable cards/buttons, with no required dragging. | Informarse y decir lo que sabemos: printed bulletin with a real finding, source and uncertainty. | 3 minutes |
| House 2: Archivo de Mateo | Repair a poster that confuses more participating records with a higher proportion. Toggle clearly labelled count/percentage views. | Comparar con justicia y evitar prejuicios: corrected AGS/BC poster and a plain limit of interpretation. | 3–4 minutes |
| House 3: Casa de reunión de Inés | Review three equally presented projects, choose A/B/C/unmarked/decline, then pick a follow-up question. | Escuchar, decidir y dar seguimiento: neutral meeting record with needs still pending. | 3–4 minutes |
| Plaza ending | Reopen the two data artifacts and read a final reflection. | One real finding, one limit and one possible civic action. | 1–2 minutes |

Each house has a real walkable interior, its named host and a meaningful object. Retain three speaking characters; no new town, economy or complex inventory. The public exhibit changes after each task, and the notebook says what was learned, rather than only displaying a score.

All three houses can be entered and exited immediately. Later hosts offer a useful preview and explain the next step. Consultation voting becomes available after the two evidence artifacts are ready; physical access is never locked behind a quiz. Re-entry restores completed artifacts, hints/settings and the current objective without erasing progress.

## Simpler questions and feedback

All six required prompts, choices, hints, explanations and transfer stimuli are now authored once in `game/content/story.json` 2.0.0 and consumed by both routes. The new conceptual checks have distinct IDs from the optional arithmetic examples. Godot and JavaScript retain small evaluators with shared canonical fixtures; real-data comparisons derive from source records.

Writing rules: one idea per screen, usually two or three short choices, everyday verbs, a prompt target of at most 22 Spanish words and choices of at most 14 words. These are internal editing targets with documented exceptions for names/source accuracy, not official rubric thresholds or a guaranteed reading level. No acronyms or terms such as “denominador” or “promedio ponderado” are required to finish. Introduce an unfamiliar word briefly when needed. Respectful language must avoid treating adults as children.

The main view uses labelled bars, “de cada 100” with its base explained, short rounded summaries and an immediately available exact-value table/source. Keep CCPC/INE, year, place and the known-information base visible; expand the derivation with **“Ver datos y fuente”** and **“Ver cómo se calculó”**. Do not hide uncertainty in a distant credits screen.

| ID / required location | Proposed prompt and interaction | Expected reasoning |
| --- | --- | --- |
| `participation-reading` / Luz | “En los registros con información, ¿hay más con participación o sin participación?” Select a labelled bar's interpretation. | Compare actual national SV and NV; include an equality state when appropriate. The expected interpretation is derived, not fixed to the current data. |
| `unknown` / Luz | “Aquí falta información. ¿Podemos decir que esa persona no participó?” Choices: “No, no lo sabemos” / “Sí, seguro que no participó”. | Missing classification remains unknown. Show it separately in the bulletin. |
| `unknown-transfer` / Luz | Show a new **invented** card set: 60 with participation, 30 without, 10 unknown. “¿Dónde ponemos los 10 registros que no tienen información?” | Put them under “No sabemos”; do not require calculating 66.67%. Logically new, short transfer still checks understanding after instruction. |
| `more-count` / Mateo | “¿Dónde hay más registros de participación?” AGS/BC choices with counts displayed. | Read the actual larger count; do not infer its percentage. |
| `higher-rate` / Mateo | “De cada 100 registros con información, ¿dónde participaron más?” AGS/BC choices, with bases and rounded/exact rates visible. | Read the higher proportion; preserve equal/unavailable behavior in the evaluator. |
| `comparison-transfer` / Mateo | Show **invented** A: 20 of 40 (50%) and B: 60 of 200 (30%). “¿Tener más participantes siempre significa tener un porcentaje mayor?” | No; compare the new displayed counts/rates without dividing. Explain that the chart does not tell us why each person participated. |
| Consultation / Inés | “¿Con cuál proyecto te gustaría empezar?” Present all five existing actions with equal completion/reward. | A preference is not a graded ethical answer. Keep needs/tradeoffs legitimate for every project. |
| Follow-up / ending | “Después de la reunión, ¿qué te gustaría revisar?” Offer budget, progress and remaining-needs prompts. | All three are valid ways to continue participating. Teacher discussion is optional and not a stored political response. |

Retain the weighted-combination explanation, exact original formula fixtures and mathematical tests in the optional detail route. Calculations remain correct: `100 * SV / (SV + NV)` and unknown share `100 * NS / LN`; combine counts first. Move the old mandatory denominator and combined-rate exercises out of completion gating. They remain optional worked examples, not silently deleted correctness checks. Completion requires the six short evidence decisions above, with transparent assisted completion available.

Preserve the old mathematical `transfer1`/`transfer2` IDs for optional examples; the new conceptual checks have new IDs so prior assessment summaries cannot imply new mastery. Completed chapter IDs remain `printing`, `comparison` and `consultation`. Location IDs are `plaza`, `printshop`, `archive` and `hall`, independent of those chapter IDs. Version the revised content contract and validate required/optional activity references, record IDs and evaluator kinds; do not execute rules as arbitrary expressions from JSON. Treat missing required content as unavailable rather than falling back to old hard-coded questions. National/state findings are not estimates of participation among the new high-school audience.

Display “cerca de 60 de cada 100 registros con información conocida” for the current national classified result; never imply 60% of all LN records. Show the unknown share separately with its own base, and keep exact counts/59.67…% in details. Do not mix classified percentages and NS/LN into a single 100% graphic. Round only for presentation; compare using unrounded calculated values. Missing data produces an unavailable explanation, not an invented result or a forced wrong answer.

Feedback describes the reason: **“Falta información. Por eso no podemos afirmar que no participó.”** Wrong answers offer “Mirar otra vez” and “Ver un ejemplo”; no lives, shame, countdown or negative civic labels. After assistance, say the task was completed with support. Two fresh conceptual transfer checks remain; completion or choosing a project never stands in for independent learning.

## Enterable-house design and Godot integration

Retain the pinned engine/renderer/export pipeline and root scene. Keep progress, the player, audio, settings and CanvasLayer UI alive in the root session. Replace only the active location under a `LocationSlot`: plaza, printshop, archive or meeting room. One active spatial scene keeps hidden collisions/input from leaking. No additional Autoload or scene-management plugin is needed.

Use one reusable room scene/script configured with location, NPC, prop, door/spawn and chapter IDs. Three authored small layouts provide distinct furniture/objects. Preserve the original building/character role IDs; add only the necessary original floor/wall/furniture roles through both asset catalogs and the owner's manifests/briefs. Scene files and source content own layout/content; avoid growing the existing single `main.gd` with three copied room builders.

An `Area2D` detects door proximity, but entry happens only when E/Enter or the labelled “Entrar” button is activated. Player-only collision masks, a single interaction target, and a transition guard prevent repeated activation. Change the active location outside physics callbacks. Spawn inside clear of the exit trigger; on exit restore a safe plaza point in front of the corresponding door. Room bounds/wall collision replace the current fixed outdoor clamp. Leave reachable routes to the NPC, object and exit.

Location buttons and physical doors use the same `enter_house(id)` action. They move to the interior, without automatically opening the whole quest. A “Hablar con…” or “Revisar…” menu supplies an equivalent non-spatial action. Show a clear current location and next objective. Escape closes an open panel first; when no panel is open, it can return from a house to the plaza. Always offer a visible “Salir a la plaza” control. Restore focus to a valid current-location control; do not reference a removed door node.

Entering/exiting is independent from completing or replaying a chapter. Closing a question leaves the artifact unfinished and offers safe restart. Repeated completion is idempotent. Persist only allowlisted completed IDs, assistance and settings; room positions, quiz answers and ballots need not be saved. Existing version-1 completion remains honored after the revision, with no claim that an old save passed the new checks. On reload use the plaza as the safe location. Ballot choice and option-linked outcomes remain memory-only, including when leaving/re-entering house 3.

The HTML route presents three named house sections with “Entrar”, “Salir a la plaza”, a heading and logical focus; walking/canvas is unnecessary. It uses the same six required decisions, data artifacts, support and consultation/ending. HTML equivalence concerns learning and actions rather than reproducing a room map with inaccessible controls.

## Classroom reuse and verification

Prepare a short teacher sheet: goal, setup/access options, 2-minute introduction, 10–15-minute activity and optional 5-minute discussion. Support individual play, pairs or a projected demonstration. Offer a printable source/graph/discussion card, with exact data and the distinction between real CCPC and fiction. These are classroom resources; retain submission narrative/deck/video separately.

Discuss accessible ethics questions: “¿Qué sabemos y qué no?”, “¿Cómo escuchamos otra necesidad?” and “¿Cómo revisamos lo que se acordó?”. Do not grade project preference, willingness to vote, identities or political opinions. A class activity is not a registration process, official ballot or proof of future turnout. Describe the teaching themes as information honesty, fair comparison, plurality and accountability; exact curriculum mapping can be done with the teacher later.

Technical acceptance must include real door/input paths: exterior approach, enter, move within each room, interact with host/prop, exit, re-enter and use menu travel. Cover every house before/after completion, repeated activation, pause/settings, wrong-answer retry, save/reload and leaving the consultation. Verify both exports with original assets; the existing method-call journey and boot tests alone cannot certify the new doors or room collisions.

Keep the data invariants, zero/null handling, original formulas/combined-count fixtures and source fingerprints. Add shared content/rule parity fixtures for the new conceptual transfers, changed records, equal comparisons and unavailable data. Verify all five consultation paths and absence of choice/results in storage after leaving a room, restarting or reloading.

Manual acceptance includes keyboard-only doors/dialogues/menu path, visible/restored focus, large text, 200% HTML zoom, contrast, mute and reduced motion. Record actual browser/OS and an available screen reader; absence of a screen reader remains a recorded limitation rather than a pass. Test packaged HTML at 320/768/1440 px and real input-driven Godot web/Linux paths. Add no unsupported mobile/browser claims.

If available, invite one ethics/civic teacher and 5–8 representative beginners for formative feedback. Proposed repair targets: participants understand the next destination, every observed session can finish with support, and at least 4 of 5 in an initial five-person group can independently explain one finding, one limit and one follow-up action. Record actual denominator, assistance, barriers and time; failure triggers a repair. This small convenience sample can guide usability changes, not prove learning gains, representativeness or electoral effects. If no participants are available, report internal review only. No remote telemetry or personal/political response collection is required.

Only after the revised runtime passes, regenerate narrative, deck, screen recording, subtitles/transcript, hashes and candidate ZIP. The previous PDFs/video/ZIP show version 1 and must not be described as demonstrating the new rooms or classroom questions.

## Sources and review boundary

- **Scoring:** local official three-page rubric above; primary authority for the four numerical weights.
- **Reto 3 and artifacts:** [official call](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf), downloaded and extracted on 24 October 2026. It prioritizes a clear audience/message, truthful data narrative, functioning visual prototype and dissemination; classroom use is the proposed application.
- **Data:** [official CCPC portal](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/), checked 24 October 2026. Continue the bundled 2024 federal snapshot; do not silently mix it with the separately presented judicial exercise or add youth/education subgroup findings not reproduced here.
- **Institutional context:** [INE's ENCÍVICA explanation](https://centralelectoral.ine.mx/2024/07/24/encivica-2024-2026-una-herramienta-fundamental-para-la-consolidacion-de-una-democracia-participativa-e-incluyente/) supports civic learning and electoral/non-electoral participation. Classroom reuse is an inference/design proposal, not an institutional endorsement.
- **Engine approach:** [Godot Area2D](https://docs.godotengine.org/en/stable/tutorials/physics/using_area_2d.html) documents overlap signals; [manual scene changes](https://docs.godotengine.org/en/stable/tutorials/scripting/change_scenes_manually.html) explains node lifetime/processing tradeoffs. Recheck behavior in the pinned editor during implementation. The persistent root/location-slot design is our project decision.
- **Implementation evidence:** at planning time the version-1 report contained 48 tests/40 GUT assertions; that was the inspected baseline, not acceptance of this redesign. [Current verification](verification.md) now records revised source/output fingerprints, complete exported journeys and media. The subsequent optional poster workshop is specified as EVID-06 and tracked as RV13.
