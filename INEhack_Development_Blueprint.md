<!-- Converted from INEhack_Development_Blueprint.docx -->

# INEhack development blueprint

_Reto 3 | Godot and Codex | Delivery plan through 31 October 2026_

Recommendation. Build an interactive data-storytelling microsite containing a small original 2D Godot adventure and an accessible evidence journal. Make verified INE participation data essential to the player’s actions. Ship a polished 10–15 minute vertical slice, not a farming simulator. A native executable is a useful offline fallback, not the only contest artifact.

### The proposed game

Voces de la Plaza is a working title. In fictional Villa Brisa, the player repairs a printing mechanism, constructs an accurate public bulletin, and helps prepare a community decision. Three speaking NPCs guide the compact route. The finished evidence exhibit remains in the plaza, and a fictional project begins without eliminating competing needs. Rewards recognize sound reasoning and accessible participation, never a party, preferred vote, or higher turnout figure.

### What this plan assumes

- “Central CCPC usage” means central use of the INE Conteos Censales de Participación Ciudadana. CCPC is the evidence source, not a separate software library.

- The proposed submission is positioned for Reto 3; confirm the registered track before implementation. Use the actual emailed rubric for scoring and the official convocatoria for mandatory delivery requirements. A public-base wording difference is addressed on page 2.

- The audience is beginner adults aged 18 and over, including facilitators and first-time eligible voters. This is a scope proposal, not an inferred user preference.

- The deadline is 31 October 2026 at 23:59; the published timezone is unspecified. Treat 30 October as the internal release target and confirm the timezone before submission.

- No game or pilot has been built by this planning work. Learning outcomes and institutional uptake remain hypotheses until evaluated.

### The first decisions

1. Approve or revise the concept, general-public audience, and interactive web format. Use private version control and organizer-readable access as authorized; clarify the unpublished-work clause before public release.

2. Choose a verified 2024 state-level CCPC snapshot for the MVP. Do not expand into fine geographic or sensitive subgroup comparisons before the core is stable.

3. Assign one person to each approval role: product and civic content, data verification, engineering integration, and submission. One person may hold several roles.

4. Resolve the rights and originality constraints before public release or adding third-party art, music, fonts, or add-ons.

Companion documents: Learning Evidence and Pitch Outline provides the research and ten-slide structure. Codex Prompts and Feature Spec contains plain-text instructions ready to adapt. This blueprint is a planning artifact, not an executable project.

## Rubric coverage and mandatory deliverables

The supplied evaluation rubric allocates 100 points across four criteria. Aim to present evidence for each excellent-band descriptor; no score is guaranteed. The final score averages five judges. Thematic fit breaks a tie first, then clarity and solidity.

| Criterion | Excellent band | Evidence to show |
| --- | --- | --- |
| Thematic fit<br>35 points | 30–35 | Two evidence-building quests depend on verified CCPC records; a clearly fictional consultation applies the lesson. The source, denominator, year, and limitations are visible in play. The prototype and required files directly answer Reto 3. |
| Clarity and solidity<br>30 points | 26–30 | A reproducible pipeline, explicit assumptions, source manifest, tests, concise storyline, and a demo that distinguishes verified data from fictional narrative. |
| Originality and creativity<br>20 points | 17–20 | An original town and dialogue. Historical evidence changes the player’s reasoning and exhibition, not just a trivia score. Explain the particular contribution beyond a familiar cozy visual genre. |
| Institutional feasibility<br>15 points | 13–15 | Offline-capable delivery, manageable facilitation, accessibility options, reusable content files, an installation guide, rights clearance, and a measured pilot proposal. |

Wording reconciliation. The public bases also name “Potencial de aplicación institucional.” The actual rubric incorporates this potential within the 15-point institutional feasibility criterion. Demonstrate it explicitly; do not invent a fifth score or redistribute the weights.

### Submission checklist

- Presentation of no more than 10 slides, plus the interactive visual prototype.

- A 3–5 page PDF describing the storyline and dissemination plan, including channels, format, and target audience.

- A pitch video of no more than 3 minutes, MP4 at 1080p, with accessible read-only access.

- Code or repository, the two official letters signed by all required participants, and the team-and-track named ZIP.

- Email the complete team-and-track named ZIP to grecia.castro@ine.mx and cirse.rodriguez@ine.mx by 31 October 2026 at 23:59, timezone to confirm. Missing mandatory deliverables can disqualify the entry. This plan does not authorize sending or signing.

Sources: actual rubric supplied in the INE email of 23 September 2026; official convocatoria, Reto 3 and submission provisions [1]. Preserve the original rubric with the team’s records. Public repository access is not assumed to be required.

