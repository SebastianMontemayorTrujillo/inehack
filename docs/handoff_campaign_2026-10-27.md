# Campaign handoff · Equipo Latas

27 October 2026. The approved implementation adds music, bottom conversations and the print finale to **Voces de la Plaza**. Team registration remains **Latas / Reto 3**. No commit, external message, signature or public release was performed.

## Delivered behavior

Walk with WASD through all three houses. Luz, Mateo and Inés speak in translucent bottom panels with portraits; early visitors receive directions to the previous unfinished activity. Evidence and questions retain larger reading panels. The CC0 ambient music starts after interaction and offers mute/volume controls. Original art and sound effects remain intact.

After any consultation choice and follow-up, Inés reviews and sends either the published personal poster or the guided default. This is a fictional dispatch. The player walks back to Luz's first-house press and selects **Imprimir cartel**. **FIN · La campaña comienza contigo** clearly ends the game, with an actual Carta PDF download/save and continued exploration.

The citizen campaign has no Latas/INEhack branding or official endorsement. INE/CCPC is its historical data source. The PDF includes exact counts, bases, NS, source, neutral question and limitations, with vector charts and embedded fonts. The standalone guided example is `submission/cartel_ciudadano_ejemplo.pdf`.

Godot schema 2 and HTML version 3 migrate older saves. Only completion and settings are stored; ballot choice, poster selection, queued design and PDF stay out of persistence. Cancelling/replacing a print job and reloading follow the [documented contract](campaign_finale.md). All five consultation actions have the same ending.

## Play, review and reproduce

Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/build/web/`. The page links the independent HTML route, Godot canvas and classroom resources. Native play uses `build/linux/voces-de-la-plaza.x86_64` together with its PCK.

The formal checks pass **38 Python + 43 Node + 53 GUT = 134 tests**, with **1,608 GUT assertions and zero orphans**. Both release exports boot; all five compiled-PCK journeys pass. Actual Linux and browser-canvas journeys pass, including physical travel, press completion, enlarged controls and real PDF output. See [verification](verification.md) for commands, timings, captured identities and scope.

Current receipts are `verification.json`, `browser-results.json`, `browser-campaign-results.json`, `native-window.json`, `native-pdf-save.json`, `godot-web-journey.json` and `campaign-pdf.json` under `build/evidence/`. These separate unit checks, actual runtime interactions, PDF parsing and visual review. Source/asset/engine provenance remains documented; the canonical CCPC bytes were not changed.

The review package is `submission/Latas_Reto_3.zip`, with `release_manifest.json` and the external `build/evidence/clean-candidate.json` receipt. The package is current only when the receipt identifies the exact ZIP and passes safe extraction, hashes and isolated runtime checks. Updated teaching PDFs/deck/demo have their own `document-render.json` and `pitch-encoding.json` identities.

## Limits and remaining external actions

The music was decoded and its loop/playback controls checked, but listening comfort was not evaluated. The new HTML passed keyboard/axe/responsive checks; the 25 October Orca observations remain historical. No new screen-reader-user evaluation, native browser-zoom assessment, PDF/UA certification, teacher/student pilot, learning-gain measurement or hardware-printer test is claimed. The learner duration remains a 10–15 minute design target.

Signing, member eligibility/rights confirmation, public hosting and sending remain separate team actions. No new rubric score or institutional adoption is claimed. The earlier interface handoff is retained as [historical context](handoff_interface_2026-10-27.md).
