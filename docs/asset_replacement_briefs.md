# Original asset and replacement briefs

All visible illustration/sound roles below already have authored original replacements in `game/assets/original/`. Keep semantic IDs stable when revising art. Sources of truth: `tools/create_original_assets.py`, `game/assets/catalogs/original.json`, `assets/original_manifest.json`, and [asset register](asset_register.md). Kenney is for comparison of scale/readability only: do not trace, recolor, or reuse its pixels or sounds for the final catalog.

Art direction: simple integer-grid pixel forms, warm paper/terracotta, cool teal, muted civic greens, dark blue-gray outlines; no gradients or external raster images. Silhouettes and symbols distinguish functions independently of color. Draw at integer scaling with nearest filtering. Keep text, button labels and numerical evidence in accessible UI rather than baked into illustrations. These drawings do not establish UI contrast or assistive-technology support; Main/web test those separately.

| Semantic role | Original/replacement brief and acceptance |
| --- | --- |
| `terrain.grass` | 16×16 repeating muted green ground, three tiny blade clusters. No directional edge or noisy pattern; readable under figures. |
| `terrain.path` | 16×16 warm sand path with sparse pebbles. Distinct from grass by texture and lightness, seamless at tile edges. |
| `terrain.paving` | 16×16 cool stone grid, offset joints. Civic plaza surface must read without tiny text. |
| `terrain.water` | 16×16 teal water with three short horizontal glints. Static texture works with reduced motion. |
| `terrain.floor` | 16×16 opaque warm wood boards, staggered joints and two quiet grain marks. Repeats in both axes; keep furniture and characters legible over the pattern. |
| `terrain.wall` | 16×16 opaque cream plaster above a teal lower panel and dark baseboard. Repeat horizontally as the wall face; distinguish it from the walkable floor by structure as well as color. |
| `building.printshop` | 64×64 warm shop, striped awning, paper/printer emblem over central door. Transparent surroundings, front-facing accessible entrance. |
| `building.archive` | 64×64 teal civic archive, open-book roof badge, broad windows, central doorway. Distinct from shop in silhouette/details. |
| `building.hall` | 64×64 ochre civic hall, columns, steps and small teal flag. No real party/official logo or copied crest. |
| `prop.tree` | 32×40 stepped leafy canopy, visible trunk and branch, light green highlight. Shade is recognizable without animation. |
| `prop.bench` | 32×20 two-slat warm wood seat, dark feet. Isolated transparent background; clear at world scale. |
| `prop.printer` | 32×32 teal tabletop printer, blank sheet entering and exiting, small status light. No baked text or logo. |
| `prop.noticeboard` | 32×32 wood framed civic noticeboard on posts, two overlapping blank-paper notices and pins. Text lives in the interaction panel. |
| `prop.ballotbox` | 16×24 ochre box, dark slot and a paper being inserted. Neutral consultation symbol, no party mark or real election styling. |
| `prop.desk` | 32×24 warm wood work desk, broad top, drawer handle, two dark legs and a blank paper. Full transparent canvas; recognizable separately from the slatted outdoor bench. |
| `prop.bookshelf` | 24×32 upright wood case with two shelves and seven unequal book spines. Pale spine bands and shelf gaps keep it readable without relying only on book colors; no baked titles. |
| `prop.chair` | 24×24 upright wood back, open back/seat gap, terracotta seat and two visible feet. Transparent surroundings; useful for the meeting arrangement without new character art. |
| `prop.exit` | 24×32 open wood-framed doorway, dark teal interior, pale downward arrow and threshold. Place toward the lower room edge. The arrow is supplemental to the visible exit label. The user's 26 October movement amendment replaces the former remote-exit/menu control with WASD walking through the doorway; the asset and role are unchanged. |
| `icon.shade` | 24×24 framed shade-tree and bench symbol. Must identify shade independently of the label color. |
| `icon.reading` | 24×24 framed open book. Pages/spine visibly distinguish it from the garden icon. |
| `icon.garden` | 24×24 framed soil, stem, two leaves and small flower. No numerical outcome embedded in icon. |
| `character.player` | Logical 16×24 teal-shirt civilian with gold accent and dark hair. Four directions × idle/two walking frames, 48×96 sheet. Default first frame faces down. |
| `character.luz` | Same animation/grid contract; terracotta shirt, warm hair and side ponytail, paper accent. Recognizable in grayscale by head detail. |
| `character.mateo` | Same contract; deeper skin tone, short dark hair, sage shirt, teal accent. Distinct clothing/hair silhouette; no stereotyped costume. |
| `character.ines` | Same contract; silver hair, glasses line, muted violet shirt, gold accent. Civilian appearance consistent with town scale. |
| `sound.focus` | Original 0.075 s soft 660 Hz focus tone; low amplitude, click-free envelope, mono PCM. Repeated focus must not be jarring. |
| `sound.select` | Original 0.170 s rising two-note acknowledgment; distinct from focus cue, no sampled click. |
| `sound.journal` | Original 0.380 s three-note ascending journal motif. UI must also show saved/journal feedback visually. |
| `sound.corrective` | Original 0.320 s gentle descending pair, neutral rather than punitive. No buzzer/alarm/startle effect. |
| `sound.chapter` | Original 0.780 s four-note rising cadence, longer than action cues, nonessential to progression. |
| `font.regular` | Unmodified Atkinson Hyperlegible Regular TTF, allowed OFL dependency. Preserve its exact license; do not claim original team font authorship. |
| `font.bold` | Unmodified Atkinson Hyperlegible Bold TTF, same dependency terms. Keep accent glyphs, Spanish punctuation, and readable enlarged text. |

Each character frame rectangle is `[column*16,row*24,16,24]`; rows down/left/right/up, columns idle/walk_1/walk_2. Keep all body pixels inside their frame; no frame overlap. Main's runtime may use the default region for static drawing while animation support consumes the remaining metadata.

No external UI panel asset is required. Main authors Godot StyleBoxes for panels, buttons, focus and enlarged text states; web authors its own HTML/CSS. The acquired Kenney button remains a comparison file, excluded from original staging.

Interior composition guidance for Main: pair Luz and the existing printer/noticeboard with a work desk; pair Mateo and the comparison noticeboard with bookshelves; pair Inés and the ballot box with a desk and spaced chairs. Reuse the same calm floor/wall palette and exit marker, with distinct object arrangements. Room layouts, collision-free routes, artifact updates and final room readability remain Main's integration work. These six drawings alone do not complete the three-room or rubric acceptance.

The interior drawings use only newly authored procedural geometry and the existing palette; no new external material or licence is introduced. Keep their `team-original` origin and the generator/hash provenance; do not apply the reference packs' CC0 label to them. The existing font files and OFL notice remain separate dependencies. See the register's RV07/RV08 evidence for native/grayscale review and the supplied Web-room screenshot observation.

To revise an original: change procedural source, regenerate with `python3 tools/create_original_assets.py`, inspect the result at native and enlarged size, verify metadata and both catalogs, then rerun `python3 -m unittest discover -s tests -p test_assets.py -v`. Regeneration records current asset hashes when font files are present and updates shared original entries in an existing development catalog without changing explicit reference selections. Preserve the six interior IDs, full regions and logical dimensions unless Main coordinates a layout change. If revising files manually instead, deliberately refresh with `python3 tools/assets.py record-original` only after review. Do not refresh checksums merely to silence unexpected tampering/missing-file errors. Production export and packaged room inspection belong to Main; no export is part of this interior-asset handoff. Reference images or tests must not enter the PCK.