## A small adventure with explicit learning goals

Use a compact town with a plaza, archive, and noticeboard. Three NPCs introduce different questions without representing real demographic groups. A 2D top-down camera, short walks, original pixel art, and relaxed pacing may evoke a cozy adventure. Do not copy Stardew Valley characters, sprites, dialogue, maps, music, interface art, or branding.

| Quest | Player action | Learning and feedback |
| --- | --- | --- |
| 1 La prensa de las voces | Repair a three-bin printing mechanism using real SV, NV, and NS counts; create a source-labelled bulletin. | The visible artifact depends on the correct denominator and provenance. NS remains unknown classification, not abstention or null votes. |
| 2 El mapa que no lo dice todo | Repair a misleading noticeboard with the 2024 Aguascalientes/Baja California comparison and combined counts. | Distinguish absolute counts from rates. Build “El dato muestra”, “No permite saber”, and “Faltan datos” panels rather than only answering trivia. |
| 3 Una plaza varias ideas | Inspect equally presented project needs, take part or decline in a private fictional ballot, then ask a neutral oversight question. | Votes contribute to collective choice, but a single vote need not change the winner; outcomes have tradeoffs and require follow-up. Completion never depends on voting. |

### Play sequence and rewards

1. Enter the plaza, choose text size and motion settings, and learn movement or use menu-based travel.

2. Explore, listen, collect a source or tool, and manipulate the printing mechanism or noticeboard. Every drag interaction has an equivalent keyboard selection path.

3. Receive specific feedback, retry safely, and explain a new case before receiving a notebook stamp. Record assistance separately from independent mastery.

4. Display the corrected evidence at the finale and view a clearly fictional collective-choice outcome. No decorative change is presented as a measured effect on real turnout.

### Spanish copy examples

“Estos datos muestran registros de participación. No indican por quién votó cada persona.”
“Sin clasificación no significa que la persona se haya abstenido.”
“Más personas y un porcentaje mayor no son lo mismo.”
“Votar de manera libre e informada permite participar en decisiones colectivas. Un voto no garantiza por sí solo un resultado.”

### Scope boundary

MVP: one compact map, three speaking NPCs, three quests, a source journal, settings, local progress, one short fictional decision scene, and a complete ending. Stretch: more NPCs, historical comparisons, extra languages, controller/touch support after testing, and richer art. Cut: farming economy, combat, relationships, multiplayer, accounts, live data, political personalization, or generative dialogue. If time is insufficient, deliver one complete data quest plus the short reflection/decision scene, never several unfinished scenes.

## A neutral fictional collective decision

Keep this small: a single panel-based scene after the evidence exhibit, not an election simulator. Three equally presented projects might add shade and benches, a reading area, or a garden. Each uses the same finite first-stage budget and has real maintenance tradeoffs. The fictional rule is visible before the player decides.

### Autonomy and source separation

- Any option, an explicitly defined unmarked ballot, or declining to cast a ballot allows the story to finish with the same learning rewards.

- Never derive an NPC’s political preference, motive, or participation from a CCPC age or state average. Historical records and synthetic scenarios live in separate files and code paths.

- Do not persist the player’s ballot choice, reveal it through NPC dialogue, or make it a telemetry field. Save quest completion and settings only.

- Show “Consulta ficticia. No reproduce todos los procedimientos de una elección constitucional.” Label results “Escenario ficticio”.

### Deterministic test fixture

| Synthetic scenario | NPC votes A B C | Lesson |
| --- | --- | --- |
| Baseline | 8 / 5 / 3 = 16 | A wins, but nonwinning needs remain legitimate. |
| More participation A | 11 / 8 / 6 = 25 | A still wins. Higher turnout does not necessarily change the winner. |
| More participation B | 8 / 10 / 7 = 25 | B wins at the same participation total as the previous scenario. Turnout alone does not determine the result. |

All scenarios use the same synthetic 30-person roster with fixed underlying preferences A12/B10/C8; only the participating subset changes. The player is a separate 31st eligible fictional participant. Add their option count and participant count by exactly one, add only the participant count for an allowed unmarked ballot, or add neither when they decline. Explain this toy rule; do not present it as Mexican election procedure.

### Acceptance and narrative limits

The same seed and action produce the same aggregate. Tests cover every option, unmarked ballot, abstention, losing vote, and a tie. A tie produces a clearly labelled fictional second-decision state, never an automatic preference for option A. Do not secretly choose a pivotal election after seeing the player’s action.

