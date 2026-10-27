"""Exercise the exported Linux window with real keyboard/mouse input on an isolated X display."""
import hashlib
import io
from collections import Counter
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'build/evidence'
X11 = ROOT / '.tools/x11/root/usr'
BODY = (184, 264, 1080, 664)
POSTER = (124, 210, 1140, 650)
WORLD = (40, 156, 1240, 676)
HOUSE = (116, 248, 800, 294)
# CharacterBody2D velocity is global pixels/s; its parent world is scaled 2.5.
SPEED = 65 / 2.5
SETTINGS = (205, 711)


def poster_bounds(image):
    """Find the complete paper border, independent of toolbar height/reflow."""
    ink, paper = (23, 59, 57), (255, 248, 231)
    pixels = image.load()
    for top in range(160, 350):
        if pixels[124, top] != ink or pixels[127, top] != ink or pixels[127, top + 3] != paper:
            continue
        right = next((x for x in range(124, 1170) if pixels[x, top] != ink), None)
        if right is None or right - 124 < 950:
            continue
        bottom = next((y for y in range(top + 350, 738)
                       if pixels[127, y] == ink and pixels[127, y + 2] == (246, 240, 218)), None)
        if bottom is not None:
            return (124, top, right, bottom + 2)
    return None  # Enlarged paper can require scrolling; do not invent hidden pixels.


def avatar_position(image):
    """Read the original player's shadow and teal shirt, never engine state.

    All four idle frames share this 20×5 shadow at the fixed 2.5 world scale.
    The shirt sample excludes the three NPC shadows. Ambiguity fails closed.
    Call only after key release, when no panel obscures the world.
    """
    pixels = image.load()
    shadow, shirt = (120, 144, 128), (54, 124, 131)
    matches = []
    for y in range(WORLD[1] + 20, WORLD[3] - 5):
        for x in range(WORLD[0] + 1, WORLD[2] - 20):
            if (pixels[x, y] == shadow and pixels[x - 1, y] != shadow
                    and pixels[x, y - 1] != shadow and pixels[x + 19, y + 4] == shadow
                    and pixels[x + 10, y - 10] == shirt):
                matches.append([round((x + 10 - 40) / 2.5, 2), round((y - 7.5 - 156) / 2.5, 2)])
    assert len(matches) == 1, f'Expected one unobscured original player, found {matches}'
    return matches[0]


def focus_bounds(image):
    # Full edges of the actual #9b4d2d focus outline must be visible. The new
    # poster toolbar has narrow buttons; its red paper rules are not focus.
    spacious = image.getpixel((110, 120)) == (246, 240, 218)
    if not spacious:
        rows = [y for y in range(160, 667) if sum(image.getpixel((x, y)) == (155, 77, 45)
                                                for x in range(184, 1088)) > 700]
        assert rows and rows[-1] - rows[0] >= 32, 'Focused control is clipped or outside the scroll viewport'
        return [rows[0], rows[-1]]
    pixels = image.load()
    points = {(x, y) for y in range(60, 740) for x in range(124, 1156) if pixels[x, y] == (155, 77, 45)}
    outlines = []
    while points:
        pending = [points.pop()]
        component = []
        while pending:
            x, y = pending.pop()
            component.append((x, y))
            for neighbour in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                if neighbour in points:
                    points.remove(neighbour)
                    pending.append(neighbour)
        columns, rows = Counter(x for x, _ in component), Counter(y for _, y in component)
        width, height = max(columns) - min(columns) + 1, max(rows) - min(rows) + 1
        if width < 120 or not 32 <= height <= 160:
            continue
        horizontal = [y for y, count in rows.items() if count >= width * .7]
        vertical = [x for x, count in columns.items() if count >= height * .5]
        if horizontal and vertical and max(horizontal) - min(horizontal) >= height - 12 and max(vertical) - min(vertical) >= width - 12:
            outlines.append([min(rows), max(rows)])
    assert len(outlines) == 1, f'Expected one fully visible focused poster button, found {outlines}'
    return outlines[0]


