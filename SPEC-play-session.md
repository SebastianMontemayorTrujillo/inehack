# SPEC: play-session

**Interface amendment · 27 October 2026:** Show bounded location/objective text and three noninteractive progress indicators. Open paper panels dim the world and contain keyboard/mouse interaction; closing restores a usable world control without changing location. Keep controls and content readable at enlarged text, with equal presentation of answer and consultation choices. See `docs/interface_polish.md` and RV17.

**Movement amendment · 26 October 2026:** At the user's request, WASD is the only world movement. Walk into a doorway to enter a house and down through its exit to return. House buttons, remote exit, Escape travel, prerequisite travel and poster-publication travel are removed. E/Enter and the interaction button act only on nearby people/exhibits. Escape closes panels; arrow keys still operate interface controls. Reset starts a new run in the plaza. The independent semantic HTML route retains normal document navigation.

Version 4 · 27 October 2026 · Owner: main, game/integration.
Implementation and current verification evidence are recorded in [verification](docs/verification.md). Run the applicable suites and exported journeys after changes; previous results do not certify a changed artifact. Formal user evaluation remains distinct from automated checks.

## Objective and scope

Provide the Godot adventure shell for high-school and adult beginners: one compact Villa Brisa town, three speaking characters, a plaza/archive/noticeboard route, readable dialogue, settings, local progress, and safe reset. Target a complete 10–15 minute experience with both evidence quests and the synthetic consultation supplied by their owners. No combat, farming economy, multiplayer, account, live API, runtime AI, or locations beyond the plaza and three houses.

## Structure, stack, and commands

Godot project under `game/`; typed GDScript, Compatibility rendering and single-threaded web output. Godot 4.7.2 and matching templates are installed with official SHA-512 verification; GUT 9.7.1 is installed. Original-set web/Linux exports and web/Linux-headless boot passed. Scenes/scripts belong to main; original art resolves through asset-owner role IDs. Shared narrative input is `game/content/story.json`.

```sh
python3 tools/bootstrap.py
./tools/godot --editor --path game
python3 tools/export_game.py --target web --asset-set development
python3 tools/export_game.py --target linux --asset-set development
python3 -m unittest discover -s tests
```

The wrapper/export CLI are implemented. Outputs are `build/web/game/index.html` and `build/linux/voces-de-la-plaza.x86_64` with PCK; the web command also assembles HTML/content. Export success and headless boot do not complete the manual controls checklist.

## Provider contract and style

Expose actions for entering/leaving an interaction, opening sources/exhibit, updating approved progress, and applying settings. Quests supply content and transitions; the shell must not determine valid data answers. Prefer small scenes, explicit state names, signals at boundaries, one owner per active panel, and authored dialogue IDs rather than hard-coded copies of content.

Save allowlist: schema/content version, completed quest IDs and exhibit references, current safe checkpoint, text size, mute, reduced motion, optional anonymous local assessment summaries. Exclude ballot choice, option-linked outcomes, identities, and political/demographic profiles. Do not save an arbitrary state object. Persist the consultation completion flag and neutral follow-up prompt only; keep its result in memory.

State example: `explore → dialogue → evidence_panel → explore`. Closing a panel restores focus to its trigger; saving an interrupted interaction resumes at a safe checkpoint instead of partially applying rewards. Repeated completion is idempotent. Corrupt/incompatible storage offers an explained reset. Storage failure allows the current session to continue with a visible persistence warning.

## Acceptance and verification

- PLAY-01: A fresh player walks with physical WASD keys, crosses all three doorways in both directions, meets nearby characters, opens the notebook and returns without a soft lock. Arrow keys, Escape, mouse controls, prerequisite messages and poster publication cannot move the avatar or change rooms. Walking pauses while a panel is open. No required dragging, rapid reaction, or timer.
- PLAY-02: Enlarged text, visible focus, mute, reduced motion, and readable contrast preserve every essential interaction. Sound activation failure has no gameplay penalty. Controls and instructions are in Mexican Spanish.
- PLAY-03: Resume/reset, corrupt save, incompatible version, interrupted feedback, repeated clicks, and unavailable storage behave safely. Inspection of saved data reveals no ballot choice or reconstructable option-linked result.
- PLAY-04: Main records actual engine/template versions, browser and Linux environment, command outcomes, and a full exported walkthrough. Development-assets runs do not satisfy final originality acceptance.

Tests: Python content/save-contract tests where applicable, actual Godot scene/load and exported runtime checks, manual keyboard/focus/text-size traversal. A Python pass alone does not verify Godot navigation. Native Linux is the confirmed offline fallback; browser compatibility and storage behavior require actual checks.

## Boundaries

Always preserve safe checkpoints and original role-ID resolution; consult [architecture](docs/architecture.md). Changes to scripts/scenes are already authorized for main. Seek a decision only for material scope expansion or external release. Never label an unrun export, canvas screen-reader support, or platform compatibility as tested. The semantic HTML route is independently usable; its screen-reader evidence belongs to `accessible-story`.