Close with “Ganó este proyecto. Todavía falta revisar cómo se realiza y qué necesidades quedan pendientes.” Let the player choose a neutral question such as “¿Qué se hizo con el presupuesto?” The outcome illustrates collective participation and continued accountability without promising that voting automatically improves every public service.

## CCPC data contract and interpretation

Use CCPC as the source of puzzle inputs, explanation text, and the player’s evidence. Bundle a verified, immutable JSON snapshot with the prototype. A reviewer must be able to trace a displayed number back to the official ZIP, internal file, filters, aggregation, and build version. [2–4]

| Fields | Meaning and handling |
| --- | --- |
| AELEC and FELECCION | Election year and date. Derive year from AELEC. Preserve FELECCION as raw text until its date convention is verified; do not guess a locale from 06/02/2024. |
| EDOCVE and EDONOM | State identifier and name. Keep identifiers as strings and preserve leading zeros where required. MVP aggregation is state by election year. |
| MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF, DEL | Municipality, section, section type, and districts. Keep raw fields in ingestion, but do not expose unsupported geographic joins in the MVP. |
| SEXO and EDAD | Sex category and age on election day, not individual longitudinal histories. Use the year-specific dictionary. The 2024 non-binary category is not retrospectively comparable. |
| LN, SV, NV, NS | List records; records with a vote mark; records without a vote mark; participation not specified. These are counts, not party choices or opinions. |

### Required calculation rules

- Participation percentage = 100 × SV ÷ (SV + NV). Sum SV and NV across selected records first. Never average rates unless the operation is explicitly an unweighted comparison.

- Unknown-classification share = 100 × NS ÷ LN. Show it alongside participation, with its own denominator. NS is not abstention, a null vote, or evidence of fraud.

- If SV + NV is zero, store a null rate and show “Sin datos clasificables”. If LN is zero, the unknown share is null. Never coerce missing values to zero.

- Keep counts as integers, derive rates at build time, and round only for display. Differences in rates are percentage points, not percentage change.

- Check LN = SV + NV + NS where the dictionary supports it. Quarantine malformed rows and fail the build; do not silently repair or discard them.

- Charts must use a single denominator per composition. Never combine 59.7% voted, 40.3% unmarked, and 6.4% unknown in one 100-icon chart. Put the classified 59.7/40.3 illustration beside a separate NS/LN panel, or show all three LN-based shares and separately report the classified rate.

### Limits that remain visible

The records are descriptive aggregates from nominal-list booklets, with stated exclusions such as special polling stations and voting from abroad. They need not match vote-count totals based on tally sheets. CCPC cannot identify why people vote, the effect of this game, an individual’s behavior, or party preference. Separate presidential-election comparisons from midterm comparisons, and verify geographic frames before joining across years. [3–4]

Do not claim that platform filters for Indigenous or Afro-descendant reference exist as raw CSV columns unless their separate source and unit are verified. Do not rank communities as better or worse citizens.

## A reproducible pipeline with numerical fixtures

1. Fetch the official election ZIP and preserve it unchanged. Record its URL, download time, byte size, SHA-256, dictionary path, and licence or usage statement. Treat a changed hash as a new source version.

2. Extract only expected files. Validate the 16 expected field names, encoding, year, category mappings, nonnegative integer counts, and the row-count ledger. Keep identifiers as strings.

3. Aggregate all relevant 2024 records by state, then nationally. Produce counts and derived percentages; retain a machine-readable manifest of included files and filters.

4. Run integrity, formula, and golden-fixture tests. Compare repeated builds byte-for-byte after deterministic sorting. Investigate dashboard discrepancies rather than asserting equality.

5. Export a small JSON bundle and a human-readable methods summary. The game reads only this validated bundle. Display a helpful data-unavailable state if its schema or integrity check fails.

| 2024 fixture | SV | NV | NS | Rate |
| --- | --- | --- | --- | --- |
| Aguascalientes | 626,084 | 441,222 | 29,865 | 58.6602% |
| Baja California | 1,396,335 | 1,571,676 | 229,806 | 47.0462% |
| Both states together | 2,022,419 | 2,012,898 | 259,671 | 50.1180% |
| National aggregate | 54,899,228 | 37,105,466 | 6,325,654 | 59.6700% |

Fresh computation on 23 October 2026 checked 32 CSVs and 9,773,730 rows, with zero LN = SV + NV + NS failures. This verifies that identity, not every aspect of source accuracy or uniqueness. National LN is 98,330,348 and NS/LN is 6.4331%. The simple mean of the two state rates is 52.8532%; the combined-count rate is 50.1180%. Aguascalientes minus Baja California is 11.6141 percentage points. The annex provides exact values and a rerunnable utility. [4]

### Game bundle schema version 1

