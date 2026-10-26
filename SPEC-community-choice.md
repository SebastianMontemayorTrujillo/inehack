# SPEC: community-choice

**Classroom amendment · 25 October 2026:** The consultation takes place in Inés’s enterable meeting house. Its preview is always accessible; the two evidence artifacts unlock decision practice. All five actions share the ending. Projects, roster and scenarios come from canonical content; choice and option-linked results remain memory-only. See [design](docs/classroom_redesign.md), [tasks](tasks/todo.md#classroom-revision) and [current evidence](docs/verification.md).

Version 2 · 25 October 2026 · Owner: main, consultation rules/content.
Implementation and current verification evidence are recorded in [verification](docs/verification.md). Run the applicable suites and exported journeys after changes; previous results do not certify a changed artifact. Formal user evaluation remains distinct from automated checks.
Depends on `play-session` and `evidence-quests`; provides content and rules for `accessible-story`.

## Objective and scope

Connect the completed exhibit to plural needs and continued democratic involvement through one short fictional consultation. Present three equally framed projects, a finite first-stage budget and maintenance tradeoffs, private choice, aggregate results, and a neutral follow-up question. Any option, unmarked ballot, or declining must reach the ending with the same learning rewards. This authored exercise is not Mexican election procedure.

## Structure, commands, and style

Own the synthetic consultation section of `game/content/story.json` and its Godot evaluator under `game/`. Never embed these values in `ccpc.json` or derive preferences from historical geography/age/sex averages. Tests belong to `tests/` and are shared with the web owner.

```sh
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
./tools/godot --editor --path game
```

Implementation and current verification evidence are recorded in [verification](docs/verification.md). Run the applicable suites and exported journeys after changes; previous results do not certify a changed artifact. Formal user evaluation remains distinct from automated checks.

## Provider contract

| Synthetic scenario | NPC A / B / C | NPC participants |
| --- | --- | ---: |
| Baseline | 8 / 5 / 3 | 16 |
| More participation, A leads | 11 / 8 / 6 | 25 |
| More participation, B leads | 8 / 10 / 7 | 25 |

These are subsets of the same invented 30-person roster with fixed underlying preferences A12/B10/C8. The player is a separate 31st eligible fictional participant. Before acting, show the selected scenario and rule; never select a pivotal case based on the player's action.

Input: scenario ID and ephemeral action `A`, `B`, `C`, `unmarked`, or `decline`. An option increases its count and total participants by exactly one. An unmarked ballot increases only participants; declining changes neither. Output in memory: option counts, participant count, unmarked count, winning option or explicit tie, explanation, and follow-up prompts. All example results are labelled “Escenario ficticio”. Display “Consulta ficticia. No reproduce todos los procedimientos de una elección constitucional.”

No choice or option-linked outcome is saved, logged, placed in a URL, or sent. Saving consultation completion and a neutral follow-up prompt is sufficient. On resume after completion, use a neutral summary without reconstructing a prior result. Both routes offer the same options and rules; a cross-route progress migration is outside scope.

## Acceptance and tests

- CHOICE-01: All three scenarios crossed with all five actions give exact deterministic totals. Test a losing vote and show that it still contributes to the count. Two 25-participant scenarios have different winners, so turnout alone cannot determine the result.
- CHOICE-02: A separate **synthetic tie-test fixture** reaches an explicit fictional second-decision state; no automatic option-A preference. It need not create a fourth playable chapter.
- CHOICE-03: All actions allow the same ending/reward. Neutral follow-up questions include budget use, implementation, and needs left pending. No option is portrayed as morally preferred; nonwinning needs remain legitimate.
- CHOICE-04: Godot and HTML results agree on shared fixtures. Inspect storage, URLs, and network behavior for absence of ballot choice and option-linked results; verify keyboard completion and reset.

Always distinguish invented counts from CCPC observations and keep the result ephemeral. Implementation within this contract is approved. Ask only for scope changes such as a real poll or external collection; never add those implicitly. Do not claim the consultation predicts real results or that voting guarantees improved services.
