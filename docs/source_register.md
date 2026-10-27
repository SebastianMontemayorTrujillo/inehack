# Source register

Recorded 24 October 2026. Original hyperlink recovery inspected local research inputs read-only without visiting targets or running downloads. The tables below preserve that research snapshot; subsequent implementation evidence is recorded separately in [verification.md](verification.md) and the update below. Do not confuse research-era status with the current installed/tested baseline.

## Subsequent implementation evidence

26 October movement/poster revision: consulted official Godot [InputMap.action_erase_events](https://docs.godotengine.org/en/stable/classes/class_inputmap.html#class-inputmap-method-action-erase-events), [Input.get_vector](https://docs.godotengine.org/en/stable/classes/class_input.html#class-input-method-get-vector) and [Area2D.overlaps_body](https://docs.godotengine.org/en/stable/classes/class_area2d.html#class-area2d-method-overlaps-body). World movement binds physical WASD only; walking through overlapping door/exit regions changes rooms. The poster uses [PanelContainer](https://docs.godotengine.org/en/stable/classes/class_panelcontainer.html), container sizing and [Range.step](https://docs.godotengine.org/en/stable/classes/class_range.html#class-range-property-step) for an unquantized visual bar, while the existing exact rule chooses the finding. Runtime receipts in `verification.md` establish actual behavior; these API references alone do not.

Main confirmed official-SHA-512-verified Godot 4.7.2/templates and installed GUT 9.7.1. Actual CCPC raw SHA-256 matched the historical reference; 32 CSV/9,773,730 rows produced 33 national/state aggregates, recorded in `data/validation_report.json` and `game/content/ccpc.json`. Thus the annex's historical fixtures have now been reproduced for implementation; the annex itself remains unchanged.

Historical 24 October suites: Python 22, Node 17 and Godot GUT 9/9 passing, 40 GUT assertions and zero orphans. Current classroom results and scoped Orca observations are in [verification](verification.md). Web/Linux exports, HTML Playwright journey/persistence/five actions/three widths and Godot web/Linux headless boot passed with the limits in the verification record. Formal screen-reader evaluation, user pilot and remaining manual checks have not run/finished. The documentation contributor reads the records and main's report, rather than claiming to have rerun these suites.

## Recovery method and provenance

Used Python 3 standard-library `zipfile.ZipFile` and `xml.etree.ElementTree` to read each original DOCX's `word/_rels/document.xml.rels`. Selected relationships with a type ending `/hyperlink`, preserving `Id`, `TargetMode=External`, and exact `Target`. Matched labels through `word/document.xml` hyperlink `r:id` references. No DOCX was extracted/rewritten, and no executable extraction script was added to the workspace.

Recovered **14 blueprint relationships and 12 learning-outline relationships (26 total; one download URL appears in both)**. The converted Markdown contains labels such as “Source 1” without their targets; use the mappings below. A recovered link is evidence of the document's citation, not evidence that its target is currently reachable or accurate.

## Blueprint hyperlink relationships

Original: `INEhack_Development_Blueprint.docx`. All IDs below refer to `word/_rels/document.xml.rels`. “B” numbers correspond to the blueprint's numbered references.

| ID / reference | Recovered label and exact target | Intended use / verification still needed |
| --- | --- | --- |
| rId11 / B1 | [INE 2026 convocatoria and Reto 3 requirements](https://www.ine.mx/wp-content/uploads/2026/09/Convocatoria_Hackaton-1.pdf) | Research basis for track, artifacts and deadline; recheck before submission, timezone unspecified in research. |
| rId12 / B2 | [INE CCPC open data portal](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/) | Primary entry point; distinguish federal 2024 from judicial exercise. |
| rId13 / B3 | [INE manual for CCPC 2009 to 2024](https://ine.mx/wp-content/uploads/2025/06/Manual-Conteos-Censales-2009-2024.pdf) | Indicator definitions, especially research-cited pp. 17–18; main checks against actual dictionary. |
| rId14 / B4 | [INE 2024 official data ZIP and included field dictionary](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip) | Main must obtain/validate bytes and reproduce aggregates. |
| rId15 / B5 | [Godot release archive and pinned engine version](https://godotengine.org/download/archive/) | Intended 4.7.2 pin; installation/templates/exports remain main's verification. |
| rId16 / B6 | [Godot web export documentation](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html) | Validate requirements against actual chosen engine and browser. |
| rId17 / B7 | [OpenAI Codex documentation](https://developers.openai.com/codex/) | Research workflow citation; no runtime OpenAI dependency. |
| rId18 / B8 | [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility design reference; does not establish prototype conformance. |
| rId19 / B9 | [INE rights assignment letter](https://www.ine.mx/wp-content/uploads/2026/09/Carta-de-cesion-de-derechos_Hackaton-1.pdf) | Team reviews actual terms and signs personally; pending. |
| rId20 / B10 | [GUT test framework and version mapping](https://github.com/bitwes/Gut) | Research candidate only; not an installed/required dependency. |
| rId21 / B11 | [Dialogue Manager current version and stability warning](https://store.godotengine.org/asset/nathanhoad/dialogue-manager/) | Research candidate only; no adoption or current stability claim here. |
| rId22 / B12 | [AccessKit platform support](https://github.com/AccessKit/accesskit) | Research accessibility context; actual platform support must be checked, never assumed. |
| rId23 / B13 | [Codex AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | Historical research URL preserved exactly; not newly checked. |
| rId24 / B14 | [INE truth declaration letter](https://www.ine.mx/wp-content/uploads/2026/09/Carta-declaratoria-de-decir-la-verdad_Hackaton.pdf) | Team verifies form/completeness and signatures; pending. |

## Learning-outline hyperlink relationships

Original: `INEhack_Learning_Evidence_and_Pitch_Outline.docx`. IDs use the same relationship-part path. “L” numbers correspond to its “Source N” labels/reference list. Titles/authors below are carried from that local outline; no paper was reread in this task.

| ID / label | Recovered target and local reference | Use and limits |
| --- | --- | --- |
| rId11 / Source 1 / L1 | [Clark, Tanner-Smith & Killingsworth (2016), digital games/design/learning meta-analysis](https://doi.org/10.3102/0034654315582065) | Prior learning research, not this prototype's effect. |
| rId12 / Source 2 / L2 | [Wouters et al. (2013), serious-game cognitive/motivational effects](https://doi.org/10.1037/a0031311) | Prior research; retain population/design limits before quoting statistics. |
| rId13 / Source 3 / L3 | [Wouters & van Oostendorp (2013), instructional support](https://doi.org/10.1016/j.compedu.2012.07.018) | Rationale for feedback/hints, not a measured local gain. |
| rId14 / Source 4 / L4 | [Sailer & Homner (2020), gamification meta-analysis](https://doi.org/10.1007/s10648-019-09498-w) | Background; distinguish gamification from the whole adventure. |
| rId15 / Source 5 / L5 | [Habgood & Ainsworth (2011), intrinsic integration](https://doi.org/10.1080/10508406.2010.508029) | Child-learning context; not direct adult civic validation. |
| rId16 / Source 6 / L6 | [Yang et al. (2021), classroom testing meta-analysis](https://doi.org/10.1037/bul0000309) | Background for transfer checks, no local effect estimate. |
| rId17 / Source 7 / L7 | [Freeman et al. (2014), active learning in STEM](https://doi.org/10.1073/pnas.1319030111) | STEM context, not turnout or civic-game efficacy. |
| rId18 / Source 8 / L8 | [Roozenbeek & van der Linden (2020), Breaking Harmony Square](https://misinforeview.hks.harvard.edu/article/breaking-harmony-square-a-game-that-inoculates-against-political-misinformation/) | Civic-adjacent misinformation work, not a turnout claim. |
| rId19 / Source 9 / L9 | [Syvertsen et al. (2009), Student Voices evaluation](https://doi.org/10.1086/605100) | Distinct civic-education intervention, not this game. |
| rId20 / Source 10 / L10 | [Jerome et al. (2024), citizenship education review](https://doi.org/10.1002/rev3.3472) | Background on active citizenship; preserve review limitations. |
| rId21 / Source 11 / L11 | [INE June 2025 census-integration report](https://repositoriodocumental.ine.mx/xmlui/bitstream/handle/123456789/183892/cceyec-2so-25-06-25-p4-vf.pdf) | Research-cited national cross-check on pp. 16–17; not the December 2024 sample. |
| rId22 / Source 12 / L12 | [INE CCPC 2024 dataset and dictionary](https://ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip) | Same URL as B4; no second independent dataset. |

## Local research artifacts and historical data ledger

- `CAPABILITY_MAP.md`: earlier research records official-call/portal checks dated 24 October 2026. The current map records the subsequent user approval; it does not turn those checks into new runtime evidence.
- `INEhack_Development_Blueprint.md` and `.docx`: original concept, calculations, scope, architecture candidates and submission requirements. Preserve both unchanged.
- `INEhack_Learning_Evidence_and_Pitch_Outline.md` and `.docx`: educational hypotheses, proposed evaluation and ten-slide outline. Preserve both unchanged.
- `Rúbrica de evaluación_Hackaton -1.pdf`: supplied rubric, inspected directly for the current [iterative review](rubric_review.md). Four weights are 35/30/20/15, with thematic fit then clarity as tiebreaks. The historical research ledger below is distinct from this current scoring review.
- `INEhack_Research_Annex.zip`: read-only inspection of member names, README texts and `ccpc/verified_ccpc2024.json`. `ccpc/reproduce_ccpc2024.py` was not executed. `Codex_Prompts_and_Feature_Spec.txt` is a research template, not installed implementation.

The annex records a 23 October 2026 reproduction against a source ZIP of **82,419,841 bytes**, SHA-256 **`c0de34d04e782ad99579b83591a6e3e6c8d1e20f4914d4845743bd79d2bd28b2`**, **32 CSV files**, **9,773,730 rows**, and **zero arithmetic LN identity violations**. These are historical recorded results; the hash was read from the annex, not measured from a fresh download. Do not use it as a newly computed hash or infer a complete uniqueness/source-quality audit.

Recorded dictionary path inside the official archive: `DatosAbiertos_DECEyEC_ConteosCensales2024/01_descripcioncampos_conteoscensales2024.txt`. Header: AELEC, FELECCION, EDOCVE, EDONOM, MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF, DEL, SEXO, EDAD, LN, SV, NV, NS. Source excludes special polling stations and voting from abroad according to the supplied research. Main must check actual dictionary and raw bytes before validating game output. Official raw ZIP is not included in the research annex.

Annex national references: LN 98,330,348; SV 54,899,228; NV 37,105,466; NS 6,325,654. State/combined fixtures are in [SPEC-ccpc-data](../SPEC-ccpc-data.md). Arithmetic consistency is insufficient to infer motives, party choice, uniqueness, causality, intervention effects, or parity with differently filtered dashboards.

## Asset references and verification policy

For the 27 October interface revision, the official [Control input/focus properties](https://docs.godotengine.org/en/stable/classes/class_control.html), [keyboard navigation guidance](https://docs.godotengine.org/en/stable/tutorials/ui/gui_navigation.html) and [Theme reference](https://docs.godotengine.org/en/stable/classes/class_theme.html) were checked. A shared Theme supplies button variations; recursive focus/mouse disabling isolates the world-controls branch while a panel is open. Deferred focus and restoration follow the engine's GUI dispatch. The isolated-viewport regression tests use real key and mouse events; documentation alone is not runtime evidence.

For the optional poster workshop, the official [Godot OptionButton reference](https://docs.godotengine.org/en/stable/classes/class_optionbutton.html) and [Control reference](https://docs.godotengine.org/en/stable/classes/class_control.html) were checked on 25 October 2026. The implementation uses item metadata and selection for public state IDs, labelled controls, inherited themes and explicit focus. Runtime tests remain necessary; reading the API documentation does not establish interface acceptance.

The exported Linux workshop reproduced the parent-focus signal errors documented in official [Godot issue 89657](https://github.com/godotengine/godot/issues/89657), despite editor/GUT passes. The selected workaround uses documented [Window.force_native](https://docs.godotengine.org/en/stable/classes/class_window.html#class-window-property-force-native) for Linux dropdowns; web dropdowns remain embedded. The runtime checks keep rejecting engine errors. No debug export, engine upgrade or error suppression substitutes for a verified release build.

Development references: Kenney **tiny-town**, **roguelike-characters**, **ui-pack**, **interface-sounds** under CC0. The asset owner's [register](asset_register.md) now records actual acquisitions, hashes, licences, original role production, Atkinson Hyperlegible Regular/Bold under OFL and validation/staging/import evidence. Original-set exports succeeded. This documentation update reads but does not edit that register or certify human rights clearance; final visible art/sounds resolve to original roles.

For new evidence, main records who checked, when, exact source/version/hash if applicable, command/environment, result and limits. Use explicit labels: **carried from research**, **locally inspected**, **newly verified**, **proposed**, **pending**. This documentation contribution performed read-only research/hyperlink inspection and subsequent local evidence reconciliation; the runtime suites/downloads/exports were performed by their owners and reported by main.