schema_version: "1.0.0"
dataset_id: "ccpc-2024-v1"
source: {url, retrieved_at_utc, sha256, dictionary_path}
method: {year: 2024, filters: [], formula_id: "sv_over_sv_nv"}
records[]: {id, geography_level, geography_code, geography_name,
 ln, sv, nv, ns, classified_count, participation_pct, unknown_pct, warnings[]}
quest_refs[]: {quest_id, record_ids, learning_objective_ids}
National record: geography_level="national", geography_code=null.
State record: geography_level="state", code from EDOCVE.

Required build outputs: data_manifest.json, validation_report.json, ccpc_2024_states_v1.json, and a reproducibility README. Hash values must be generated from downloaded bytes, never copied from an example or invented. Store source URLs in content, not hard-coded dialogue.

## Godot architecture and dependency boundaries

Pin Godot 4.7.2 stable and matching export templates; use typed GDScript, Compatibility rendering, and a single-threaded web export. Godot web requires WebAssembly/WebGL 2.0 and does not export C# projects. Codex is for development only: the shipped runtime is deterministic, authored, and local, with no LLM/API calls. Verify the installed stack before implementation. [5–7]

| Layer | Responsibility | Proposed primitives |
| --- | --- | --- |
| World | Movement, collision, interaction zones, transitions | Node2D, CharacterBody2D, Area2D, TileMapLayer, Camera2D, AnimatedSprite2D |
| Interface | Dialogue, choices, settings, source and notebook panels | Control, containers, Label or RichTextLabel, focusable buttons, theme resources |
| Quest state | Track objectives, attempts, hint use, and completion | QuestRunner with explicit state transitions; signals; one scene owner |
| Data access | Load and validate the bundled dataset; expose read-only records | CCPCRepository, schema checks, derived-value tests; no live network dependency |
| Persistence | Save progress and settings only | Versioned local JSON under user://; migration or safe reset on incompatibility |
| Assessment | Independent transfer items and anonymous local metrics | AssessmentService; event allowlist; separate learning and gameplay results |

### Suggested project organization

project.godot | AGENTS.md
docs/ product_brief.md decisions/ source_register.md
specs/ SPEC-001-data.md SPEC-002-exploration.md SPEC-003-quest.md
scenes/ world/ actors/ ui/ scripts/ world/ quests/ data/
content/ es_MX/ quests/ ccpc/ assessment/
tests/ unit/ integration/ fixtures/
tools/ build_data.py validate_content.py
licenses/ THIRD_PARTY_NOTICES.md releases/ submission_manifest.json

### Library policy

- Built-in scenes, signals, Resources, JSON/FileAccess, InputMap, TranslationServer, and Control containers cover the MVP. Use a native dialogue panel with a small content adapter by default.

- GUT 9.7.1 is the verified test-framework candidate for Godot 4.7.x. Pin its release/commit and MIT licence; exclude development-only tools from the player package. Check expected test count and unexpected skipped/pending cases as well as exit status.

- Dialogue Manager 4.1.0 is optional, not required. Its current store listing is marked unstable. Adopt it only after a day-one native/web smoke test, retain the native adapter fallback, and keep authoritative quest state outside it.

- Record every dependency version, official source, licence, notices, and removal fallback. Godot/add-on upstream authors retain their rights; distinguish those components from original work the team can assign.

Web accessibility: Godot uses AccessKit, but its web adapter is listed as planned. Do not claim canvas screen-reader support. Build a semantic HTML linear equivalent, charts/tables, sources, and transcript from the same content pack; test it separately. Target one supported desktop browser and keyboard-first path. Touch and other browsers are tested additions, not assumed passes.

## The specification driven Codex workflow

Treat a specification and its acceptance evidence as the unit of work. Codex proposes and implements bounded changes; a person approves product scope, interpretation of official data, civic wording, licensing, and release. A passing code test is not a substitute for those reviews. AGENTS.md is recognized project guidance. The specs/ folder, PLANS.md, and contracts are proposed repository conventions, not an automatic Codex “spec mode”; AGENTS.md must tell Codex to consult them.

| Stage | Required input | Exit evidence |
| --- | --- | --- |
| Define | User story, learning objective, rubric link, non-goals, data references | Approved versioned specification with edge cases and acceptance criteria |
| Plan | Repository inspection and dependency constraints | Small task list, files to change, tests to add, risks and assumptions |
| Implement | One approved feature and its fixtures | Small diff, no unrelated refactor, no invented data, no unreviewed dependencies |
| Verify | Unit and integration tests, headless load, exported build | Command output, screenshots or video, accessibility and content review |
| Review | Diff and spec-to-test traceability | Reviewer resolves failures and approves merge; unresolved gaps stay visible |
| Release | Pinned source and content versions | Reproducible artifact, licence notices, evidence manifest, smoke-test record |

