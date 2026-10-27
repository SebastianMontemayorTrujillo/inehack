# Interface polish · 27 October 2026

The user requested continued UI improvement after approving WASD-only movement and the authored poster. This revision improves the Godot interface within the existing play-session contract. References are the project's original town art, Atkinson typography and the finished paper poster; no external visual assets are needed.

## Design contract

- Exploration answers three questions: where am I, what comes next, and which control can I use? A bounded header separates the wordmark, three noninteractive progress indicators, and location/objective. Progress indicators never move the player.
- The footer groups diary/settings, one nearby interaction and compact keyboard guidance. Keep a predictable position and clear enabled/disabled state.
- Paper dialogs dim the world and contain Tab/Shift+Tab focus. World controls cannot receive clicks or activation behind a panel. Escape closes it, restoring usable controls without moving the player.
- Use the existing cream, ink, teal and ochre palette; restrained borders, six-pixel corners, Atkinson regular/bold, and a visible three-pixel focus outline. Emphasize continuation actions while keeping all answers and fictional consultation choices equally presented.
- Enlarged text must fit horizontally at 1280 × 800; content can scroll vertically. Preserve exact-data/source access, the finished poster layout and existing simple Spanish content.
- Preserve physical WASD entrances/exits, nearby E/Enter interactions, privacy, reset, optional poster memory and independent semantic HTML navigation.

## Acceptance

The initial regressions reproduced Tab/Shift+Tab escaping a settings panel and activating underlying controls. The enlarged completed-hall HUD fit in that baseline check; no reproduced overflow is claimed. Retain that geometry check while improving hierarchy. Inspect real exports at normal/enlarged text, including welcome, world, questions, settings, source and final poster. Run applicable suites and input-driven journeys with strict runtime-error checks. Record actual revised source/output identities before updating the local package; previous evidence remains dated.

Official Godot references: [Control focus and input](https://docs.godotengine.org/en/stable/classes/class_control.html#class-control-property-focus-behavior-recursive), [keyboard navigation](https://docs.godotengine.org/en/stable/tutorials/ui/gui_navigation.html), and [shared themes](https://docs.godotengine.org/en/stable/classes/class_theme.html).

## Observed checks

The six new interface tests dispatch keyboard and mouse events through an isolated 1280 × 800 viewport. They cover enlarged HUD geometry, Tab and Shift+Tab wraparound, underlying button activation, mouse/J blocking and restoration of controls/WASD after closing. The initial focus regressions failed before the change; the final focused suite passes 6/6 with 208 assertions. The full suite passes 42/42 with 1,418 assertions and zero orphans; Python 30 and Node 33 also pass. `python3 tools/verify.py --browser` records 74 source identities and 32 exported files.

Main inspected the compiled-pack welcome, world, question, normal/enlarged settings, completed-hall HUD and poster previews, then the actual Linux ending, source and enlarged settings captures. Text fits horizontally and longer source/large-poster content scrolls vertically. Primary focus uses ochre against dark ink (6.67:1); ordinary focus uses red against cream (5.27:1). These are sampled design checks, not accessibility certification. A separate read-only code/visual review found no blocking regressions.

The actual release Linux journey passed in 328.061 seconds with 90 movement checks, 31 poster checks and zero runtime errors. The browser oracle's preflight accepted 14 matching states and rejected 14 deliberately wrong states. The final full canvas journey passed in 494.282 seconds with 90 movement checks, 86 captures and zero browser/page/request errors or native-reference mismatches. Main inspected its normal/enlarged poster, source and scrolled footer. Two earlier process interruptions remain recorded in [verification](verification.md); their results were not counted as passes. The current media and clean-package identities are recorded there as well.
