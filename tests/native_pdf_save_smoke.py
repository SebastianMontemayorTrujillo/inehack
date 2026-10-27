"""Fresh exported Linux journey to two real native FileDialog saves.

Supplement to native_window_smoke.py: no seeded progress or engine calls.
All game state is reached with actual X11 keys; imported helpers only read pixels.
"""
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

from PIL import Image
from native_window_smoke import ROOT, EVIDENCE, X11, SPEED, avatar_position, dialogue_bounds, runtime_errors
from runtime_pdf_check import verify_pdf


def main():
    started = time.monotonic()
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    run_dir = Path(tempfile.mkdtemp(prefix='voces-native-pdf-'))
    # Keep the dialog destinations unique and inside ROOT for the shared PDF
    # inspector's relative paths. Prior canonical PDFs survive a failed run.
    save_dir = Path(tempfile.mkdtemp(prefix='.native-pdf-', dir=EVIDENCE))
    filenames = ['native-campaign.pdf', 'native-campaign-repeat.pdf']
    display = next(f':{n}' for n in range(120, 150) if not Path(f'/tmp/.X11-unix/X{n}').exists())
    env = dict(os.environ, DISPLAY=display, XDG_DATA_HOME=str(run_dir/'data'), XDG_CONFIG_HOME=str(run_dir/'config'),
               XDG_CACHE_HOME=str(run_dir/'cache'), LD_LIBRARY_PATH=str(X11/'lib/x86_64-linux-gnu'))
    executable = ROOT/'build/linux/voces-de-la-plaza.x86_64'
    files = [Path(__file__), ROOT/'tests/native_window_smoke.py', ROOT/'tests/runtime_pdf_check.py', executable,
             executable.with_suffix('.pck'), ROOT/'game/project.godot', *sorted((ROOT/'game/scripts').glob('*.gd')),
             *sorted((ROOT/'game/content').glob('*.json'))]
    hashes = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in files}
    report = {'status': 'running', 'environment': 'Linux original release, isolated Xvfb, real xdotool controls',
              'tested_files': hashes, 'captures': [], 'paths': [], 'pdfs': [], 'runtime_errors': [],
              'save_directory': str(save_dir.relative_to(ROOT)), 'canonical_evidence_published': False,
              'prior_canonical_sha256': {name: hashlib.sha256((EVIDENCE/name).read_bytes()).hexdigest()
                                         for name in filenames if (EVIDENCE/name).exists()}}
    log_path = EVIDENCE/'native-pdf-save.log'
    log = log_path.open('w')
    server = subprocess.Popen([str(X11/'bin/Xvfb'), display, '-screen', '0', '1280x800x24', '-nolisten', 'tcp', '-ac'],
                              env=env, stdout=subprocess.DEVNULL, stderr=log)
    game = None

    def tool(*args):
        return subprocess.run([str(X11/'bin/xdotool'), *args], env=env, check=True, capture_output=True, text=True, timeout=10).stdout.strip()

    def key(name):
        tool('key', name)
        time.sleep(.2)

    def choose(tabs=1):
        for _ in range(tabs): key('Tab')
        key('Return')

    def screen():
        result = subprocess.run(['import', '-display', display, '-window', 'root', 'png:-'], env=env,
                                check=True, capture_output=True, timeout=10)
        return Image.open(io.BytesIO(result.stdout)).convert('RGB')

    def capture(name):
        path = EVIDENCE/f'native-pdf-{name}.png'
        picture = screen()
        picture.save(path)
        report['captures'].append({'name': name, 'path': str(path.relative_to(ROOT)),
                                   'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'seconds': round(time.monotonic() - started, 3)})
        print(name, flush=True)
        return picture

    def hold(direction, seconds):
        tool('keydown', direction)
        try: time.sleep(seconds)
        finally: tool('keyup', direction)
        time.sleep(.12)

    def walk(x=None, y=None):
        before = avatar_position(screen())
        for axis, target in enumerate([x, y]):
            if target is None: continue
            for _ in range(24):
                position = avatar_position(screen())
                delta = target - position[axis]
                if abs(delta) <= 2: break
                direction = ('d' if delta > 0 else 'a') if axis == 0 else ('s' if delta > 0 else 'w')
                hold(direction, min(1.8, max(.025, abs(delta) / SPEED)))
            else: raise AssertionError(f'Physical movement failed: {position} -> {[x, y]}')
        report['paths'].append({'from': before, 'to': avatar_position(screen()), 'target': [x, y]})

    def enter(index):
        assert screen().getpixel((50, 160)) == plaza
        walk(y=140); walk(x=80 + index * 160)
        for _ in range(16):
            hold('w', .1)
            if screen().getpixel((50, 160)) != plaza: break
        else: raise AssertionError('Door entry failed')
        position = avatar_position(screen())
        assert abs(position[0] - 240) <= 2 and 140 <= position[1] <= 156

    def leave():
        walk(y=155); walk(x=240)
        for _ in range(16):
            hold('s', .1)
            if screen().getpixel((50, 160)) == plaza: break
        else: raise AssertionError('Door exit failed')

    def saved(completed, printed=False):
        paths = list((run_dir/'data').rglob('voces_progress_v1.json'))
        assert len(paths) == 1
        value = json.loads(paths[0].read_text())
        assert set(value) == {'schema_version', 'completed', 'hints', 'settings', 'campaign_printed'}, value
        assert value['schema_version'] == 2 and value['completed'] == completed and value['campaign_printed'] is printed, value
        return value

    try:
        time.sleep(.5)
        game = subprocess.Popen([str(executable), '--display-driver', 'x11', '--resolution', '1280x800', '--position', '0,0', '--audio-driver', 'Dummy'],
                                cwd=ROOT, env=env, stdout=log, stderr=log)
        deadline = time.monotonic() + 10
        while True:
            try:
                window = tool('search', '--name', '^Voces de la Plaza$').splitlines()[0]
                break
            except (subprocess.CalledProcessError, IndexError):
                assert time.monotonic() < deadline, 'Release window did not open'
                time.sleep(.2)
        tool('windowfocus', window)
        time.sleep(1)
        key('Escape')
        plaza = capture('plaza').getpixel((50, 160))
        for chapter, answers in enumerate([[1, 1, 1], [2, 1, 1]]):
            enter(chapter); walk(x=175, y=130); key('e')
            assert dialogue_bounds(capture(f'intro-{chapter + 1}')) == (40, 420, 1240, 776)
            choose()
            for step, answer in enumerate(answers):
                choose(answer)
                if step < 2: choose()
            saved(['printing', 'comparison'][:chapter + 1])
            capture(f'quest-{chapter + 1}-complete')
            key('Escape'); leave()
        enter(2); walk(x=175, y=130); key('e'); choose()
        choose(4); choose(2)
        assert dialogue_bounds(capture('ines-intro'))
        saved(['printing', 'comparison', 'consultation'])
        choose(); capture('review'); choose()
        assert dialogue_bounds(capture('sent'))
        key('Escape'); leave(); enter(0); walk(x=283, y=110)
        key('e'); capture('press'); choose(); time.sleep(.7)
        capture('ending')
        saved(['printing', 'comparison', 'consultation'], True)
        for index, filename in enumerate(filenames):
            output = save_dir/filename
            assert not output.exists(), f'Per-run native save destination must be new: {output}'
            before = set(tool('search', '--onlyvisible', '--pid', str(game.pid)).splitlines())
            choose()  # Ending's first action: Descargar cartel PDF.
            deadline = time.monotonic() + 8
            while True:
                windows = set(tool('search', '--onlyvisible', '--pid', str(game.pid)).splitlines()) - before
                if windows: break
                assert time.monotonic() < deadline, 'Native FileDialog did not open'
                time.sleep(.1)
            assert len(windows) == 1, windows
            dialog = windows.pop()
            tool('windowfocus', dialog)
            capture(f'dialog-{index + 1}')
            # This is the actual File field observed in native-campaign-save-dialog.png.
            tool('mousemove', '590', '628', 'click', '1')
            key('ctrl+a')
            tool('type', '--clearmodifiers', '--delay', '8', str(output))
            capture(f'destination-{index + 1}')
            tool('mousemove', '801', '677', 'click', '1')  # Actual Save button.
            deadline = time.monotonic() + 8
            while not output.exists():
                assert time.monotonic() < deadline, f'Native save did not create {output}'
                time.sleep(.1)
            assert dialog not in tool('search', '--onlyvisible', '--pid', str(game.pid)).splitlines(), 'Successful save should close FileDialog'
            tool('windowfocus', window)
            capture(f'saved-{index + 1}')
            report['pdfs'].append(verify_pdf(output, {'first': 'state_01', 'second': 'state_02', 'metric': 'rate', 'question': 'missing'}))
            report['save'] = saved(['printing', 'comparison', 'consultation'], True)
            key('Escape'); key('e')  # Reopen FIN at the same nearby press for repeat download.
        assert report['pdfs'][0]['sha256'] == report['pdfs'][1]['sha256'], 'Repeated downloads must preserve bytes'
        assert all(hashlib.sha256(path.read_bytes()).hexdigest() == hashes[str(path.relative_to(ROOT))] for path in files), 'Source/export/harness changed during supplementary run'
        report['runtime_errors'] = runtime_errors(log_path)
        assert not report['runtime_errors'], report['runtime_errors']
        # Publish only after both real saves, PDF inspections, byte comparison,
        # private-save checks and source/runtime guards have passed. Replace each
        # owned generated artifact atomically, retaining the actual saved files.
        for pdf in report['pdfs']:
            pdf['validated_save_path'] = pdf['path']
            for field in ('path', 'text', 'render'):
                source = ROOT/pdf[field]
                destination = EVIDENCE/source.name
                staged = source.with_name(source.name + '.publish')
                shutil.copy2(source, staged)
                staged.replace(destination)
                pdf[field] = str(destination.relative_to(ROOT))
        report['canonical_evidence_published'] = True
        report['status'] = 'passed'
        report['repeat_bytes_equal'] = True
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try: capture('failure')
        except Exception: pass  # Retain the originating failure even if the window has closed.
        report['runtime_errors'] = runtime_errors(log_path)
        raise
    finally:
        report['elapsed_seconds'] = round(time.monotonic() - started, 3)
        (EVIDENCE/'native-pdf-save.json').write_text(json.dumps(report, indent=2) + '\n')
        if game is not None:
            game.terminate(); game.wait(timeout=10)
        server.terminate(); server.wait(timeout=10)
        log.close()
    print(json.dumps({'status': report['status'], 'elapsed_seconds': report['elapsed_seconds'], 'sha256': report['pdfs'][0]['sha256']}), flush=True)


if __name__ == '__main__':
    main()