### The specification template

ID and version | owner | status | last reviewed
User problem and learning objective
Rubric criterion and evidence artifact
In scope | out of scope
Inputs and data contracts | outputs
States and transitions | failure and recovery behavior
Spanish text and source references
Given When Then acceptance criteria
Unit tests | integration tests | manual checks
Accessibility | privacy | performance budget
Dependencies | risks | open questions | definition of done

### Working agreements for AGENTS md

- Read the product brief, current specification, source register, and dependency policy before changing files. If an instruction conflicts with verified data or a later approved spec, stop and ask.

- Keep each change scoped to one feature. Do not edit unrelated scenes, legal letters, attribution, scoring weights, data formulas, or project export settings as an incidental cleanup.

- Never invent CCPC fields, study results, turnout effects, API support, test success, or a source URL. Mark a test as not run when the environment cannot run it.

- Protect the Spanish glossary, deterministic fixtures, and original assets. Keep secrets and identifying pilot data out of the repository.

- Every handoff lists changed files, test commands and results, manual validation needed, assumptions, and remaining failures. A feature is complete only when its documented acceptance checks pass.

## Representative feature specification

SPEC-003 v1.0.0 The printing mechanism quest. Status: proposed. Objective LO-01: given an unseen aggregate, select SV + NV as the participation denominator and explain why NS remains separate. Rubric links: thematic fit and clarity. Inputs: validated schema v1 records; an original Spanish dialogue file; UI settings. Non-goals: political persuasion, geography ranking, or an estimate of individual voting behavior.

### Behavior and state transitions

States: NOT_STARTED → INTRO → INSPECT → ANSWER → FEEDBACK → TRANSFER → COMPLETE. An incorrect answer returns to INSPECT without erasing progress. TRANSFER uses a distinct fixture and no immediate hint; requesting help records assistance and remains allowed. Closing a panel restores keyboard focus. The source panel is available in INSPECT, ANSWER, and FEEDBACK. Completion requires a correct explanation or a transparent assisted-completion path, not merely clicking through. The player obtains a source seal, assigns count cards to printing trays through drag or keyboard selection, and carries the resulting bulletin to the plaza. Its validated counts persist in the final exhibit.

| Acceptance ID | Given When Then |
| --- | --- |
| AC-01 Formula | Given SV=60, NV=30, NS=10, LN=100 in a clearly labelled synthetic test fixture, when the learner calculates participation, then the answer is 66.67%, with classified denominator 90 and unknown share 10%. |
| AC-01b Real record | Given the verified national 2024 record, when the card renders, then SV=54,899,228, NV=37,105,466, NS=6,325,654, LN=98,330,348, rate=59.7%, and unknown share=6.4% appear with distinct denominators and provenance. |
| AC-02 Unknown data | Given the same fixture, when the learner labels NS as abstention, then feedback says why that claim is unsupported and offers a retry. It never adds NS to NV. |
| AC-03 Missing denominator | Given SV=0 and NV=0, when a record is opened, then the rate is null and “Sin datos clasificables” is shown, without division by zero or a 0% badge. |
| AC-04 Source visibility | Given a real record, when the source panel opens, then year, geographic level and label, counts, formula, unknown share, official URL, and snapshot version appear. Fictional narrative remains explicitly labelled. |
| AC-05 Keyboard path | Given keyboard-only input, when the player completes the quest, then every choice and source control is reachable, focus is visible, and no drag-only interaction blocks progress. |
| AC-06 Persistence | Given the quest is in TRANSFER, when the game restarts, then progress resumes safely or explains a version reset. A completed stamp is not duplicated. |
| AC-07 Transfer record | Given an unseen transfer item, when the learner answers, then first-attempt correctness and hint use are recorded locally without a name, vote choice, or demographic profile. |

### Definition of done

Unit tests cover formulas and state transitions. An integration test loads the real bundle and checks a known fixture. A manual keyboard run, text-size check, source inspection, and exported-build smoke test pass. A second reviewer approves the Spanish explanation and distinguishes source-backed facts from proposed pedagogy. The evidence folder links the spec version, commit, test log, and one short capture.

## Vertical slices and traceable tests

Build the risky learning loop before the town decoration. Each slice should be playable end to end and produce evidence for a rubric criterion. Keep the prototype’s installation, data, and educational claims testable independently.

