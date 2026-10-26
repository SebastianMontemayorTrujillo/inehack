# Classroom HTML: final scoped Orca review

25 October 2026. **The refreshed assembled HTML route passed the scoped actual
Orca smoke:** seven activity-feedback cases, two chapter-publication cases and
twelve optional-workshop cases. The run began **20:04:30 UTC**, lasted **261.71
seconds**, and exited **0**. This is an integration smoke, not formal
screen-reader evaluation, participant research, certification or complete WCAG
conformance.

The [final receipt](../build/evidence/assistive-workshop-final/assistive-receipt.json)
is the current identity/outcome record. Earlier interrupted and failing runs
remain separately archived; their results have not been relabelled.

## Tested route, command and identities

```sh
ASSISTIVE_URL=http://127.0.0.1:8765/build/web/ /usr/bin/python3 tests/screen_reader_smoke.py --workshop
```

The frozen runner performed the complete journey after the web owner's Inés
acknowledgement fix and main's re-export. It retained the seven feedback cases
and both chapter announcements; no partial workshop-only run was substituted.
No application or runner edits occurred during the run.

All nine captured HTML/module/CSS/content responses returned HTTP 200 and
matched both their assembled files and canonical source. Before/after source
hashes also matched. Godot-only rebuilds did not alter these HTML identities.
This checks the captured document/script/style/content responses, not every
image, font or downloadable resource.

| File | SHA-256 in the final run |
| --- | --- |
| `web/index.html` | `9a7a3bf8b5a400add7a7efb4e84df6d25462335f6244ee578f7e3e5b3542c68b` |
| `web/app.mjs` | `3c9182525ada62fb185c3fff01eaeab55dc28fd0c5c2c816d59275046d51dd9a` |
| `web/views.mjs` | `65cf6498a8b86214e65a05b483bfdd002b5672da303c50007884a70180e2f060` |
| `web/logic.mjs` | `6bcd10be31ec53d3f5f1277a1f179fdb1afa765668c7ad18b56f517fdaaccf3e` |
| `web/poster.mjs` | `79f1663ef74a4df52adf891bc2ec2640bac53fc6b39b9d7f31bb3f18068806e1` |
| `web/poster-workshop.mjs` | `c48a07c5dbd1f9988018530eeecdf2dae6b562070f51f27c1cf12c8d06e16d43` |
| `web/styles.css` | `f23415254af0a47091acd196921950a1fecfe529a5a46d70730466ef56f7169e` |
| `game/content/story.json` | `42a8b6e8e47e2ce8ac1ddc29bff7b6947d4b80cfd8c09a683e615604d9ccfdb5` |
| `game/content/ccpc.json` | `0abe5ec5b0314a2fede4fd1dd86d589f4cf87648de0105ab772f889bfb8db44c` |
| `tests/screen_reader_smoke.py` | `e1543c7c7cd72a5b2b82f76f238946cd9a51070492078166b8955a5fd0f56d1c` |

The [run manifest](../build/evidence/assistive-workshop-final/assistive-run.json)
records versions, hashes and assertions; the
[served-asset record](../build/evidence/assistive-workshop-final/assistive-served-assets.json)
records actual URLs, response status, byte counts and hashes. The
[review extraction](../build/evidence/assistive-workshop-final/assistive-review-summary.json)
includes source/bundle comparisons, timings and rendered measurements.

## Actual speech and state observations

Each feedback window was eight seconds. The runner matched the full visible
message in Orca's own `SPEECH OUTPUT`, counted the completion text and checked
correct/retry/supported state. Missing or duplicate announcements fail the
command. Logged feedback generation followed activation by **0.295–0.357
seconds**; these are null-device log timings, not listening or learner timings.

| Case | Observed result |
| --- | --- |
| Correct answer | Full explanation and completion text once; independent-correct state. |
| Wrong answer | Full retry explanation and completion text once. |
| Identical wrong answer resubmitted | One complete announcement for this additional submission. |
| Correct after retry | Once; the explanation acknowledged retry without assistance. |
| Explicit assistance | Once; supported completion explicitly did not count as independent. |
| Last printing activity with assistance | Once; “Ya puedes publicar…” once; supported state. |
| Last comparison activity with assistance | Once; “Ya puedes publicar…” once; supported state. |
| Publish first/second chapter artifact | “1 de 3 capítulos terminados” and “2 de 3 capítulos terminados,” each once. |