def runtime_errors(path):
    return [line for line in path.read_text().splitlines() if line.lstrip().startswith(('ERROR:', 'SCRIPT ERROR:'))]


def main():
    started = time.monotonic()
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    run_dir = Path(tempfile.mkdtemp(prefix='voces-native-window-'))
    display = next(f':{n}' for n in range(90, 120) if not Path(f'/tmp/.X11-unix/X{n}').exists())
    env = dict(os.environ, DISPLAY=display,
               XDG_DATA_HOME=str(run_dir/'data'), XDG_CONFIG_HOME=str(run_dir/'config'),
               XDG_CACHE_HOME=str(run_dir/'cache'),
               LD_LIBRARY_PATH=str(X11/'lib/x86_64-linux-gnu'))
    server = subprocess.Popen([str(X11/'bin/Xvfb'), display, '-screen', '0', '1280x800x24', '-nolisten', 'tcp', '-ac'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    game = None
    log = (EVIDENCE/'native-window.log').open('w')
    phases = []
    poster_checks = []
    movement_checks = []
    executable = ROOT/'build/linux/voces-de-la-plaza.x86_64'
    sources = sorted((ROOT/'game/scripts').glob('*.gd')) + [ROOT/'game/project.godot', ROOT/'game/content/story.json', ROOT/'game/content/ccpc.json']
    source_hashes = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sources}
    tested_files = [executable, executable.with_suffix('.pck'), Path(__file__).resolve(), *sources]
    fingerprints = {str(path): hashlib.sha256(path.read_bytes()).hexdigest() for path in tested_files}

    def tool(*args):
        return subprocess.run([str(X11/'bin/xdotool'), *args], env=env, check=True, capture_output=True, text=True).stdout.strip()

    def key(name):
        tool('key', name)
        time.sleep(.2)

    def click(x, y):
        tool('mousemove', str(x), str(y), 'click', '1')
        time.sleep(.25)

    def choose(tabs=1):
        for _ in range(tabs):
            key('Tab')
        key('Return')

    def screen():
        raw = subprocess.run(['import', '-display', display, '-window', 'root', 'png:-'],
                             check=True, env=env, capture_output=True).stdout
        return Image.open(io.BytesIO(raw)).convert('RGB')

    def hold(name, seconds):
        tool('keydown', name)
        try:
            time.sleep(seconds)
        finally:
            tool('keyup', name)
        time.sleep(.12)  # Read an idle frame, not the transient walking bob.

    def walk_to(x=None, y=None):
        start = avatar_position(screen())
        # Axis-aligned paths avoid the central prop and lower-wall collisions.
        for axis, target in enumerate([x, y]):
            if target is None:
                continue
            for _ in range(24):
                position = avatar_position(screen())
                delta = target - position[axis]
                if abs(delta) <= 2:
                    break
                direction = ('d' if delta > 0 else 'a') if axis == 0 else ('s' if delta > 0 else 'w')
                hold(direction, min(1.8, max(.025, abs(delta) / SPEED)))
            else:
                raise AssertionError(f'WASD did not reach axis {axis}={target}: {position}')
        end = avatar_position(screen())
        movement_checks.append({'check': 'physical WASD path', 'from': start, 'to': end, 'target': [x, y]})

    def stationary(name, before, after):
        start, end = avatar_position(before), avatar_position(after)
        assert max(abs(a - b) for a, b in zip(start, end)) <= .4, (name, start, end)
        assert before.getpixel((50, 160)) == after.getpixel((50, 160)), f'{name}: room changed'
        assert ImageChops.difference(before.crop(HOUSE), after.crop(HOUSE)).getbbox() is None, f'{name}: house changed'
        movement_checks.append({'check': name, 'before': start, 'after': end})

    def enter_house(index):
        assert screen().getpixel((50, 160)) == plaza_pixel, 'Entry starts outside'
        walk_to(y=140)
        walk_to(x=80 + index * 160)
        for _ in range(16):
            hold('w', .1)
            if screen().getpixel((50, 160)) != plaza_pixel:
                break
        else:
            raise AssertionError(f'Walking W into house {index + 1} did not enter automatically')
        position = avatar_position(screen())
        assert abs(position[0] - 240) <= 2 and 140 <= position[1] <= 156, ('Interior spawn', position)
        walk_to(x=240, y=155)
        movement_checks.append({'check': 'automatic W door entry', 'house': index + 1, 'spawn': position})

    def leave_house(index):
        assert screen().getpixel((50, 160)) != plaza_pixel, 'Exit starts inside'
        walk_to(y=155)
        walk_to(x=240)
        for _ in range(16):
            hold('s', .1)
            if screen().getpixel((50, 160)) == plaza_pixel:
                break
        else:
            raise AssertionError(f'Walking S through house {index + 1} exit did not leave automatically')
        position = avatar_position(screen())
        assert abs(position[0] - (80 + index * 160)) <= 2 and 119 <= position[1] <= 135, ('Outside spawn', position)
        movement_checks.append({'check': 'automatic S exit', 'house': index + 1, 'spawn': position})

    def approach_host():
        walk_to(x=175, y=130)

    def open_settings():
        click(*SETTINGS)

    def capture(name, changed_title_from=None):
        log.write(f'CHECKPOINT {name}\n'); log.flush()
        picture = screen()
        if changed_title_from is not None:
            # X11 may still display the previous dialog after the key is sent.
            # Observe the new panel title instead of publishing that stale frame
            # as the browser's reference. Do not change comparison tolerances.
            title = (180, 160, 1080, 205)
            previous = changed_title_from.crop(title).tobytes()
            deadline = time.monotonic() + 8
            while picture.crop(title).tobytes() == previous:
                assert time.monotonic() < deadline, f'{name}: panel title did not change'
                time.sleep(.05)
                picture = screen()
            poster_checks.append({'check': name + ' displays the new panel title'})
        picture.save(EVIDENCE/f'native-{name}.png')
        return picture

    def compare(name, before, after, changed=False, crop=BODY):
        regions = [poster_bounds(item) for item in (before, after)] if crop == POSTER else [crop, crop]
        assert all(regions), f'{name}: the complete poster paper must be visible'
        images = [item.crop(region) for item, region in zip((before, after), regions)]
        if not changed:
            assert images[0].size == images[1].size, (name, [item.size for item in images])
        difference = ImageChops.difference(*images).convert('L')
        changed_pixels = sum(difference.histogram()[13:])
        assert changed_pixels > 100 if changed else changed_pixels == 0, (name, changed_pixels)
        if not changed:
            assert ImageChops.difference(*images).getbbox() is None, f'{name}: paper pixels differ after border alignment'
        poster_checks.append({'check': name, 'crop': crop, 'actual_regions': regions, 'changed_pixels': changed_pixels})

    def focused(name):
        picture = capture(name)
        poster_checks.append({'check': name, 'visible_focus_rows': focus_bounds(picture)})
        return picture

    def option(index, current=0):
        # PopupMenu does not implement Home. Move from the known selection with
        # real arrows, including scrolling through the 32-state popup.
        key('Return')
        for _ in range(abs(index - current)):
            key('Down' if index > current else 'Up')
        key('Return')

    def progress():
        files = list((run_dir/'data').rglob('voces_progress_v1.json'))
        return json.loads(files[0].read_text()) if files else {}

    def private_progress(completed):
        saved = progress()
        assert saved.get('completed') == completed, saved
        assert set(saved) == {'schema_version', 'completed', 'hints', 'settings'}, saved
        assert saved['schema_version'] == 1 and saved['hints'] == [], saved
        assert set(saved['settings']) == {'large_text', 'muted', 'reduced_motion'}, saved
        return saved

    def workshop():
        key('Escape')
        archive_before = capture('poster-archive-before')
        click(140, 765)
        intro = capture('poster-intro', changed_title_from=archive_before)
        choose(2)  # Archive intro: begin, then the appended workshop.
        capture('poster-defaults', changed_title_from=intro)
        key('Tab'); key('Tab'); option(0, 1)  # Duplicate pair must stay in the editor.
        choose(3)
        focused('poster-duplicate-error')  # Error returns visible focus to the first selector.
        key('Tab'); option(1)  # Repair the second state, then reach Ver mi cartel.
        choose(3)
        default = capture('poster-count')
        key('Tab'); focused('poster-count-details')
        key('Return')  # Cambiar mi cartel.
        key('Tab'); option(18)  # state_19 = NUEVO LEON in original record order.
        focused('poster-first')
        key('Tab'); option(1, 1)  # state_02, explicitly use the second control too.
        key('Tab'); option(1)  # count -> rate.
        focused('poster-metric')
        key('Tab'); option(1)  # missing -> voices, a neutral conversation prompt.
        focused('poster-question')
        choose()
        revised = capture('poster-rate')
        capture('poster-preview')  # Stable slide input: a new capture of the actual 19/02 rate preview.
        compare('Composition changes the rendered poster', default, revised, changed=True, crop=POSTER)
        key('Tab'); focused('poster-rate-details')
        before_source = screen()
        key('Tab'); choose()  # Datos exactos y fuente del cartel; do not open the external portal.
        capture('poster-source', changed_title_from=before_source)
        key('Tab'); focused('poster-source-details')
        choose()  # Volver a mi cartel.
        choose(2)  # Guardar mi cartel opens the published preview in the archive.
        published = capture('poster-saved')
        compare('Publication preserves preview content', revised, published, crop=POSTER)
        private_progress(['printing', 'comparison'])
        key('Escape')
        stationary('Saving the poster stays at the same archive position', archive_before, capture('poster-saved-room'))
        walk_to(x=283, y=130)  # Approach the physical archive artifact.
        key('Return')
        compare('Nearby artifact reopens the saved poster', published, capture('poster-published'), crop=POSTER)
        choose()  # Cambiar mi cartel.
        key('Tab'); option(0, 18)
        key('Tab'); option(2, 1)
        key('Tab'); option(0, 1)
        key('Tab'); option(2, 1)
        choose()
        draft = capture('poster-unpublished-draft')
        compare('A revised unpublished draft differs', published, draft, changed=True, crop=POSTER)
        choose(); choose(6)  # Return to editing; Cancelar y conservar mi publicación.
        compare('Published headline appears in the archive scene', archive_before, capture('poster-cancelled-room'),
                changed=True, crop=(132, 536, 1080, 596))
        key('e')
        compare('Cancel keeps the previous publication', published, capture('poster-after-cancel'), crop=POSTER)
        key('Escape'); key('j'); choose(2)
        compare('Journal reopens the same publication', published, capture('poster-from-journal'), crop=POSTER)
        private_progress(['printing', 'comparison'])
        key('Escape')
        phases.append('poster composition, sourced preview, revision, save in place, nearby artifact/journal re-entry and cancelled draft through real controls')

    try:
        time.sleep(.5)
        game = subprocess.Popen([str(executable), '--display-driver', 'x11', '--resolution', '1280x800', '--position', '0,0', '--audio-driver', 'Dummy'], cwd=ROOT, env=env, stdout=log, stderr=log)
        for _ in range(40):
            try:
                window = tool('search', '--name', '^Voces de la Plaza$').splitlines()[0]
                break
            except (subprocess.CalledProcessError, IndexError):
                time.sleep(.2)
        else:
            raise AssertionError('Native window did not open')
        tool('windowfocus', window)
        time.sleep(1)
        key('Escape')
        plaza = capture('plaza')
        plaza_pixel = plaza.getpixel((50, 160))
        assert max(abs(a - b) for a, b in zip(avatar_position(plaza), [240, 176])) <= .4
        for direction in ['Left', 'Right', 'Up', 'Down']:
            before = screen()
            hold(direction, .3)
            stationary(f'{direction} arrow is UI only', before, capture(f'no-move-{direction.lower()}'))
        for name in ['e', 'Return']:
            before = screen()
            key(name)
            stationary(f'{name} without a nearby host/artifact does nothing', before, screen())
        click(140, 765)
        stationary('Distant action button is disabled', plaza, screen())
        for index, point in enumerate([(110, 711), (250, 711), (390, 711), (470, 765)]):
            before = screen()
            click(*point)
            key('Escape')  # Old house coordinates may now open Diario/Ajustes, never travel.
            stationary(f'Old travel control {point} cannot move the player', before, capture(f'no-teleport-{index}'))
        key('j'); empty_journal = capture('journal-empty')
        key('Tab'); key('Tab'); empty_journal_end = capture('journal-empty-end')
        key('Escape')
        enter_house(0)
        capture('door-entry')
        assert Image.open(EVIDENCE/'native-door-entry.png').convert('RGB').getpixel((50, 160)) != plaza_pixel, 'Physical door did not enter the interior'
        before = screen()
        key('Escape')
        stationary('Escape cannot leave a house', before, capture('no-escape-exit'))
        for action in ['e', 'Return']:
            key(action)
            stationary(f'{action} cannot interact from interior spawn', before, screen())
        click(470, 765)
        stationary('Removed global exit cannot leave a house', before, screen())
        leave_house(0)
        capture('door-return')
        assert Image.open(EVIDENCE/'native-door-return.png').convert('RGB').getpixel((50, 160)) == plaza_pixel, 'Physical exit did not return to plaza'
        for index in range(3):
            enter_house(index)
            capture(f'house-{index+1}')
            before = screen()
            for point in [(110, 711), (250, 711), (390, 711), (470, 765)]:
                click(*point); key('Escape')
                stationary(f'Old control {point} cannot leave house {index + 1}', before, screen())
            if index > 0:
                approach_host()
                before = screen()
                key('e'); capture(f'house-{index + 1}-prerequisite')
                choose(index)  # Seguir explorando; meeting's project preview is optional.
                key('Escape')
                stationary(f'House {index + 1} prerequisite gives directions without travel', before, capture(f'house-{index + 1}-prerequisite-closed'))
                assert progress().get('completed', []) == []
            leave_house(index)
        phases.append('WASD-only traversal of all three houses before learning; automatic upward entry/downward exit; arrows, Escape, removed controls and prerequisites never teleport')
        for chapter, answers in enumerate([[1, 1, 1], [2, 1, 1]]):
            enter_house(chapter)
            approach_host()
            if chapter == 0:
                key('e')
            else:
                click(140, 765)
            choose()  # Begin from introduction.
            for step, answer in enumerate(answers):
                capture(f'quest-{chapter+1}-{step+1}')
                choose(answer)
                if step < 2:
                    choose()  # Continue after explanation.
            saved = progress()
            assert saved.get('completed') == ['printing', 'comparison'][:chapter+1], saved
            if chapter == 1:
                workshop()
            else:
                key('Escape')
            capture(f'house-{chapter+1}-complete')
            leave_house(chapter)
        phases.append('both evidence quests completed through window controls')
        enter_house(2)
        approach_host()
        key('e')
        capture('consultation-intro')
        capture('poster-carried-intro')
        key('Tab'); key('Tab'); capture('consultation-poster')
        focused('poster-carried-acknowledgment')
        key('shift+Tab'); key('Return')  # Begin; the appended poster button remains optional.
        capture('consultation-options')
        choose(4)  # Unmarked fictional ballot, same ending.
        capture('consultation-result')
        choose(2)  # First follow-up after optional scenario exploration.
        capture('ending')
        private_progress(['printing', 'comparison', 'consultation'])
        key('Escape')
        open_settings()
        for _ in range(3):
            key('Tab'); key('space')
        capture('settings-large')
        saved = progress()
        assert all(saved['settings'].values()), saved
        key('Escape')
        capture('house-large')
        phases.append('ending, private save, enlarged text, mute and reduced motion')
        leave_house(2); enter_house(1); approach_host()
        click(140, 765); choose(2)
        for control in ['first', 'second', 'metric', 'question']:
            key('Tab'); focused(f'poster-large-{control}')
        for control in ['metric', 'second', 'first']:
            key('shift+Tab'); focused(f'poster-large-back-{control}')
        key('Tab'); option(0, 2); choose(3)
        focused('poster-large-duplicate-error')
        choose(5)  # Cancel from the first selector, retaining the publication.
        phases.append('Tab and Shift+Tab keep every enlarged workshop selector visibly focused')
        key('j'); choose(2)
        capture('poster-large-preview')
        key('Tab'); focused('poster-large-preview-edit')
        before_source = screen()
        choose()  # Published toolbar: next control is its exact-data source.
        capture('poster-large-source', changed_title_from=before_source)
        key('Tab'); focused('poster-large-source-details')
        choose()
        tool('mousemove', '1000', '620', 'click', '--repeat', '24', '--delay', '30', '5')
        time.sleep(.25)
        capture('poster-large-preview-footer')
        key('Escape')
        phases.append('enlarged published poster preview, toolbar focus, source and scrolled paper footer captured')
        open_settings()
        for _ in range(3):
            key('Tab'); key('space')  # Restore baseline text/settings before comparing reset pixels.
        choose(); choose()  # Reset, then confirm.
        key('Escape')
        assert capture('reset-plaza').getpixel((50, 160)) == plaza_pixel, 'Reset did not return to the plaza'
        saved = private_progress([])
        assert not any(saved['settings'].values()), saved
        key('j')
        compare('Reset clears published poster and progress in journal', empty_journal, capture('journal-reset'))
        key('Tab'); key('Tab')
        compare('Reset journal footer matches the fresh session', empty_journal_end, capture('journal-reset-end'))
        phases.append('confirmed reset removes the session poster and restores the fresh journal without a stored ballot or poster')
        assert all(hashlib.sha256(path.read_bytes()).hexdigest() == fingerprints[str(path)] for path in tested_files), 'Runtime/test changed during native journey'
        errors = runtime_errors(EVIDENCE/'native-window.log')
        assert not errors, f'Native runtime logged {len(errors)} errors: {errors[0]}'
        report = {'status':'passed', 'environment':'Linux X11/Xvfb, actual release executable, xdotool keyboard/mouse', 'phases':phases,
                  'elapsed_seconds':round(time.monotonic() - started, 3), 'source_sha256':source_hashes,
                  'binary_sha256':fingerprints[str(executable)], 'pack_sha256':fingerprints[str(executable.with_suffix('.pck'))],
                  'test_sha256':fingerprints[str(Path(__file__).resolve())],
                  'poster_checks':poster_checks,
                  'movement_checks':movement_checks,
                  'runtime_errors':errors,
                  'poster_input':{'first':'state_19','second':'state_02','metric':'rate','question':'voices'},
                  'limits':['Automated operator, not a participant pilot', 'Screenshots require visual review; not formal accessibility certification']}
        (EVIDENCE/'native-window.json').write_text(json.dumps(report, indent=2)+'\n')
        print('Native window journey passed: WASD-only movement, automatic doors/exits, no teleport, six questions, poster saved in place, Inés reached on foot, ending, settings, private save and reset.')
    except Exception as error:
        try:
            capture('failure')
        except subprocess.CalledProcessError:
            pass
        (EVIDENCE/'native-window.json').write_text(json.dumps({'status':'failed', 'error':str(error),
            'elapsed_seconds':round(time.monotonic() - started, 3), 'source_sha256':source_hashes,
            'tested_files':fingerprints, 'phases':phases, 'poster_checks':poster_checks, 'movement_checks':movement_checks,
            'runtime_errors':runtime_errors(EVIDENCE/'native-window.log')}, indent=2)+'\n')
        raise
    finally:
        if game is not None:
            game.terminate()
            game.wait(timeout=10)
        server.terminate()
        server.wait(timeout=10)
        log.close()


if __name__ == '__main__':
    main()