| Slice | Done when | Evidence |
| --- | --- | --- |
| S0 Technical preflight | A blank project exports and runs on the chosen browser; input, text, audio activation, and local storage are tested. | Pinned engine and exports, browser/device log, known constraints. |
| S1 Evidence card | The official data bundle loads offline, source information is visible, and invalid or zero-denominator records fail safely. | Data manifest, fixture tests, card screenshot. |
| S2 One full quest | A resident introduces the task; the player inspects, answers, retries, transfers, and saves progress. | SPEC-003 checks, keyboard recording, original dialogue. |
| S3 Complete adventure | Three complete quests, persistent printshop/noticeboard artifacts, a neutral synthetic decision, and an ending fit a 10–15 minute session. | Full playthrough and route checklist. |
| S4 Submission candidate | The exported build opens from the intended delivery route and all required files match the tested version. | Release manifest, installation steps, checksums, signed-letter checklist. |

### The aggregation quest

SPEC-004. Use the two verified state fixtures. The player must answer both “Which has more SV records?” and “Which has the higher rate?” before combining counts. The merged answer must be 50.1180% within rounding tolerance, not 52.8532%. Provide selectable alternatives and number-entry support; do not require dragging. For a transfer check, use a new labelled synthetic example so the player cannot answer by memorizing the two real states.

### The neutral consultation

SPEC-005. Implement the small synthetic consultation described earlier. Test deterministic results, all option choices, unmarked ballot, abstention, losing vote, and explicit tie behavior. Verify that completion and rewards do not depend on voting or winning. Never persist the ballot choice or derive NPC preferences from CCPC. Merge evidence classification into SPEC-004: the repaired board must contain one supported statement, one rejected inference, and the evidence needed to learn more.

### Required regression cases

- Malformed JSON, unexpected schema version, absent source URL, negative count, duplicate aggregate key, and changed source hash must be handled explicitly.

- Large count totals do not overflow or lose integer precision; raw and formatted numbers stay separate; rates round consistently in cards, feedback, and the notebook.

- Repeated clicks, backing out of dialogue, pause/resume, reload during feedback, and corrupt local save do not create a soft lock.

- Zoomed text, keyboard-only play, muted audio, reduced motion, and a slow reference device preserve the complete learning path.

## Ready to paste Codex prompts

Use these in sequence after selecting the correct repository and execution environment. Replace placeholders deliberately. The companion text file includes these prompts and the representative specification without Word formatting.

Bootstrap first: inspect the actual repository without edits. Identify missing AGENTS.md, brief, contracts, specs, and source register. After approval, create only those planning files from this blueprint, then review them before any game code. Full bootstrap prompts and unrun command templates are in the annex.

### Prompt 1 Inspect before planning

Read AGENTS.md, docs/product_brief.md, specs/, and docs/source_register.md. Do not edit files yet. Inspect the Godot version, export presets, installed dependencies, current tests, and project structure. Compare the repository with SPEC-003 v1.0.0. Return a short implementation plan, exact files you expect to change, unresolved assumptions, and the smallest testable first step. Do not invent missing content or claim a test ran.

### Prompt 2 Implement one feature

Implement only the approved SPEC-003 v1.0.0 plan. Write tests for AC-01 through AC-07, using labelled synthetic fixtures where required and the validated CCPC bundle for integration. Preserve the source schema, Spanish glossary, accessibility settings, and dependency lock. Do not add plugins, network calls, analytics services, or unrelated refactors. If the specification is ambiguous, stop that part and state the decision needed. Return the diff summary and actual test results.

### Prompt 3 Verify the data pipeline

Review the CCPC ingestion and aggregation code against the year-specific official dictionary. Verify the source manifest, expected fields, nonnegative counts, LN reconciliation, grouped sum-before-divide formula, zero denominators, deterministic output, and golden fixtures. Do not repair data silently. Produce validation_report.json and a readable explanation of any mismatch. Do not claim parity with the live dashboard unless you verify matching filters and definitions.

### Prompt 4 Review without extending scope

Review this diff against the approved spec and acceptance IDs. Look for data interpretation errors, unsupported civic claims, source omissions, save-state bugs, keyboard traps, licence issues, and missing tests. Classify findings by severity and cite file/line locations. Do not edit yet. Distinguish reproducible failures, plausible risks, and checks you could not run. Do not invent findings merely to fill categories.

### Prompt 5 Prepare a release candidate

Using the approved commit and pinned toolchain, run the documented tests and export the approved target. Generate a release manifest containing versions, file hashes, known limitations, licences, source snapshot, and test evidence. Verify a clean install and full playthrough. List every unmet submission requirement. Do not publish, email, sign letters, accept legal terms, or change sharing permissions.