The [seven feedback cases](../build/evidence/assistive-workshop-final/assistive-feedback-cases.json)
and [complete manifest](../build/evidence/assistive-workshop-final/assistive-run.json)
retain the matched strings and their actual speech windows.

| Workshop checks | Observed result |
| --- | --- |
| Open and four selects | Heading focus worked. Native Tab followed first state, second state, metric and neutral question. Orca read all four labels and the selected values. |
| Count/rate previews | Nuevo León/Baja California and the selected question appeared. Each focused finding heading was spoken exactly once after activation. |
| Carry to the meeting | Focus reached `#poster-meeting-title`; “Más registros: NUEVO LEON.” was spoken once. The meeting was visible, the ballot stayed closed, and the acknowledgement and memory note were present. |
| Revise, cancel, reopen | Changing the metric required a new preview. Cancelling preserved the count publication, focused “Revisar mi cartel,” and reopening restored the published selections. |
| Reset | All three authored-poster slots emptied, progress cleared, and focus/speech returned to the plaza. |

All twelve [workshop cases](../build/evidence/assistive-workshop-final/assistive-workshop-cases.json)
passed. Preview/publication use heading focus; the live-region text was empty
in those windows. Counting starts after tabbing to the action button, so
earlier preview reading cannot be counted as a duplicate publication.

The web owner added a normal Inés acknowledgement paragraph immediately after
the meeting finding. Its presence was verified in rendered content and the
[meeting screenshot](../build/evidence/assistive-workshop-final/assistive-workshop-meeting.png).
**The finding heading was measured as spoken once; automatic speech of the
acknowledgement paragraph was not asserted.** The screenshot also confirms the
visible focus outline and readable paragraph. The
[preview screenshot](../build/evidence/assistive-workshop-final/assistive-workshop-preview.png)
shows the selected values and sourced finding.

The [speech-only log](../build/evidence/assistive-workshop-final/assistive-speech.log),
[unmodified Orca debug log](../build/evidence/assistive-workshop-final/assistive-orca-debug.log)
and [native input trace](../build/evidence/assistive-workshop-final/assistive-actions.jsonl)
are the direct reader evidence. DOM checks establish rendered state; they are
not substituted for speech.

## Other sampled observations and limits

| Area | Verified observation | Limit |
| --- | --- | --- |
| Headings/labels | Orca read heading levels 1–4, houses/tasks, settings, question legend, radio state, scenario selector and five unselected consultation options. | Sampled route, not comprehensive reading order. |
| Table | Browse commands read the national table, “Registros,” and “Con participación (SV) row header 54,899,228.” | Not every artifact/result table. |
| Keyboard | Native keys traversed three houses, published artifacts, authored/revised a poster and reached consultation; focus restoration worked. | Scripted assisted journey; no ballot selection/submission. |
| Zoom | Actual 200%/400% browser zoom gave DPR 2/4, viewports 639/319 CSS px and document widths 632/316 px; no sampled controls overflowed horizontally. | Consultation sampled; workshop preview appearance was checked at normal zoom. Vertical scrolling is necessary. |
| Contrast | Minimum sampled text ratio 5.54:1; bar/track ratios 7.89:1 and 5.22:1; sampled focus contrast at least 6.62:1. No sampled text threshold failures. | Computed solid backgrounds; not every hover/error/native-control/pseudo-element state. |
| Equal presentation | Project columns matched typography/padding and had effectively equal dimensions. All five ballot labels had identical baseline styling and no preselection. | Focus changes the current control's appearance; no participant neutrality study. |

Native X-screen images at
[200%](../build/evidence/assistive-workshop-final/assistive-zoom-200.png) and
[400%](../build/evidence/assistive-workshop-final/assistive-zoom-400.png)
were visually inspected: the submit control and wrapped radio label remained
reachable and visibly focused. No page errors were logged in this smoke.

Formal screen-reader evaluation and participant/teacher pilots have not run.
Pronunciation, listening comfort, braille, other reader/browser combinations,
comprehensive reading order, actual Orca ballot/ending completion,
startup/loading/storage-error announcements, detailed poster source-table
readout and classroom-guide/paper-resource accessibility remain unverified by
this smoke. The 10–15 minute experience length remains a design target.
Assistance does not establish independent mastery.

