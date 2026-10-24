# Asset register

Asset subsystem implemented 24 October 2026. Main owns final game/export acceptance. All final illustrations and sounds are original procedural work authored for the Voces de la Plaza team in `tools/create_original_assets.py`. The generator uses integer-grid SVG geometry and mathematical oscillators: no Kenney pixels, traced shapes, sampled audio, purchased assets, or image-generation output are incorporated. Human review of final authorship/rights statements remains part of submission preparation.

## Runtime contract

`game/assets/catalogs/original.json` and `development.json` have `schema_version: 1`, `asset_set`, and `assets` keyed by semantic role. Main's `CivicAssetCatalog.texture(role)`, `sound(role)`, and `font(role)` consume each entry's `res://` path. Source gameplay defaults to `original.json`; staging writes its selected catalog to `game/assets/active_catalog.json` in the staged project only.

Illustrations supply `size` (logical pixels), `region: [x,y,width,height]`, and nearest-filter intent. Characters use a 48×96 SVG sheet, `frame_size: [16,24]`, `sheet_size`, `fps: 6`, and `animations` mapping `down`, `left`, `right`, `up` to three rectangle arrays each, ordered idle/walk_1/walk_2. The default region is `[0,0,16,24]`; drawing it as an AtlasTexture produces one character, not the whole sheet. Main controls animation playback. Development references may have different dimensions; use their metadata.

| Roles | Original files under `game/assets/original/` | Logical dimensions / audio |
| --- | --- | --- |
| `terrain.grass`, `.path`, `.paving`, `.water` | `terrain_grass.svg`, `terrain_path.svg`, `terrain_paving.svg`, `terrain_water.svg` | Each 16×16; repeating tile |
| `building.printshop`, `.archive`, `.hall` | `building_printshop.svg`, `building_archive.svg`, `building_hall.svg` | Each 64×64; distinct roof symbols |
| `prop.tree` | `prop_tree.svg` | 32×40 |
| `prop.bench` | `prop_bench.svg` | 32×20 |
| `prop.printer`, `.noticeboard` | `prop_printer.svg`, `prop_noticeboard.svg` | Each 32×32 |
| `prop.ballotbox` | `prop_ballotbox.svg` | 16×24 |
| `icon.shade`, `.reading`, `.garden` | `icon_shade.svg`, `icon_reading.svg`, `icon_garden.svg` | Each 24×24 |
| `character.player`, `.luz`, `.mateo`, `.ines` | `character_player.svg`, `character_luz.svg`, `character_mateo.svg`, `character_ines.svg` | Each logical 16×24; 12 frames |
| `sound.focus` | `sound_focus.wav` | 0.075 s, 660 Hz note |
| `sound.select` | `sound_select.wav` | 0.170 s, two-note acknowledgment |
| `sound.journal` | `sound_journal.wav` | 0.380 s, three-note rising cue |
| `sound.corrective` | `sound_corrective.wav` | 0.320 s, gentle descending pair |
| `sound.chapter` | `sound_chapter.wav` | 0.780 s, four-note completion cue |
| `font.regular`, `font.bold` | `../fonts/AtkinsonHyperlegible-Regular.ttf`, `../fonts/AtkinsonHyperlegible-Bold.ttf` | Unmodified OFL font dependency; not original art |

All WAVs are mono 16-bit PCM, 22,050 Hz, generated with quiet sine tones plus a small second harmonic and raised-cosine envelopes. Controls/settings must retain Main's mute behavior. Sound must never be the sole source of feedback. UI panels and focus outlines are Main's Godot StyleBoxes; no external panel graphic is needed.

`assets/original_manifest.json` records the authoring method, generator SHA-256, generation timestamp, and every runtime asset's SHA-256 and byte count, including fonts and `OFL.txt`. Regeneration is deterministic for SVG/WAV bytes; the measured manifest timestamp changes. Changing an original deliberately requires regeneration or `record-original`, never a development fallback.

## Acquired references and dependency

The following exact downloads completed on 2026-10-24 between 18:02:22 and 18:02:53 UTC. `assets/reference_manifest.json` is authoritative for URLs, resolved URLs, per-file retrieval times, byte counts, licenses, archive members, and full hashes. The four Kenney packs are reference-only and CC0; Atkinson Regular/Bold may ship under OFL-1.1 with the full license.

| Download | Bytes | SHA-256 |
| --- | ---: | --- |
| Tiny Town | 182243 | `9768692dccff1d706408a5aedd6ca4f6cd1409506cbc84cb2f862919764be977` |
| Roguelike Characters | 63243 | `05c4c0af7326584cfffbbb196571eb9e102981d2033e90e225c5ba8da8771284` |
| UI Pack | 1229750 | `a8a14a234911eb648c062622915c93e79e94e97cb7f9f375a70f6617f1174318` |
| Interface Sounds | 834536 | `f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232` |
| Atkinson Hyperlegible Regular | 54348 | `7fb917c89019896d0b52ee84b7cbb3304c18cb90b19a62f5e32712bd23e97669` |
| Atkinson Hyperlegible Bold | 55256 | `5a3b0c8cc8ca545155150b4512a1fa248298df121c50d6557e651e61fbdab92f` |
| Font OFL.txt | 4352 | `f32d22b3908fcad2c86a74000614ec22e6a7f66ea7e867e616026a27aebdc143` |

