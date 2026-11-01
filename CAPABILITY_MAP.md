# Capability map for Voces de la Plaza

**Alcance vigente · 31 de octubre de 2026:** por instrucción del equipo, la entrega contiene únicamente la aventura Godot (navegador y Linux) y materiales actuales en español. Se retira la ruta narrativa HTML independiente del despliegue, de la aceptación actual y del ZIP. Las secciones previas que exigían esa equivalencia quedan como historia del diseño. Ver [entrega Godot](docs/entrega_solo_godot_es.md), [arquitectura vigente](docs/arquitectura_godot_es.md) y RV27–RV31.

**Sequential/pink campaign amendment · 27 October 2026:** [Approved interaction/design contract](docs/sequential_campaign_design.md): host-only learning, final-only press, clean floors and nearby target prompts; simpler shared questions; original pink citizen poster and skippable print reveal with explicit FIN. All houses remain enterable and WASD-only travel remains. Fresh evidence and rubric assessment are RV21–RV26; earlier scores are historical.

**Approved campaign amendment · 27 October 2026:** [The finale](docs/campaign_finale.md) extends the same six modules with libre music, translucent bottom NPC conversations, ordered learning, a citizen campaign PDF and a fourth print objective. Inés dispatches the design inside the story; the player walks to Luz's first-house press to print and reach FIN. Independent HTML navigation provides the equivalent ending and actual PDF download.

**27 October interface revision:** A shared theme and bounded HUD distinguish location, objective, passive progress and nearby interaction. Paper panels dim the world, contain keyboard/mouse interaction and restore controls on close. See [interface contract](docs/interface_polish.md), `SPEC-play-session.md` and RV17.

**26 October user amendment:** Godot world movement is WASD-only. Walking crosses physical doors/exits; remote travel buttons, Escape exits and automatic poster/prerequisite travel are removed. The final authored poster receives a spacious paper-and-ink layout with a strong finding, labelled bars and discussion question. See `SPEC-play-session.md`, `SPEC-evidence-quests.md` and RV14–RV16. The HTML route remains independently navigable.