Review loop: issue → revised specification if behavior changes → targeted patch → full regression. Do not let successive prompts silently expand the MVP. Keep source and claim corrections ahead of cosmetic improvements.

## Eight day delivery plan

Eight calendar days remain from 24–31 October, not eight full working days. Existing commitments reduce availability. On 23 October, confirm actual hours, registered track, environment, rights questions, and deadline timezone. The milestones below are priorities, not an assumption of full-time work or a particular team size.

| Date | Primary outcome | Exit condition and fallback |
| --- | --- | --- |
| 24 Oct | Lock scope, sources, technical stack, and data contract. Build S0 and S1. | Web smoke test and verified data card pass. If web is unstable, commit to a supported desktop fallback; do not spend the week debugging export plumbing. |
| 25 Oct | Complete one end-to-end denominator quest. | SPEC-003 accepts keyboard input, feedback, transfer, and saving. Use simple original art; cut animation extras if needed. |
| 26 Oct | Complete the noticeboard quest and neutral consultation. | Both evidence quests use source-backed records; the consultation uses separate synthetic fixtures. Reuse the working UI and state machine. |
| 27 Oct | Integrate the town, notebook, ending, and accessibility. | One full playthrough is possible. Freeze feature additions. Keep one map and the original three NPCs. |
| 28 Oct | Run small formative adult usability sessions if feasible, target eight and minimum five, then fix the most serious issues. | Document observed errors and repairs. If no participants are available, report internal testing only, not pilot findings. |
| 29 Oct | Fix critical issues and produce the storyline PDF, deck, and pitch script. | All required claims have sources. Rehearse the three-minute pitch and record the tested build. |
| 30 Oct | Freeze and package the release candidate. | Clean install, mandatory-file check, permissions check, code package, and signed-letter completeness verified. Internal target is a complete ZIP today. |
| 31 Oct | Final independent check and authorized submission. | Verify recipient addresses, filename, access, deadline timezone, and sent package. Keep a local copy and submission record. Do not depend on last-minute internet access. |

### Priority order when time is short

1. Protect mandatory deliverables, correct CCPC use, a complete playable path, reproducibility, and institutional practicality.

2. Fix blockers, incorrect explanations, missing sources, and inaccessible controls before adding visual polish.

3. Cut the extra map, historical series, controller support, decorative animation, and optional analytics before cutting the educational loop.

4. If a claim cannot be verified, remove or label it. If a pilot cannot be run responsibly, present its design instead of a result.

Planning estimates, to revise after S1: preferred three-quest prototype and submission assets, roughly 45–65 focused person-hours; lean single complete quest plus decision/reflection and required package, roughly 24–36 hours. If fewer than about 24 hours are available, simplify to a complete interactive data story rather than promise a full adventure. Parallelize data/content, UI/world, and verification only if teammates are available; one integrator owns shared scenes, contracts, and exports.

## Release gates for quality access and rights

### A release candidate must pass all gates

| Gate | Pass evidence | Stop condition |
| --- | --- | --- |
| Data and claims | Manifest, fixture results, method notes, source cards, and a human content review. | Invented values, wrong denominator, unsupported causal claims, or missing source provenance. |
| Playable stability | Clean export, full ending, safe retry and resume, and a tested delivery route. | Soft locks, crashes, broken links, missing assets, or a build unlike the recorded demo. |
| Accessibility | Keyboard path, visible focus, scalable text, contrast checks, no color-only encoding, captions, mute and reduced motion. | A required action depends only on dragging, audio, color, fast reflexes, or a timer. |
| Privacy | No login; no names or political preferences; local metrics off or transparent by default; reset control. | Unnecessary identifying data, cloud telemetry without a reviewed purpose, or disclosure of participant records. |
| Rights and licences | Asset register, source attribution, licence notices, original narrative, and review of required letters. | Unclear asset ownership, incompatible redistribution terms, or a rights promise the team cannot support. |
| Submission integrity | All mandatory files, correct versions, both recipients, tested read-only access, and required signatures. | Missing deliverable, inaccessible video or prototype, unsigned letter, or unverified package contents. |

### Accessibility checks that fit the prototype

Use WCAG 2.2 contrast values as practical UI benchmarks: 4.5:1 for normal text and 3:1 for large text and meaningful interface graphics. This does not by itself establish WCAG conformance for the game. Provide a menu path equivalent to map travel, allow text to be enlarged without clipping, include text for spoken content, and let players revisit explanations. Test actual exported controls, not only screenshots. [8]

### Originality and the INE rights letter