Sources: [Tiny Town](https://kenney.nl/assets/tiny-town), [Roguelike Characters](https://kenney.nl/assets/roguelike-characters), [UI Pack](https://kenney.nl/assets/ui-pack), [Interface Sounds](https://kenney.nl/assets/interface-sounds), [Atkinson Hyperlegible / Google Fonts](https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegible). Kenney's supplied license texts are preserved verbatim in `assets/licenses/*-0.txt`; the font's supplied license is `game/assets/fonts/OFL.txt`. These are retained provenance, not a claim that any reference illustration ships.

Reference ZIPs reside outside the engine project in ignored `references/assets/`. Exact selected source bytes reside in ignored `game/assets/development/`:

| Pack | Source archive member | Development use |
| --- | --- | --- |
| Tiny Town | `Tiles/tile_0000.png` | `terrain.grass` |
| Roguelike Characters | `Spritesheet/roguelikeChar_transparent.png` | `character.player`, region 0,0,16,16; documented source tile margin 1 px |
| UI Pack | `PNG/Blue/Default/button_rectangle_flat.png` | Retained comparison reference only; no runtime panel role |
| Interface Sounds | `Audio/click_001.ogg` | `sound.select` |

Other development roles intentionally use the same original files. No preview montage, third-party font from Kenney's UI pack, or unapproved pack is selected.

## Acquisition, checks and export

```sh
python3 tools/create_original_assets.py
python3 tools/assets.py fetch
python3 tools/assets.py verify
python3 tools/assets.py verify --asset-set development
python3 -m unittest discover -s tests -p test_assets.py -v
python3 tools/export_game.py --target web --asset-set original --stage-only
```

`fetch` uses only the explicit approved free URLs. The observed sandbox DNS failure was retried with approved escalated execution; acquisition actually completed. Reacquisition measures the newly downloaded bytes and updates provenance. Normal validation/export does not download or repair anything. Missing archives require reacquisition; missing/mutated originals fail validation even if development references exist.

Every CLI export first verifies downloaded archives, licenses, selected references and the chosen catalog against recorded hashes. Path validation rejects traversal, absolute/non-resource paths, and symlink escapes. Production catalogs allow only original illustrations/sounds plus OFL font files. Staging copies game source/content but excludes `.godot`, tests/GUT, reference directories, the source assets directory, and every unused catalog/asset. Only selected asset files and OFL.txt are copied back. A hardcoded production reference/test resource fails staging. `assets/export_manifest.json` inside staging lists shipped asset hashes.

Main's export commands, after matching templates finish installing:

```sh
python3 tools/export_game.py --target web --asset-set original
python3 tools/export_game.py --target linux --asset-set original
```

The wrapper is `tools/godot`; `XDG_DATA_HOME` is `.tools/share`. Projects stage at `build/staging-web` or `build/staging-linux`; final outputs are `build/web/game/index.html` and `build/linux/voces-de-la-plaza.x86_64` (with Godot PCK according to Main's preset). Web export copies the semantic site from `web/` and shared JSON from `game/content/` to `build/web/content/`. `--asset-set development` is explicit and does not satisfy final originality acceptance. Final engine exports are Main's responsibility after template installation; asset tests/staging alone do not establish export success or accessibility.

Main's `Web` and `Linux` export presets must include JSON and text files (`*.json,*.txt`) for dynamic catalog/content loading and the OFL notice; the Linux preset determines external PCK versus embedding. The exporter does not invent or override those project settings.

## Verification recorded by the asset contributor

- `python3 -m unittest discover -s tests -v`: 20 tests passed at this handoff (15 asset tests and 5 data tests). Asset cases cover missing-original failure, original/reference hash tampering, partial download manifests, unsafe paths/symlinks, frame bounds, sound PCM properties, actual reference sprite selection, and production leakage prevention.
- Both `python3 tools/assets.py verify` and `verify --asset-set development`: passed against the actual acquired files.
- Both target commands with `--asset-set original --stage-only`: passed; each staged project contained 39 files at this point, including all 24 original illustrations/sounds and the OFL dependency, no development catalog/assets, tests or GUT. Main's ongoing source additions may increase that count. Every staged selected asset hash matched the verified source bytes.
- Godot `v4.7.2.stable.official.ed1daf0bf` in an isolated `/tmp/inehack-asset-qa-pf3in0ht` project imported the original assets and loaded all 26 roles through Main's actual `CivicAssetCatalog`: 19 valid AtlasTextures at catalog logical dimensions, 5 nonempty AudioStreamWAV objects, and 2 FontFile objects. The smoke script printed `ASSET_CATALOG_SMOKE_OK`. Sandbox editor socket errors prompted an escalated rerun, which completed without errors. No engine export was invoked.
- An enlarged SVG contact sheet was rendered into `/tmp/inehack-assets-contact.png` and visually inspected. Final game-scale rendering, movement/animation playback, sound listening/mute, platform exports, and the full game walkthrough remain Main's runtime acceptance work.

Implementation files: `tools/assets.py`, `tools/create_original_assets.py`, `tools/export_game.py`, `tests/test_assets.py`, both manifests under `assets/`, supplied CC0 texts under `assets/licenses/`, original/development catalogs and assets under `game/assets/`, this register, and `docs/asset_replacement_briefs.md`. Ignored download/selection bytes are intentionally present locally. No commits were created.
