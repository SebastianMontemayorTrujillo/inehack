# Citizen campaign finale · 27 October 2026

Approved implementation: calm libre music, translucent bottom conversations,
ordered learning, and an actual downloadable Carta portrait campaign poster.

## Journey

All three houses remain enterable. Luz introduces the sourced bulletin; Mateo
redirects early visitors to Luz; Inés redirects them to the first unfinished
evidence activity. Character speech uses dark translucent bottom panels, with
instant text, speaker portraits and ordinary keyboard controls. Evidence,
questions and poster editing retain their larger reading panels. WASD remains
the only Godot travel. E/Enter acts nearby; closing a panel never travels.

The consultation is step three of four. Every consultation action and neutral
follow-up unlocks Inés's campaign conversation. The player reviews either the
published personal poster or a guided Aguascalientes/Baja California proportion
comparison with the neutral missing-information question. Inés sends a frozen
design to Luz **within the fiction**, with no external message or service.

The player walks back to the first house and uses its press. Only that nearby
interaction offers **Imprimir cartel** and completes the game. A brief optional
paper fade gives way to **FIN · La campaña comienza contigo**. Downloading the
PDF is a separate explicit action; physical printing is not required. The final
town remains explorable, and the diary can reopen the ending.

## PDF and private state

The campaign is citizen-led and nonpartisan. Its headline is “Tu voto cuenta.
Infórmate y participa.” No Latas, INEhack, official campaign logo, endorsement or
fictional consultation tally appears. INE/CCPC is credited as the historical
data source, with year, exact counts, denominators, NS, common-scale bars,
discussion question and limitations. Team metadata in the submission package
continues to identify Latas.

The one-page PDF is Carta portrait (612 × 792 points), with embedded Atkinson
fonts, Unicode text mappings, vector charts and a source link. Both offline
writers consume the same layout/font resources and existing exact poster
composition. Browser downloads use a user-activated download action; Linux uses
a filesystem save dialog. Generation must succeed before dispatch is confirmed.
Cancelling a save or a blocked download does not undo the in-game ending.

Draft, publication, queued job and final PDF bytes are distinct session memory.
Cancelling review preserves the queued job. An explicit successful replacement
at Inés changes it before printing. A failed replacement preserves it. Printing
freezes it for repeat downloads; reset clears all of these objects.

Godot save schema 2 and HTML version 3 migrate older allowed progress/settings.
The new non-sensitive `campaign_printed` flag requires all three chapters;
legacy consultation completion is not interpreted as printing. No poster
selection, ballot choice, option-linked result or PDF is persisted. Reloading a
pending job explains how to recreate it with Inés. Completed saves show the
ending without pretending to reconstruct the earlier personalized PDF.

## Audio and technical references

The existing visuals stay in place. KiluaBoy's CC0 [Sunset Walk ambient loop](https://opengameart.org/node/87082)
is a separately attributed dependency, not original team music. It is bundled
locally. A dedicated nonpositional player continues across rooms, starts after
interaction, defaults to 20% volume, and supports mute and independent volume.
Godot softly ducks music during speech; mute silences playback immediately.
HTML playback rejection has no effect on progression.

Implementation follows official [AudioStreamPlayer](https://docs.godotengine.org/en/stable/classes/class_audiostreamplayer.html),
[FileDialog](https://docs.godotengine.org/en/stable/classes/class_filedialog.html) and
[JavaScriptBridge download](https://docs.godotengine.org/en/stable/classes/class_javascriptbridge.html)
contracts. A browser download request cannot establish that a file was saved.

## Acceptance

Run Python, Node and GUT checks; inspect native/browser PDF extraction and
rendering; complete actual Linux, canvas and HTML journeys through the press.
Verify large text/focus/contrast, all five consultation choices, before/after
migration, early visits, nearby-only printing, replacement failure, reset and
privacy. Keep runtime-error checks strict. Record commands and actual outcomes
in verification evidence, then rebuild the local candidate and affected media.
No formal accessibility certification, participant pilot, listening-comfort
study, official rubric score, real-world sending or public release is implied.