Main's aggregate, native/canvas, classroom-resource and media evidence remains
in [verification](verification.md) and its
[browser record](../build/evidence/browser-results.json). Axe, rule tests and
browser automation are separate evidence and do not broaden these Orca claims.

## Isolation and cleanup

Stack: Ubuntu 26.04.1 LTS, Orca 50.3, AT-SPI2 2.60.4, Chromium
153.0.8010.12 and Node 24.22.1, with Speech Dispatcher/eSpeak-NG. Orca used
`gi.repository.Atspi`; absent `pyatspi` did not block execution.

The runner created a private Xvfb display, D-Bus session, temporary XDG
config/data/cache/state/runtime directories and Chromium profile. It refused
to replace another same-user Orca. Extracted X11 libraries applied only to
child processes. eSpeak synthesized to a private ALSA null device; the user
desktop, audio sink and settings were not changed. The version probe describes
the enclosing host as Wayland; the actual test used its own X11 display.

X11 supplied keys, Orca structural/table commands and browser zoom. Playwright
read state/geometry and captured response bodies. Orca's unmodified logger
supplied speech. The operator was automated and knew the interface.

The [final cleanup audit](../build/evidence/assistive-workshop-final/assistive-cleanup.json)
found no remaining test group/profile processes or temporary directory. Main's
server was preserved and returned HTTP 200. No further runs are required for
this frozen HTML snapshot. `ASSISTIVE_URL` remains supported; `--url` overrides
it, and `--probe` is mutually exclusive with `--workshop`.

## Fixes and preserved failure history

The original activity-feedback fix used one stable generic `div` with explicit
`aria-live="polite"` and `aria-atomic="true"`. A clear followed by a 150 ms write
made identical submissions observable. Feedback, answer state and completion
text are announced together; unchanged passive statuses are not rewritten.
Visible feedback/completion remain browsable text. The narrow index change set
`#progress-summary` to `aria-live="off"`, with publication announced explicitly.
Workshop preview/publication use focus instead of an additional live message.

The [original 18:33:32 smoke](../build/evidence/assistive-before-feedback-fix/assistive-run.json)
used `views.mjs` SHA-256
`5bb7e1eeafbda76addbcba6d80fcf5fb22bad192d3ccda8a40a50b774b13ef12`,
before the exact-count/near-rounding patch, and observed 8.038 seconds of silence.
The [red regression](../build/evidence/assistive-feedback-red/assistive-run.json)
on the updated view produced zero announcements in five cases. Installed Orca
mapped `role="status"` updates to UI_UPDATE; a generic polite `div` spoke.
A live paragraph alone still lost identical/closely timed messages, with the
100 ms spam filter visible in the log. This diagnosis is specific to the tested
stack. The [18:52 source pass](../build/evidence/assistive-source-fixed/assistive-run.json)
and [19:03 assembled pass](../build/evidence/assistive-assembled/assistive-run.json)
remain historical snapshots with their own hashes.

The [19:51:54 interrupted attempt](../build/evidence/assistive-workshop-harness-failure/assistive-run.json)
stopped after one passing feedback case: a diagnostic generic `.feedback`
locator also matched the hidden poster error. A one-line printing-scope
correction was made before refreezing the runner. The
[19:53:33 full run](../build/evidence/assistive-workshop-before-acknowledgement/assistive-run.json)
then completed but correctly exited 1 for the missing Inés acknowledgement.
The web owner added the paragraph; the final 20:04:30 run passed with the same
runner and unchanged assertions. Neither earlier result is relabelled.

Earlier address-bar focus, Escape/zoom interaction and blank CDP captures were
resolved using F6, native X-screen captures and scoped locators. Those harness
problems are distinct from the real feedback and acknowledgement gaps.

This owner changed the previously authorized narrow announcement wiring in
`web/app.mjs` and one status attribute in `web/index.html`, then the owned
runner, this review and `build/evidence/assistive-*`. The workshop implementation
and acknowledgement fix belong to the web owner. No workshop web edits, main
content edits, Godot edits, global acceptance edits, commits or releases were
performed by this owner.

Method references: GNOME's
[structural navigation](https://help.gnome.org/orca/commands_structural_navigation.html)
and [live-region support](https://help.gnome.org/orca/howto_live_regions.html),
installed Orca source and actual event/speech logs.