The official materials require original and unpublished work and a ten-year rights assignment for non-profit institutional and educational use. “Inédita” is not defined. Keep the repository and demo private by default; organizer-readable access must be authorized, and unlisted hosting is not automatically a legal safe harbor. Clarify how required demo hosting and third-party engine/add-on licences fit the letter before public release. This is a compliance question, not a legal conclusion. [1, 9]

Maintain an asset register with creator, source URL, licence, modification, attribution, distribution scope, and proof of permission. Use original simple sprites and dialogue when uncertain. Keep dependencies separate from the rights the team is able to assign. The user must review and sign official documents personally; this plan does not supply legal advice.

## Institutional use and the evidence package

The strongest institutional story is a small, reusable learning activity that a facilitator can run with ordinary equipment and explain using official data. Treat institutional adoption as a proposed use case, not approval or endorsement already granted by INE.

### A practical facilitation model

- Offer a 15–20 minute session: short introduction, 10–15 minutes of play, and a debrief asking what the data supports and what it cannot show.

- Provide a one-page facilitator guide with learning objectives, likely misconceptions, technical setup, accessibility options, and source links.

- Deliver a private, evaluator-readable interactive microsite containing the Godot export and a semantic HTML evidence journal with a linear equivalent. Supply the tested native/offline fallback as an additional option. No required account or universal device support is assumed.

- Keep dialogue, quest definitions, and data in separate files so future staff can update content without rebuilding the town design.

- Propose dissemination through civic-education workshops, institutional web channels, and schools or community learning spaces only where appropriate approvals and facilitation exist. Do not imply those partners are committed.

### Evidence the judges can inspect

| Claim in the pitch | Evidence in the package |
| --- | --- |
| CCPC is central | The first two quests list dataset record IDs and create a persistent exhibit. The demo opens a source card; the methods file reproduces displayed values. The consultation is labelled synthetic. |
| The proposal is solid | Specs map to tests, assumptions are explicit, the build is reproducible, and research claims state limitations. |
| The design is original | Original world and writing, a documented asset register, and a clear explanation of how evidence changes the player’s task. |
| Use by INE is feasible | Installation and facilitator guide, accessible input options, content separation, known operating costs, and no mandatory backend. |
| Learning will be evaluated | A defined pre/post and transfer protocol with a comparison condition proposed for later evaluation; no invented results. |

### The final package review

Create a manifest with required filename, version, owner, status, access mode, and checksum where applicable. Check the deck has at most 10 slides, the narrative PDF has 3–5 pages, and the MP4 is no longer than 3 minutes at 1080p. Verify every external link in a signed-out or recipient-equivalent view. Confirm the two official email addresses from the convocatoria and the timezone before sending. Keep the rubric and submission evidence with the project records.

The research pack supplies deck-ready claims and a slide outline. It is not a finished slide deck or the required 3–5 page storyline PDF. Those remain production deliverables in the schedule.

## Sources and decisions to confirm

Source register verified for this planning edition on 23 October 2026. The actual emailed rubric controls the weights used here. Official documentation and data dictionaries should be rechecked when the team pins the final build.

1 INE 2026 convocatoria and Reto 3 requirements

2 INE CCPC open data portal

3 INE manual for CCPC 2009 to 2024

4 INE 2024 official data ZIP and included field dictionary

5 Godot release archive and pinned engine version

6 Godot web export documentation

7 OpenAI Codex documentation

8 W3C Web Content Accessibility Guidelines 2 2

9 INE rights assignment letter

10 GUT test framework and version mapping

11 Dialogue Manager current version and stability warning

12 AccessKit platform support

13 Codex AGENTS md guidance

14 INE truth declaration letter

### Confirm before implementation

| Decision | Current planning assumption |
| --- | --- |
| Audience and context | Beginner adults aged 18+; facilitated or self-guided civic learning, not political persuasion. |
| Team and capacity | Owners and availability are not yet supplied. Keep the three-quest scope until capacity is known. |
| Environment and engine | Choose the actual repository and supported environment; pin engine, templates, and optional add-ons only after a smoke test. |
| Delivery target | Interactive data-storytelling web microsite with embedded Godot and semantic HTML evidence; native offline build as a fallback. No existing build is assumed. |
| Data snapshot | 2024 state-level aggregates; previous-year content remains stretch. |
| Public release and rights | Clarify “inédita” and the ten-year assignment before public hosting or choosing incompatible components. |
| Deadline timezone | The published 31 October 23:59 deadline does not specify a timezone. Confirm and submit early. |

Evidence status: the numbers and rule interpretations above are sourced; architecture, gameplay, acceptance tests, performance expectations, pilot design, and schedule are recommendations. No judge score, learning gain, turnout change, institutional acceptance, or successful submission is claimed.
