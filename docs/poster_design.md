# Pink citizen poster · 27 October 2026

## Integration contract

Poster slice owns `campaign_layout.json`, `poster_card.gd`, both campaign PDF
writers, their focused tests/sample runners, and this document. Main owns story,
rules, progression and integration; web owns `poster.mjs`/CSS; ending owns the
FIN screen. This document records the shared integration contract.

- Palette: pink **#B41476**, white **#FFFFFF**, ink **#242124**, pale pink
  **#FBEAF3**. Use pink on white or white on pink for emphasis; ink for evidence.
- Atkinson Hyperlegible Regular/Bold remain unchanged. No official logo,
  Latas/INEhack poster branding, endorsement or synthetic consultation tally.
- Visible citizen label (full/compact/PDF/HTML): **Campaña ciudadana · Material educativo**.
- Order: large **Tu voto cuenta. Infórmate y participa.** → citizen campaign
  label → sourced finding → measure and two labelled bars/values → distinct
  discussion question → full counts, base, NS, limitations and official link.
- PDF: Carta portrait, 612 × 792 points; vector/selectable text; same schema-1
  layout and font JSON consumed by native/JS. Exact comparisons and rounding
  stay with existing composition/writers. An unavailable rate has no bar.
- Godot: preserve `Card.create(app, result)`; optional third argument
  `compact = false`. The compact view shows invitation, finding, values and
  question; callers provide an Enlarge control for the full evidence view.
  The card does not add controls, navigation, animation or persistence.
- Verification outputs use `build/evidence/pink-poster-*`; old campaign receipts
  are historical. This slice does not export, package or certify either UI route.

## Design direction: Plaza abierta

The invitation is the poster's single bold gesture: large white Atkinson on a
pink field. It should read from across a room, then reward a closer look with
carefully aligned evidence. The palette recalls familiar civic communication
while the words and composition identify an original citizen campaign.

White space separates invitation, observation and discussion. A consistent left
edge and generous row spacing give every state the same visual treatment. Both
bars use one scale and one color; direct labels retain meaning in grayscale.
No decorative seal, numbered badge or invented institutional symbol is needed.

The finding gets the next strongest type weight. The question occupies its own
pale field, clearly asking the reader to discuss something the data cannot settle
alone. Meticulous spacing, rather than extra ornament, carries the hierarchy.

The evidence remains part of the artifact: readable exact counts, explicit
classification, limitations and a full source address. Print geometry is checked
against actual font metrics and rendered pages. Screen previews keep real labels
and enlarged-text behavior instead of flattening the poster into an image.

## Verification

The focused implementation is complete. The existing writer architecture,
embedded Atkinson bytes, CCPC bundle and exact comparison logic are unchanged.
The full Card shares the layout's palette, invitation, citizen label,
classification copy and source label. Its responsive container layout is a
screen preview, while both PDF writers consume the same Carta block geometry.
`Card.RED` remains available for the existing source-control focus border.

| Command | Actual result |
| --- | --- |
| `python3 -m unittest discover -s tests -p test_campaign_pdf.py` | 3 passed: font reproduction/integrity and color/luminance contrast. |
| `node --test tests/campaign-pdf.test.mjs` | 9 passed: exact data, geometry, wrapping, missing/zero/tied/near-tied values, every bundled state in both measures, invalid inputs and glyph/overflow rejection. |
| `./tools/godot --headless --path game -s addons/gut/gut_cmdln.gd -gtest=res://tests/test_campaign_pdf.gd -gexit` | 5/5 passed, 84 assertions, no runtime errors or reported orphans. Includes full/compact evidence, compact height, enlarged long labels and unavailable rates. |
| `node tests/campaign_pdf_samples.mjs` | Six native/JS PDF pairs byte-identical and their color raster pairs identical; strict pypdf + Poppler extraction/word bounds; 12 color and 6 grayscale renders. |
| `git diff --check` on owned files | Passed. |

The new hierarchy test first failed on the old headline's tight line spacing.
The redesigned sample run also caught Poppler reading a large value before its
state name; aligning row starts corrected the order while preserving the strict
extraction comparison. Integration caught the existing `Card.RED` consumer and
the short base/NS summary; both compatibility contracts were retained. No tests
were disabled or weakened.

Minimum PDF text is **10.5 pt**, with a **38 pt** invitation. Measured sRGB contrast
is **6.359:1** for pink/white, **5.501:1** for pink/pale, **15.933:1** for ink/white
and **13.782:1** for ink/pale. Both data rows retain direct names, values and a
common scale in grayscale. Exact ties remain neutral; displayed 50.00% ties do
not replace exact-fraction findings; unavailable proportions omit their bars.

Visual review covered all six distinct color pages (`count`, `rate`, `long`,
`unavailable`, `near`, `equal`) and their six grayscale pages after the citizen
label change. Text, bars, discussion and footer remained readable with no
clipping or overlap. The longer-label fixture wraps its finding onto two lines.
An additional `pink-poster-source-wrap-fixture.png` review checked a two-line
source address; it stays above the bottom margin. This QA fixture appends a
synthetic query string and is not a dissemination example. The actual source
address fits on one line. Automated word boxes also reject overlap with bars or
the footer rule; the limits block ends before that rule.

Receipts: `build/evidence/pink-poster-tests.json`, `pink-poster-pdf.json` and
`pink-poster-review.json`; focused logs and rendered PNGs use the same prefix.
The PDF receipt fingerprints its inputs before generation and rechecks them at
the end. The review receipt identifies inspected raster bytes and owned files.

For main's submission example, use
`build/evidence/pink-poster-native-rate.pdf` (or its byte-identical JS counterpart).
It uses the unchanged actual Aguascalientes/Baja California records and the
neutral missing-information question, with the revised citizen label. SHA-256:
`affd8a6f3177450221e1f341e956dc3ce7904b72529bd2cfb625e7abca254d38`.
The other synthetic sample overrides remain QA evidence only.

## Changed files and limits

Product files: `game/content/campaign_layout.json`,
`game/scripts/poster_card.gd`, `game/scripts/campaign_pdf.gd`,
`web/campaign-pdf.mjs`.

Checks and evidence runners: `tests/campaign-pdf.test.mjs`,
`game/tests/test_campaign_pdf.gd`, `tests/inspect_campaign_pdf.py`,
`tests/test_campaign_pdf.py`, `tests/campaign_pdf_samples.gd`,
`tests/campaign_pdf_samples.mjs`. This document is the only poster-owned doc.

These results cover source-level PDF generation and headless Godot geometry.
Actual Linux/canvas/HTML journeys, the FIN animation/controls and download
integration belong to main/ending/web acceptance. No export, package, commit,
screen-reader certification, PDF/UA conformance, physical print test or pilot
was performed by this slice. The PDF remains searchable, not tagged PDF/UA.

Poster-owned sources are frozen for main's integration/export pass. No further
source writes are planned unless a reproduced integration defect requires one.
