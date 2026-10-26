"""Exercise the exported Linux window with real keyboard/mouse input on an isolated X display."""
import hashlib
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


def focus_bounds(image):
    # Full horizontal edges of the actual #9b4d2d focus outline must be visible.
    rows = [y for y in range(160, 667) if sum(image.getpixel((x, y)) == (155, 77, 45)
                                            for x in range(184, 1088)) > 700]
    assert rows and rows[-1] - rows[0] >= 32, 'Focused control is clipped or outside the scroll viewport'
    return [rows[0], rows[-1]]


def runtime_errors(path):
    return [line for line in path.read_text().splitlines() if line.lstrip().startswith(('ERROR:', 'SCRIPT ERROR:'))]


def main():
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
    executable = ROOT/'build/linux/voces-de-la-plaza.x86_64'
    tested_files = [executable, executable.with_suffix('.pck'), Path(__file__).resolve()]
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

    def capture(name):
        log.write(f'CHECKPOINT {name}\n'); log.flush()
        subprocess.run(['import', '-display', display, '-window', 'root', str(EVIDENCE/f'native-{name}.png')], check=True, env=env)
        return Image.open(EVIDENCE/f'native-{name}.png').convert('RGB')

    def compare(name, before, after, changed=False, crop=BODY):
        difference = ImageChops.difference(before.crop(crop), after.crop(crop)).convert('L')
        changed_pixels = sum(difference.histogram()[13:])
        assert changed_pixels > 100 if changed else changed_pixels == 0, (name, changed_pixels)
        poster_checks.append({'check': name, 'crop': crop, 'changed_pixels': changed_pixels})

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
        click(140, 765); choose(2)  # Archive intro: begin, then the appended workshop.
        capture('poster-defaults')
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
        compare('Composition changes the rendered poster', default, revised, changed=True)
        key('Tab'); focused('poster-rate-details')
        key('Tab'); choose()  # Datos exactos y fuente del cartel; do not open the external portal.
        capture('poster-source')
        key('Tab'); focused('poster-source-details')
        choose()  # Volver a mi cartel.
        choose(2)  # Llevar a la reunión publishes and opens Inés's introduction.
        capture('poster-carried-intro')
        key('Tab'); key('Tab'); capture('poster-carried-acknowledgment')
        private_progress(['printing', 'comparison'])
        key('Escape')
        click(250, 711); click(140, 765); choose(3)  # Re-enter the archive and open its published poster.
        published = capture('poster-published')
        compare('Publication preserves preview content', revised, published)
        choose()  # Cambiar mi cartel.
        key('Tab'); option(0, 18)
        key('Tab'); option(2, 1)
        key('Tab'); option(0, 1)
        key('Tab'); option(2, 1)
        choose()
        draft = capture('poster-unpublished-draft')
        compare('A revised unpublished draft differs', published, draft, changed=True)
        choose(); choose(6)  # Return to editing; Cancelar y conservar mi publicación.
        compare('Published headline appears in the archive scene', archive_before, capture('poster-cancelled-room'),
                changed=True, crop=(132, 536, 1080, 596))
        click(140, 765); choose(3)
        compare('Cancel keeps the previous publication', published, capture('poster-after-cancel'))
        key('Escape'); key('j'); choose(2)
        compare('Journal reopens the same publication', published, capture('poster-from-journal'))
        private_progress(['printing', 'comparison'])
        key('Escape')
        phases.append('poster composition, sourced preview, revision, publication, archive/journal re-entry and cancelled draft through real controls')

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
        capture('plaza')
        plaza_pixel = Image.open(EVIDENCE/'native-plaza.png').convert('RGB').getpixel((50, 160))
        key('j'); empty_journal = capture('journal-empty')
        key('Tab'); key('Tab'); empty_journal_end = capture('journal-empty-end')
        key('Escape')
        # Menu entry/exit provides a known exterior spawn; wall collision aligns
        # the physical approach without relying on software-rendering frame rate.
        click(110, 711)
        click(470, 765)
        tool('keydown', 'w'); time.sleep(3); tool('keyup', 'w')
        key('e')
        capture('door-entry')
        assert Image.open(EVIDENCE/'native-door-entry.png').convert('RGB').getpixel((50, 160)) != plaza_pixel, 'Physical door did not enter the interior'
        # The interior spawn is clear of its exit. Walk down before interacting.
        tool('keydown', 's'); time.sleep(3); tool('keyup', 's')
        key('e')
        capture('door-return')
        assert Image.open(EVIDENCE/'native-door-return.png').convert('RGB').getpixel((50, 160)) == plaza_pixel, 'Physical exit did not return to plaza'
        for index, x in enumerate([110, 250, 390]):
            click(x, 711)
            capture(f'house-{index+1}')
            click(470, 765)
        phases.append('three houses before learning tasks, physical door and exit, menu travel')
        for chapter, (x, answers) in enumerate([(110, [1, 1, 1]), (250, [2, 1, 1])]):
            click(x, 711)
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
        phases.append('both evidence quests completed through window controls')
        click(390, 711)
        click(140, 765)
        capture('consultation-intro')
        key('Tab'); key('Tab'); capture('consultation-poster')
        key('shift+Tab'); key('Return')  # Begin; the appended poster button remains optional.
        capture('consultation-options')
        choose(4)  # Unmarked fictional ballot, same ending.
        capture('consultation-result')
        choose(2)  # First follow-up after optional scenario exploration.
        capture('ending')
        private_progress(['printing', 'comparison', 'consultation'])
        key('Escape')
        click(640, 711)
        for _ in range(3):
            key('Tab'); key('space')
        capture('settings-large')
        saved = progress()
        assert all(saved['settings'].values()), saved
        key('Escape')
        capture('house-large')
        phases.append('ending, private save, enlarged text, mute and reduced motion')
        click(250, 711); click(140, 765); choose(2)
        for control in ['first', 'second', 'metric', 'question']:
            key('Tab'); focused(f'poster-large-{control}')
        for control in ['metric', 'second', 'first']:
            key('shift+Tab'); focused(f'poster-large-back-{control}')
        key('Tab'); option(0, 2); choose(3)
        focused('poster-large-duplicate-error')
        choose(5)  # Cancel from the first selector, retaining the publication.
        phases.append('Tab and Shift+Tab keep every enlarged workshop selector visibly focused')
        key('shift+Tab'); key('Return')  # From the action button to Settings, even with enlarged navigation.
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
                  'binary_sha256':fingerprints[str(executable)], 'pack_sha256':fingerprints[str(executable.with_suffix('.pck'))],
                  'test_sha256':fingerprints[str(Path(__file__).resolve())],
                  'poster_checks':poster_checks,
                  'runtime_errors':errors,
                  'poster_input':{'first':'state_19','second':'state_02','metric':'rate','question':'voices'},
                  'limits':['Automated operator, not a participant pilot', 'Screenshots require visual review; not formal accessibility certification']}
        (EVIDENCE/'native-window.json').write_text(json.dumps(report, indent=2)+'\n')
        print('Native window journey passed: doors, three interiors, six questions, poster composition/publication/cancellation, Inés, ending, settings, private save and reset.')
    except Exception as error:
        try:
            capture('failure')
        except subprocess.CalledProcessError:
            pass
        (EVIDENCE/'native-window.json').write_text(json.dumps({'status':'failed', 'error':str(error),
            'tested_files':fingerprints, 'phases':phases, 'poster_checks':poster_checks,
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