**25 October classroom revision:** the game targets introductory ethics/civic courses in Mexico, especially high-school students approaching their first vote and adults new to civic education. Six shared simple questions, coherent story progression and three enterable houses extend the same six modules. See [design](docs/classroom_redesign.md), [revision tasks](tasks/todo.md#classroom-revision), [current evidence](docs/verification.md), and [rubric review](docs/rubric_review.md). Historical implementation counts below are the version-1 baseline; current acceptance is tied to the revised candidate's fingerprints.

The optional archive workshop implements the supported-headline interaction below: a learner chooses two of the 32 bundled states, count or proportion, and a neutral discussion question; previews and revises the sourced poster; then brings it to Inés. This is an additional way to communicate the same evidence, not another required quiz. Draft and published choices remain in session memory and do not affect the consultation.

Status: approved for execution. The user approved the development plan and then
instructed “Implement plan”, authorizing specs and implementation across modules.
Created: 24 October 2026.
Confirmed by the user: the team is registered for Reto 3.
Also confirmed: Linux desktop/offline fallback, simplepixels visual direction,
and 45–65 focused person-hours for the original two-CCPC-quest adventure,
synthetic consultation, HTML equivalent and submission preparation.
Main owns code/data and verification, while parallel contributors own web/assets.
Direction refined by the user: prioritize innovative, accessible products that
translate CCPC data into stories, visualizations, and tools for understanding the
importance of participation in democratic life.

## Intended outcome

Create an original, accessible interactive data story in Godot for INEhack 2026,
Reto 3, guided by the user's priority:

> Diseña productos innovadores que traduzcan los datos en historias,
> visualizaciones o herramientas accesibles para que más personas comprendan la
> importancia de participar en la vida democrática.

The central product is a civic communication experience. Translate verified CCPC
observations into understandable stories and visual tools, connect those stories
to the value of informed participation, and give people a practical way to explore
and discuss the evidence. Godot provides the interactive medium; the educational
outcome is that a beginner can explain a participation pattern and why taking
part in collective decisions and following up on them matters.

Aim for the excellent descriptors in each judging criterion through visible CCPC
use, a compelling narrative, accessible interaction, and practical institutional
reuse. The judges determine placement; delivery and evidence are our success
measures.

The approved experience is **Voces de la Plaza**. In fictional Villa Brisa, the
player helps residents prepare an exhibit called **Las voces que construyen la
plaza** before a community consultation. Residents ask civic questions, and the
player uses real CCPC records to turn a printing mechanism and a misleading
noticeboard into clear visual stories. Each repaired artifact contains a finding,
an accessible visualization, its source, and a question for discussion.

The story moves from observing participation to understanding representation in
collective decisions, then reflecting on democratic involvement. The fictional
consultation makes competing needs and continued accountability tangible. Its
outcome illustrates authored rules; CCPC supplies the historical participation
observations, not evidence about preferences or the effects of an intervention.

Central message in Spanish: **Comprender los datos nos ayuda a conversar
con información. Participar nos permite aportar a las decisiones colectivas y dar
seguimiento a lo que ocurre después.** The final wording remains subject to civic
content review.

## CCPC as the narrative foundation

The [official CCPC portal](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/)
is the primary data entry point. It provides federal-election participation data
for 2009–2024 and separately presents the 2024–2025 judicial-election exercise.
Keep the MVP on the 2024 federal-election snapshot; any later comparison needs
an explicit check of election type, geographic frame, population, and definitions.

For every real-data story, preserve this traceable chain:

**Civic question → official CCPC records → documented calculation → accessible
visualization → player interpretation → sourced exhibit → democratic reflection.**

The game must use verified counts and rates to determine its charts, valid
interpretations, and feedback. Replacing a record in a test fixture must change
those outputs consistently. Each real-data exhibit exposes the portal link,
download source, election year, selected geography, denominator, and limitations.
Bundle the validated snapshot so a play session can complete without live access
to the portal.

| Story moment | CCPC contribution | Accessible story or tool | Democratic understanding to discuss |
| --- | --- | --- | --- |
| ¿Qué nos cuentan las voces? | A sourced 2024 aggregate, keeping classified participation and unknown classification distinct. | Repair a visual bulletin with labelled bars or proportions, exact counts, plain-language text, and an equivalent table. | Participation can be examined with public evidence; interpreting it responsibly supports informed public discussion. |
| ¿Se ve igual en todos los lugares? | Same-year Aguascalientes and Baja California counts and rates, reproduced from the official download. | Correct a comparison board, switch between counts and percentages, and assemble a supported headline with its limitation. | Places can differ in participation; an aggregate does not reveal each person's motives or justify judging a community's civic worth. |
| ¿Qué hacemos con lo que sabemos? | The completed CCPC exhibit informs a discussion; consultation counts are separately labelled synthetic. | Review equally presented projects, take part or decline, inspect aggregate results, and choose a follow-up question. | Collective choices involve plural needs. Participation contributes to a decision, and democratic involvement continues through dialogue and accountability. |

Innovation should be visible in how a player transforms an official observation
into a useful public story. Arithmetic supports that process. Feedback should
explain the observation and its civic relevance in everyday Spanish, with hints
and selectable interpretations so mathematical fluency is not an entry barrier.

## Accessibility and communication priorities

- Offer the same essential findings, questions, explanations, and ending through
  the Godot adventure and a semantic HTML route with headings, text, tables, and
  labelled controls. The HTML route is a first-class way to use the product.
- Make every visualization understandable through text and exact values. Include
  units, year, geography, denominator, and source; do not rely on color, animation,
  audio, hovering, or spatial navigation alone.
- Introduce each chapter with a human question, reveal the data through an action,
  and finish with a short, sourced finding and a reflection about participation.
- Let a facilitator reuse the exhibit and its discussion questions in a short
  civic education session. Propose dissemination through suitable workshops,
  educational spaces, and digital channels, with audience and access requirements
  documented in the submission.
- Evaluate understanding of both the data and democratic participation: can a
  player explain one real pattern, identify a limit of that observation, and
  describe a meaningful way to participate or follow up on a collective decision?
  Report observed responses separately from engagement or claimed turnout effects.

## Approved execution baseline

1. Use the existing blueprint's concept: a 10–15 minute, top-down 2D adventure,
   one compact town, three speaking characters, two data quests, and a short
   fictional consultation with an ending.
2. Write player-facing content in Mexican Spanish for high-school and adult beginners and civic
   education facilitators. Use original town art, characters, and dialogue.
3. Deliver the game within an interactive storytelling microsite, with a semantic
   HTML equivalent and a tested Linux desktop/offline fallback. Linux is confirmed;
   browser/device support remains subject to actual testing.
4. Use the reproduced bundled CCPC federal-2024 snapshot: official raw SHA-256
   matched, 32 CSV/9,773,730 rows, 33 aggregates (national + 32 states).
5. Installed stack: Godot 4.7.2 with matching official-SHA-512-verified templates,
   GUT 9.7.1, typed GDScript, Compatibility rendering and single-threaded web
   export. Web/Linux exports succeeded. Historical version-1 tests: Python 22,
   Node 17, Godot GUT 9/9 (36 assertions, zero orphans). HTML journey and Godot
   web/Linux headless boot results are scoped in [verification](docs/verification.md).
6. Protect the complete learning loop and required submission assets before adding
   more maps, characters, animation, or historical comparisons. Confirmed capacity
   is 45–65 focused person-hours. Use the approved simplepixels direction and
   original final visible art/sounds resolved through asset-owner role IDs.
   Development references are CC0 Kenney tiny-town, roguelike-characters, ui-pack
   and interface-sounds; Atkinson is the OFL font reference. Actual asset sources,
   role IDs, files and notices remain the asset owner's responsibility.

## Capability boundaries

Module ids and dependency direction are approved. The linked root specs document
the authorized scope; no additional phase approval is required for that work.
Exact contracts live in the provider spec and are reconciled by main with actual
implementation. Presence of a spec does not establish implementation acceptance.

| Module id | Responsibility and observable result | Depends on | Scope spec |
| --- | --- | --- | --- |
| `ccpc-data` | Reproduce and validate official 2024 aggregates; produce the immutable data bundle, source manifest, calculation rules, and metadata connecting each civic question and visualization to the official records. Supply both presentation modes. | — | `SPEC-ccpc-data.md` |
| `play-session` | Own the Godot town, navigation, interaction and dialogue shell, input and accessibility settings, versioned local progress, reset, and recovery. A player can enter, interact, leave, and resume a session. | — | `SPEC-play-session.md` |
| `evidence-quests` | Translate two civic questions into CCPC-driven narrative chapters, accessible visualizations, interpretation tools, explanations, hints, independent transfer checks, and a persistent public exhibit. Integrate these with the play session. | `ccpc-data`, `play-session` | `SPEC-evidence-quests.md` |
| `community-choice` | Connect the exhibit to the importance of democratic participation through an explicitly fictional consultation, plural needs, deterministic synthetic counts, tie handling, reflection, and a final accountability question. Export equivalent narrative content and rules for the HTML version. | `play-session`, `evidence-quests` | `SPEC-community-choice.md` |
| `accessible-story` | Deliver a first-class semantic HTML experience of the same civic story, data visualizations, interpretation tools, consultation, and conclusion. Reuse the providers' content and rules; remain independently usable without running the Godot canvas. | `ccpc-data`, `evidence-quests`, `community-choice` | `SPEC-accessible-story.md` |
| `submission-package` | Assemble the tested outputs and required deck/PDF/video/code/letters checklist. Demonstrate the civic message, central CCPC use, accessibility, facilitator reuse, dissemination proposal, attribution, and evidence supporting every claimed outcome. | All five modules above | `SPEC-submission-package.md` |

Approved build order: `ccpc-data` and `play-session` can begin independently, then
`evidence-quests` → `community-choice` → `accessible-story` →
`submission-package`. The implementation slices are in [tasks/plan.md](tasks/plan.md)
and verification status in [tasks/todo.md](tasks/todo.md). Accessible content and
submission drafting may proceed in parallel against provider contracts; final
integrated verification depends on those providers being available. Canonical
shared content is `game/content/ccpc.json` and `game/content/story.json`.

## What makes the game competitive

| Judging criterion | Weight in supplied rubric | Proposed demonstration |
| --- | --- | --- |
| Apego a la temática | 35 | Real CCPC records drive the story, visualizations, valid interpretations, and feedback. A beginner can explain a participation pattern and connect the experience to the importance of participating in democratic life. |
| Claridad y solidez de la propuesta | 30 | Repeatable aggregation, explicit assumptions, numerical fixtures, readable Spanish explanations, test evidence, and an honest account of what was evaluated. |
| Originalidad y creatividad | 20 | Transforming real CCPC observations into an evolving public exhibit joins narrative, visual exploration, and collective-choice reflection. The pitch shows a complete question-to-story interaction and its value to a non-specialist audience. |
| Viabilidad para el aprovechamiento institucional | 15 | An accessible story usable through either Godot or semantic HTML, reusable visual explanations and discussion prompts, editable content, a facilitator guide, and a practical audience-specific dissemination proposal. |

The public call lists five evaluation considerations while the supplied scoring
rubric assigns points across four. Track institutional application as evidence
within the 15-point feasibility criterion; do not invent another scoring weight.

## Approved scope limits

- Learning rewards follow sound evidence and reflection. Choosing any consultation
  option, leaving the fictional ballot unmarked, or declining to vote allows a
  complete ending. Ballot choice is not saved or sent anywhere.
- Historical CCPC observations and synthetic consultation fixtures remain visibly
  distinct. Do not infer individual motives, party preferences, or the effect of
  this game from historical aggregate rates.
- Keyboard play, readable enlarged text, visible focus, mute, reduced motion, and
  an equivalent route without dragging are part of the core experience.
- No accounts, live data dependency, runtime AI, multiplayer, combat, farming
  economy, political profiling, or remote telemetry in the approved MVP.
- Protect both complete data quests and all mandatory deliverables. Reduce
  decorative extras first. A material reduction to one quest needs a scope
  decision; it is not the approved implementation baseline.

## Submission facts carried from research

The earlier research records downloading/reading the call on 24 October 2026;
this documentation contribution did not repeat that check. It records a maximum
10-slide presentation, code/repository where applicable, both official letters
signed by all team members, and these Reto 3 deliverables: a visual prototype;
a 3–5 page narrative and dissemination PDF; and a maximum three-minute MP4 pitch
at 1080p with accessible read-only hosting. The complete team-and-track-named ZIP
is due by 31 October 2026 at 23:59. The call does not specify a timezone.

Package readiness and external submission are separate: local implementation and
preparation are approved; signing letters, emailing the entry and public release
require their own authorization. Team registration for
Reto 3 is user-confirmed; eligibility and signed documents have not been audited.

## Remaining verification and external decisions

Approved: six modules, dependency direction, original adventure scope, Linux,
simplepixels and 45–65 focused person-hours. Context/data/assets/HTML and game
code/automated flows are implemented with evidence in the task list. GUT's two
journey tests are repaired and included in 9/9 passing. Full manual checkpoints,
formal screen-reader evaluation and user pilot are not complete. Narrative PDF
(4 pages), deck PDF (10 pages) and silent captioned MP4 (108.03 s) are produced;
all 14 PDF pages passed asset-worker visual QA. Main packages the candidate next;
team review, signed forms and hosting/access remain open. These reviews do not
reopen approval for authorized local work.

## Sources and evidence status

The entries below preserve earlier research's checks; none was newly browsed,
downloaded or runtime-tested by this documentation contribution. All 26 external
DOCX hyperlink relationships were recovered read-only through ZIP/XML standard
library inspection and recorded in [docs/source_register.md](docs/source_register.md).

- [Official CCPC portal](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/):
  inspected 24 October 2026; primary source entry point for the downloadable
  federal-election data and manual. Its judicial-election section is separate.
- User's Reto 3 emphasis in this conversation: the quoted design direction and
  central role of CCPC govern this revision of the proposed concept.
- [Existing development blueprint](INEhack_Development_Blueprint.md): concept,
  gameplay, candidate stack, data rules, scope, and delivery recommendations.
- [Existing learning evidence and pitch outline](INEhack_Learning_Evidence_and_Pitch_Outline.md):
  learning objectives, proposed evaluation, and presentation rationale.
- [Supplied evaluation rubric](R%C3%BAbrica%20de%20evaluaci%C3%B3n_Hackaton%20-1.pdf):
  actual scoring weights, excellent descriptors, and tiebreak criteria.
- [Research annex](INEhack_Research_Annex.zip): inspected reproduction instructions,
  source URL, recorded hash, and historical aggregate fixtures. The official raw
  data ZIP is not included; the reproduction script was not run in this turn.
- [Official INE call](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf):
  Reto 3, required deliverables, submission deadline, and distribution conditions.
- [Godot release archive](https://godotengine.org/download/archive/): checked
  24 October 2026; 4.7.2 is listed as stable.
- [Godot web export documentation](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html):
  checked for GDScript/web feasibility, Compatibility rendering, and single-thread
  export in research. Subsequent web export and browser boot/journey checks are
  recorded in [current verification](docs/verification.md); no broad performance
  benchmark or formal accessibility conformance is claimed.

## Execution and handoff

Proceed with the six root `SPEC-*.md` files, `tasks/plan.md` and `tasks/todo.md`
under the user's existing approval. Documentation is prepared; implementation
and its checks are owned by main and the assigned streams. Commands, planned
paths, current uncertainty and reconciliation duties are in
[docs/architecture.md](docs/architecture.md) and [docs/handoff.md](docs/handoff.md).
No executable scripts, original research changes or git commits belong to this
documentation assignment. Never infer a test/download/export pass from a task
description or a research result.
