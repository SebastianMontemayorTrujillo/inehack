// Exported canvas UI only: real mouse/keyboard input, pixel checks and read-only saves.
// Run after Main's export: node tests/godot_browser_smoke.mjs
// Oracle preflight (no browser/export/evidence writes): add --self-test.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const evidence = join(root, 'build/evidence');
const reportPath = join(evidence, 'godot-web-journey.json');
const viewport = { width: 1280, height: 800 };
const worldSpeed = 65 / 2.5; // CharacterBody2D velocity is global; the world is scaled.
const sha256 = data => createHash('sha256').update(data).digest('hex');
const activities = ['participation-reading', 'unknown', 'unknown-transfer', 'more-count', 'higher-rate', 'comparison-transfer'];
const crops = { panel: [180, 160, 1080, 205], spaciousTitle: [124, 60, 850, 104], dialogueTitle: [64, 444, 870, 488],
  dialogueBody: [64, 444, 1216, 752], house: [116, 248, 800, 294], body: [184, 264, 1080, 664], poster: [124, 210, 1140, 650] };
const defaultSettings = { large_text: false, muted: false, reduced_motion: false, music_volume: 0.2 };
const dialogueViews = new Set(['intro-1', 'intro-2', 'house-2-prerequisite', 'house-3-prerequisite', 'poster-intro',
  'consultation-intro', 'poster-carried-intro', 'consultation-poster', 'poster-carried-acknowledgment', 'campaign-intro', 'campaign-sent']);
const finaleRefs = ['intro-1', 'intro-2', 'campaign-intro', 'campaign-review', 'campaign-sent', 'campaign-sent-room',
  'campaign-printshop-return', 'campaign-press', 'campaign-complete-hud', 'ending-large', 'ending-large-download-focused', 'poster-large-intro'];
const posterViews = new Set(['poster-count', 'poster-count-details', 'poster-rate', 'poster-rate-details', 'poster-preview',
  'poster-saved', 'poster-published', 'poster-unpublished-draft', 'poster-after-cancel', 'poster-from-journal',
  'poster-large-preview', 'poster-large-preview-edit', 'poster-large-preview-footer']);
const nativePath = name => join(evidence, `native-${name}.png`);
const workshopRefs = ['poster-archive-before', 'poster-defaults', 'poster-duplicate-error', 'poster-count', 'poster-count-details',
  'poster-first', 'poster-metric', 'poster-question', 'poster-rate', 'poster-preview', 'poster-rate-details', 'poster-source', 'poster-source-details',
  'poster-saved', 'poster-saved-room', 'poster-carried-intro', 'poster-carried-acknowledgment', 'poster-published', 'poster-unpublished-draft', 'poster-cancelled-room',
  'poster-after-cancel', 'poster-from-journal', 'consultation-intro', 'consultation-poster', 'journal-empty', 'journal-empty-end',
  'poster-large-preview', 'poster-large-preview-edit', 'poster-large-preview-footer', 'poster-large-source', 'poster-large-source-details',
  'journal-reset', 'journal-reset-end', ...['first', 'second', 'metric', 'question', 'back-metric', 'back-second', 'back-first', 'duplicate-error'].map(x => `poster-large-${x}`)];

// Pillow is already required by native_window_smoke.py. Inspect screenshot bytes,
// not the WebGL back buffer (which may be cleared between rendered frames).
const pixelReader = String.raw`
import hashlib, io, json, sys
from PIL import Image, ImageChops
from tests.native_window_smoke import focus_bounds, avatar_position, poster_bounds, dialogue_bounds
options = json.loads(sys.argv[1])
image = Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB')
assert image.size == (1280, 800), image.size
result = {'terrain': list(image.getpixel((50, 160))),
          'panel': list(image.getpixel((180, 160))),
          'title_sha256': hashlib.sha256(image.crop((180, 160, 1080, 205)).tobytes()).hexdigest(),
          'house_sha256': hashlib.sha256(image.crop((116, 248, 800, 294)).tobytes()).hexdigest(),
          'body_sha256': hashlib.sha256(image.crop((184, 264, 1080, 664)).tobytes()).hexdigest(),
          'poster_sha256': hashlib.sha256(image.crop((124, 210, 1140, 650)).tobytes()).hexdigest(),
          'artifact_sha256': hashlib.sha256(image.crop((132, 536, 1080, 596)).tobytes()).hexdigest()}
result['spacious'] = image.getpixel((110, 120)) == (246, 240, 218)
result['dialogue_bounds'] = dialogue_bounds(image)
result['dialogue'] = result['dialogue_bounds'] is not None
result['panel_open'] = result['dialogue'] or result['spacious'] or result['panel'] == [246, 240, 218]
if result['dialogue']:
    offset = result['dialogue_bounds'][1] - 420
    result['title_sha256'] = hashlib.sha256(image.crop((64, 444 + offset, 870, 488 + offset)).tobytes()).hexdigest()
    result['body_sha256'] = hashlib.sha256(image.crop((64, 444 + offset, 1216, 752)).tobytes()).hexdigest()
elif result['spacious']:
    result['title_sha256'] = hashlib.sha256(image.crop((124, 60, 850, 104)).tobytes()).hexdigest()
result['paper_bounds'] = poster_bounds(image) if result['spacious'] else None
if result['paper_bounds']:
    result['poster_sha256'] = hashlib.sha256(image.crop(result['paper_bounds']).tobytes()).hexdigest()

def browser_avatar():
    try:
        return avatar_position(image)
    except AssertionError:
        # Chromium can rasterize the 20-pixel shadow as 19 or 21 pixels at a
        # fractional world position. Require a complete rectangle, teal shirt
        # and exactly one match; never infer a missing player's location.
        pixels = image.load()
        shadow, shirt = (120, 144, 128), (54, 124, 131)
        matches = []
        for y in range(176, 671):
            for x in range(41, 1219):
                if pixels[x, y] != shadow or pixels[x - 1, y] == shadow or pixels[x, y - 1] == shadow:
                    continue
                for width in (19, 21):
                    if pixels[x + width, y] == shadow or pixels[x + width // 2, y - 10] != shirt:
                        continue
                    if all(pixels[xx, yy] == shadow for yy in range(y, y + 5) for xx in range(x, x + width)):
                        matches.append([round((x + width / 2 - 40) / 2.5, 2), round((y - 7.5 - 156) / 2.5, 2)])
        assert len(matches) == 1, f'Expected one visible original player; raster candidates: {matches}'
        return matches[0]

try:
    result['avatar'] = browser_avatar() if not result['panel_open'] else None
except AssertionError:
    result['avatar'] = None
try:
    result['focus_rows'] = focus_bounds(image) if options.get('focus', True) else []
except AssertionError:
    result['focus_rows'] = []
if options.get('reference'):
    reference = Image.open(options['reference']).convert('RGB')
    assert reference.size == image.size, reference.size
    crop = tuple(options['crop'])
    regions = [crop, crop]
    if crop == (124, 210, 1140, 650):
        bounds = [poster_bounds(item) for item in (image, reference)]
        if all(bounds):
            regions = bounds
    # Dialogue has light text on dark translucent paper. Comparing dark pixels
    # there would falsely match any two mostly-dark conversations.
    light = crop in ((64, 444, 870, 488), (64, 444, 1216, 752), (64, 384, 1216, 752))
    masks = [item.crop(region).convert('L').point(lambda p: 255 if (p > 210 if light else p < 110) else 0, mode='1') for item, region in zip((image, reference), regions)]
    counts = [mask.convert('L').histogram()[255] for mask in masks]
    overlap = ImageChops.logical_and(*masks).convert('L').histogram()[255] if masks[0].size == masks[1].size else 0
    result['ink_pixels'] = counts
    result['title_ink_f1'] = 2 * overlap / sum(counts) if min(counts) > 200 else 0
print(json.dumps(result))
`;

function pixels(png, reference, crop = crops.panel, focus = true) {
  const result = spawnSync('python3', ['-c', pixelReader, JSON.stringify({ reference, crop, focus })], {
    input: png, cwd: root, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, maxBuffer: 1024 * 1024, timeout: 5000,
  });
  assert.equal(result.status, 0, `Screenshot decoding failed: ${result.error || result.stderr}`);
  return JSON.parse(result.stdout.toString());
}
const equalRGB = (a, b) => a.every((value, i) => value === b[i]);
const titleMatches = metrics => metrics.title_ink_f1 >= 0.90;

async function selfTest() {
  const plaza = pixels(await readFile(nativePath('plaza')));
  const interior = pixels(await readFile(nativePath('door-entry')));
  assert.ok(!equalRGB(plaza.terrain, interior.terrain), 'Door marker distinguishes plaza from interior');
  assert.ok(equalRGB(plaza.terrain, pixels(await readFile(nativePath('door-return'))).terrain));
  const refs = ['house-1', 'house-2', 'house-3', 'quest-1-1', 'quest-1-2', 'quest-1-3', 'quest-2-1', 'quest-2-2', 'quest-2-3', 'ending'];
  for (const name of refs) {
    const crop = name.startsWith('house-') ? crops.house : name === 'ending' ? crops.spaciousTitle : crops.panel;
    assert.ok(titleMatches(pixels(await readFile(nativePath(name)), nativePath(name), crop)), name);
    const wrong = name.startsWith('house-') ? `house-${name === 'house-1' ? 2 : 1}` : (name === 'ending' ? 'quest-1-1' : 'ending');
    assert.ok(!titleMatches(pixels(await readFile(nativePath(wrong)), nativePath(name), crop)), `Reject wrong state for ${name}`);
  }
  for (const name of ['intro-1', 'intro-2', 'consultation-intro']) {
    const png = await readFile(nativePath(name));
    assert.deepEqual(pixels(png).dialogue_bounds, [40, 420, 1240, 776]);
    assert.ok(titleMatches(pixels(png, nativePath(name), crops.dialogueTitle)), name);
    const wrong = name === 'intro-1' ? 'intro-2' : 'intro-1';
    assert.ok(!titleMatches(pixels(await readFile(nativePath(wrong)), nativePath(name), crops.dialogueTitle)), `Reject wrong speaker: ${name}`);
  }
  assert.deepEqual(pixels(await readFile(nativePath('poster-large-intro'))).dialogue_bounds, [40, 360, 1240, 776]);
  for (const name of ['poster-count', 'poster-rate', 'poster-published', 'poster-source']) {
    const crop = posterViews.has(name) ? crops.poster : crops.body;
    assert.ok(titleMatches(pixels(await readFile(nativePath(name)), nativePath(name), crop)), name);
    assert.ok(!titleMatches(pixels(await readFile(nativePath('ending')), nativePath(name), crop)), `Reject wrong poster state: ${name}`);
  }
  assert.deepEqual(plaza.avatar, [240, 175.8], 'Visible original avatar at the plaza spawn');
  assert.ok(interior.avatar?.every((value, index) => Math.abs(value - [240, 155][index]) <= 2), 'Visible original avatar at the interior spawn');
  assert.ok(pixels(await readFile(nativePath('poster-large-question'))).focus_rows.length, 'Enlarged question focus is fully visible');
  console.log('Pixel oracle preflight passed: physical markers, matching/wrong-state checks, three bottom-dialogue speakers, normal/enlarged bounds and focus. No browser run.');
}

// Read only the app's own allowlisted file in a brand-new isolated context.
// Never call engine methods, inject progress, patch the canvas or seed storage.
async function progress(page) {
  return page.evaluate(async () => {
    if (!(await indexedDB.databases()).some(db => db.name === '/userfs')) return null;
    return new Promise((resolve, reject) => {
      let db;
      const timer = setTimeout(() => { db?.close(); reject(Error('Timed out reading Godot save')); }, 5000);
      const finish = (error, value) => {
        clearTimeout(timer); db?.close();
        if (error) reject(error); else resolve(value);
      };
      const request = indexedDB.open('/userfs');
      request.onupgradeneeded = () => { request.transaction.abort(); finish(Error('Existing save database required')); };
      request.onerror = () => finish(request.error);
      request.onsuccess = () => {
        db = request.result;
        if (!db.objectStoreNames.contains('FILE_DATA')) { finish(null, null); return; }
        const transaction = db.transaction('FILE_DATA', 'readonly');
        transaction.onerror = () => finish(transaction.error);
        const store = transaction.objectStore('FILE_DATA');
        const keys = store.getAllKeys();
        keys.onsuccess = () => {
          const matches = keys.result.filter(key => typeof key === 'string' && key.endsWith('/voces_progress_v1.json'));
          if (!matches.length) { finish(null, null); return; }
          if (matches.length !== 1) { finish(Error('Ambiguous Godot progress files')); return; }
          const saved = store.get(matches[0]);
          saved.onsuccess = () => {
            try {
              const bytes = saved.result.contents;
              if (!bytes || bytes.byteLength > 16384) throw Error('Unexpected progress file size');
              finish(null, { path: matches[0], value: JSON.parse(new TextDecoder().decode(bytes)) });
            } catch (error) { finish(error); }
          };
        };
      };
    });
  });
}

async function main() {
  const started = Date.now();
  const url = new URL('/build/web/game/', process.env.PREVIEW_URL || 'http://127.0.0.1:8765');
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname), 'Only the local preview is in scope');
  const report = {
    status: 'running', created_at_utc: new Date().toISOString(), url: url.href, viewport,
    run_kind: process.argv.includes('--implementation') ? 'implementation-on-existing-export' : 'final-export',
    environment: 'Playwright Chromium, fresh non-persistent context, exported Godot canvas',
    phases: [], movement_checks: [], dialogue_checks: [], finale_checks: [], screenshots: [], progress: [], browser_errors: [], page_errors: [], error_context: [], reference_mismatches: [], warnings: [], request_failures: [],
    visual_review: 'Required separately: pixel comparison is not OCR or a semantic reading of screenshots.',
    limits: ['Automated operator, not a participant pilot or accessibility certification',
      'One unmarked consultation path; all-five-choice coverage belongs to compiled-PCK/GUT and HTML checks'],
  };
  let browser, context, page, stage = 'preflight', closing = false, timedOut = false;
  let watchdog;
  const nativeNames = ['plaza', 'door-entry', 'door-return', 'house-1', 'house-2', 'house-3',
    'no-move-left', 'no-move-right', 'no-move-up', 'no-move-down', 'no-teleport-0', 'no-teleport-1', 'no-teleport-2', 'no-teleport-3', 'no-escape-exit',
    'house-2-prerequisite', 'house-2-prerequisite-closed', 'house-3-prerequisite', 'house-3-prerequisite-closed',
    'quest-1-1', 'quest-1-2', 'quest-1-3', 'quest-2-1', 'quest-2-2', 'quest-2-3', 'ending', ...workshopRefs, ...finaleRefs];
  const artifactFiles = ['index.html', 'index.js', 'index.wasm', 'index.pck'];
  const responseChecks = [];
  await mkdir(evidence, { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

  async function capture(name, png, metrics) {
    const path = join(evidence, `godot-web-${name}.png`);
    await writeFile(path, png);
    report.screenshots.push({ phase: name, elapsed_seconds: (Date.now() - started) / 1000, path: relative(root, path), sha256: sha256(png), ...metrics });
  }

  async function checkpoint(name, { inside = true, panel = false, reference, referenceCrop, differentTitle, differentBody,
    sameBody, differentPoster, samePoster, differentArtifact, visibleFocus = false, spacious = false, dialogue = false, largeDialogue = false, deferReference = false } = {}) {
    stage = name;
    const deadline = Date.now() + 8000;
    let png, metrics;
    do {
      png = await page.screenshot({ type: 'png', timeout: 5000 });
      const crop = referenceCrop || (dialogue ? crops.dialogueTitle : spacious ? crops.spaciousTitle : panel ? crops.panel : crops.house);
      metrics = pixels(png, reference ? nativePath(reference) : undefined, crop);
      const location = inside ? 'interior' : 'plaza';
      const terrain = report.markers[panel && !dialogue ? `${location}_panel` : location];
      if (equalRGB(metrics.terrain, terrain) && metrics.panel_open === panel && metrics.spacious === spacious
          && metrics.dialogue === dialogue && (!dialogue || metrics.dialogue_bounds[1] === (largeDialogue ? 360 : 420))
          && (!reference || titleMatches(metrics) || deferReference) && (!differentTitle || metrics.title_sha256 !== differentTitle)
          && (!differentBody || metrics.body_sha256 !== differentBody) && (!sameBody || metrics.body_sha256 === sameBody)
          && (!differentPoster || metrics.poster_sha256 !== differentPoster) && (!samePoster || metrics.poster_sha256 === samePoster)
          && (!differentArtifact || metrics.artifact_sha256 !== differentArtifact) && (!visibleFocus || metrics.focus_rows.length)) {
        await capture(name, png, { ...metrics, native_reference: reference || null, reference_crop: crop });
        if (reference && !titleMatches(metrics)) report.reference_mismatches.push({ phase: name, reference, ink_f1: metrics.title_ink_f1 });
        return metrics;
      }
      await page.waitForTimeout(100);
    } while (Date.now() < deadline);
    await capture(`${name}-mismatch`, png, metrics);
    assert.fail(`Rendered state did not reach ${name}: ${JSON.stringify(metrics)}`);
  }

  async function key(name) {
    await page.keyboard.press(name, { delay: 35 });
    await page.waitForTimeout(120); // Allow deferred focus/layout; checkpoints assert the resulting state.
  }
  async function click(x, y) { await page.mouse.click(x, y); await page.waitForTimeout(120); }
  async function choose(tabs = 1) {
    for (let i = 0; i < tabs; i++) await key('Tab');
    await key('Enter');
  }
  async function option(index, current = 0) {
    await key('Enter');
    for (let i = 0; i < Math.abs(index - current); i++) await key(index > current ? 'ArrowDown' : 'ArrowUp');
    await key('Enter');
  }
  // Movement probes need only visible world/actor state. Focus is still decoded
  // and asserted at every applicable UI checkpoint, including enlarged controls.
  const worldState = async () => pixels(await page.screenshot({ type: 'png', timeout: 5000 }), undefined, crops.panel, false);
  async function hold(name, milliseconds) {
    await page.keyboard.down(name);
    try { await page.waitForTimeout(milliseconds); } finally { await page.keyboard.up(name); }
    await page.waitForTimeout(120); // Observe the idle frame after movement, not its animated bob.
  }
  async function walkTo({ x, y }) {
    stage = `WASD-to-${x ?? 'same'}-${y ?? 'same'}`;
    const start = (await worldState()).avatar;
    assert.ok(start, 'Walking starts with an unobscured original player');
    for (const [axis, target] of [x, y].entries()) {
      if (target === undefined) continue;
      let reached = false;
      for (let i = 0; i < 24; i++) {
        const position = (await worldState()).avatar;
        assert.ok(position, 'Physical movement must leave the player visible');
        const delta = target - position[axis];
        if (Math.abs(delta) <= 2) { reached = true; break; }
        const direction = axis === 0 ? (delta > 0 ? 'd' : 'a') : (delta > 0 ? 's' : 'w');
        await hold(direction, Math.min(1800, Math.max(25, Math.abs(delta) / worldSpeed * 1000)));
      }
      assert.ok(reached, `WASD did not reach axis ${axis}=${target}`);
    }
    report.movement_checks.push({ check: 'physical WASD path', from: start, to: (await worldState()).avatar, target: [x ?? null, y ?? null] });
  }
  function stationary(name, before, after) {
    assert.ok(before.avatar && after.avatar, `${name}: world/player must remain visible`);
    assert.ok(before.avatar.every((value, index) => Math.abs(value - after.avatar[index]) <= .4), `${name}: player moved ${before.avatar} -> ${after.avatar}`);
    assert.deepEqual(after.terrain, before.terrain, `${name}: room changed`);
    assert.equal(after.house_sha256, before.house_sha256, `${name}: house changed`);
    report.movement_checks.push({ check: name, before: before.avatar, after: after.avatar });
  }
  async function enterHouse(index) {
    assert.deepEqual((await worldState()).terrain, report.markers.plaza, 'Entry starts outside');
    await walkTo({ y: 140 });
    await walkTo({ x: 80 + index * 160 });
    let position;
    for (let i = 0; i < 16; i++) {
      await hold('w', 100);
      const state = await worldState();
      if (equalRGB(state.terrain, report.markers.interior)) { position = state.avatar; break; }
    }
    assert.ok(position, `Walking W into house ${index + 1} must enter automatically`);
    assert.ok(Math.abs(position[0] - 240) <= 2 && position[1] >= 140 && position[1] <= 156, `Interior spawn: ${position}`);
    await walkTo({ x: 240, y: 155 });
    report.movement_checks.push({ check: 'automatic W door entry', house: index + 1, spawn: position });
  }
  async function leaveHouse(index) {
    assert.deepEqual((await worldState()).terrain, report.markers.interior, 'Exit starts inside');
    await walkTo({ y: 155 });
    await walkTo({ x: 240 });
    let position;
    for (let i = 0; i < 16; i++) {
      await hold('s', 100);
      const state = await worldState();
      if (equalRGB(state.terrain, report.markers.plaza)) { position = state.avatar; break; }
    }
    assert.ok(position, `Walking S through house ${index + 1} exit must leave automatically`);
    assert.ok(Math.abs(position[0] - (80 + index * 160)) <= 2 && position[1] >= 119 && position[1] <= 135, `Outside spawn: ${position}`);
    report.movement_checks.push({ check: 'automatic S exit', house: index + 1, spawn: position });
  }
  const approachHost = () => walkTo({ x: 175, y: 130 });
  const posterCheckpoint = (name, options = {}) => checkpoint(name, {
    panel: true, spacious: posterViews.has(name), dialogue: dialogueViews.has(name), reference: name,
    referenceCrop: dialogueViews.has(name) ? crops.dialogueBody : posterViews.has(name) ? crops.poster : crops.body, ...options,
  });
  async function dialogueFreezesWorld(name, before) {
    await checkpoint(name, { panel: true, dialogue: true, reference: name });
    await hold('d', 300);
    await click(45, 710);
    await checkpoint(`${name}-input-contained`, { panel: true, dialogue: true, reference: name });
    await key('Escape');
    stationary(`${name} blocks movement and world controls`, before, await worldState());
    await key('e');
    const reopened = await checkpoint(`${name}-reopened`, { panel: true, dialogue: true, reference: name });
    report.dialogue_checks.push({ check: name, bounds: reopened.dialogue_bounds, blocks_world_input: true });
  }
  async function workshop() {
    await key('Escape');
    const archive = await checkpoint('poster-archive-before', { reference: 'house-2' });
    await click(140, 765); await choose(2);
    await posterCheckpoint('poster-defaults');
    await key('Tab'); await key('Tab'); await option(0, 1);
    await choose(3);
    await posterCheckpoint('poster-duplicate-error', { visibleFocus: true });
    await key('Tab'); await option(1); await choose(3);
    const count = await posterCheckpoint('poster-count');
    await key('Tab'); await posterCheckpoint('poster-count-details', { visibleFocus: true });
    await key('Enter');
    await key('Tab'); await option(18);
    await posterCheckpoint('poster-first', { visibleFocus: true });
    await key('Tab'); await option(1, 1);
    await key('Tab'); await option(1);
    await posterCheckpoint('poster-metric', { visibleFocus: true });
    await key('Tab'); await option(1);
    await posterCheckpoint('poster-question', { visibleFocus: true });
    await choose();
    const rate = await posterCheckpoint('poster-rate', { differentPoster: count.poster_sha256 });
    await posterCheckpoint('poster-preview', { samePoster: rate.poster_sha256 });
    await key('Tab'); await posterCheckpoint('poster-rate-details', { visibleFocus: true });
    await key('Tab'); await choose();
    await posterCheckpoint('poster-source');
    await key('Tab'); await posterCheckpoint('poster-source-details', { visibleFocus: true });
    await choose(); await choose(2); // Guardar mi cartel: published preview in place.
    const published = await posterCheckpoint('poster-saved', { samePoster: rate.poster_sha256 });
    await assertProgress(['printing', 'comparison']);
    await key('Escape');
    const savedRoom = await checkpoint('poster-saved-room', { reference: 'house-2' });
    stationary('Saving the poster stays at the same archive position', archive, savedRoom);
    await walkTo({ x: 283, y: 130 }); // Approach the physical archive artifact.
    await key('Enter');
    await posterCheckpoint('poster-published', { samePoster: published.poster_sha256 });
    await choose();
    await key('Tab'); await option(0, 18);
    await key('Tab'); await option(2, 1);
    await key('Tab'); await option(0, 1);
    await key('Tab'); await option(2, 1);
    await choose();
    await posterCheckpoint('poster-unpublished-draft', { differentPoster: published.poster_sha256 });
    await choose(); await choose(6);
    await checkpoint('poster-cancelled-room', { reference: 'house-2', differentArtifact: archive.artifact_sha256 });
    await key('e');
    await posterCheckpoint('poster-after-cancel', { samePoster: published.poster_sha256 });
    await key('Escape'); await key('j'); await choose(2);
    await posterCheckpoint('poster-from-journal', { samePoster: published.poster_sha256 });
    await assertProgress(['printing', 'comparison']);
    await key('Escape');
    report.poster_input = { first: 'state_19', second: 'state_02', metric: 'rate', question: 'voices' };
    report.phases.push('Real OptionButtons, duplicate rejection, redesigned poster, exact-data/source panel, save in place, nearby artifact/journal re-entry and cancelled-draft preservation');
  }
  async function assertProgress(completed, settings = defaultSettings, printed = false) {
    stage = `save-${completed.length}`;
    let saved;
    const deadline = Date.now() + 10000;
    do {
      saved = await progress(page);
      if (JSON.stringify(saved?.value.completed) === JSON.stringify(completed)
          && saved?.value.campaign_printed === printed
          && Object.entries(settings).every(([name, value]) => saved?.value.settings?.[name] === value)) break;
      await page.waitForTimeout(150);
    } while (Date.now() < deadline);
    assert.deepEqual(saved?.value.completed, completed, 'UI choices reached the expected persisted chapters');
    assert.deepEqual(Object.keys(saved.value).sort(), ['campaign_printed', 'completed', 'hints', 'schema_version', 'settings']);
    assert.equal(saved.value.schema_version, 2);
    assert.equal(saved.value.campaign_printed, printed, 'Only the local press completes the fourth step');
    assert.deepEqual(saved.value.hints, [], 'Journey completed without assisted shortcuts');
    assert.deepEqual(saved.value.settings, settings);
    report.progress.push(saved);
  }

  try {
    report.test_sha256 = sha256(await readFile(fileURLToPath(import.meta.url)));
    report.native_script_sha256 = sha256(await readFile(join(root, 'tests/native_window_smoke.py')));
    report.pdf_checker_sha256 = sha256(await readFile(join(root, 'tests/runtime_pdf_check.py')));
    const nativeReportBytes = await readFile(join(evidence, 'native-window.json'));
    const nativeReport = JSON.parse(nativeReportBytes);
    assert.equal(nativeReport.status, 'passed', 'Fresh native journey must pass before canvas comparisons');
    assert.equal(nativeReport.test_sha256, report.native_script_sha256, 'Native references must come from the current harness');
    assert.equal(nativeReport.pack_sha256, sha256(await readFile(join(root, 'build/linux/voces-de-la-plaza.pck'))), 'Native references must match the current Linux export');
    report.native_run_sha256 = sha256(nativeReportBytes);
    report.source_sha256 = nativeReport.source_sha256;
    assert.ok(Object.keys(report.source_sha256).length >= 10, 'Native run must record the current game sources');
    for (const [path, fingerprint] of Object.entries(report.source_sha256)) {
      assert.equal(sha256(await readFile(join(root, path))), fingerprint, `Source changed since native run: ${path}`);
    }
    report.artifacts = Object.fromEntries(await Promise.all(artifactFiles.map(async name => [name, sha256(await readFile(join(root, 'build/web/game', name)))])));
    report.native_references = Object.fromEntries(await Promise.all(nativeNames.map(async name => [name, sha256(await readFile(nativePath(name)))])));
    report.markers = { coordinate: [50, 160], plaza: pixels(await readFile(nativePath('plaza'))).terrain,
      interior: pixels(await readFile(nativePath('door-entry'))).terrain,
      plaza_panel: pixels(await readFile(nativePath('journal-empty'))).terrain,
      interior_panel: pixels(await readFile(nativePath('quest-1-1'))).terrain };
    assert.ok(!equalRGB(report.markers.plaza, report.markers.interior));
    assert.ok(!equalRGB(report.markers.plaza_panel, report.markers.interior_panel));
    assert.ok(!equalRGB(report.markers.plaza, report.markers.plaza_panel), 'Dialog backdrop dims the plaza');
    assert.ok(!equalRGB(report.markers.interior, report.markers.interior_panel), 'Dialog backdrop dims the interior');
    assert.ok(equalRGB(pixels(await readFile(nativePath('door-return'))).terrain, report.markers.plaza));
    // The new route walks every journey leg and checks each position from pixels.
    watchdog = setTimeout(() => { timedOut = true; void browser?.close(); }, 900000);
    browser = await chromium.launch({
      executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
      headless: true, timeout: 20000, args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
    });
    report.browser = browser.version();
    context = await browser.newContext({ viewport, deviceScaleFactor: 1, serviceWorkers: 'block' });
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.page_errors.push(error.message));
    page.on('crash', () => report.page_errors.push('Browser page crashed'));
    page.on('console', message => {
      if (message.type() === 'error') {
        report.browser_errors.push(message.text());
        report.error_context.push({ last_checkpoint: stage, error: message.text() });
      }
      if (message.type() === 'warning') report.warnings.push(message.text());
    });
    page.on('requestfailed', request => {
      if (!closing) report.request_failures.push({ url: request.url(), error: request.failure()?.errorText });
    });
    page.on('response', response => {
      if (response.status() >= 400) report.browser_errors.push(`HTTP ${response.status()}: ${response.url()}`);
      if (response.url() === new URL('index.pck', url).href) {
        responseChecks.push(response.body().then(body => {
          report.served_pack_sha256 = sha256(body);
        }).catch(error => { report.page_errors.push(`Cannot fingerprint served pack: ${error.message}`); }));
      }
    });
    stage = 'boot';
    const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    assert.ok(response.ok());
    await page.locator('#status').waitFor({ state: 'hidden', timeout: 60000 });
    assert.deepEqual(await page.locator('#canvas').boundingBox(), { x: 0, y: 0, ...viewport });
    // A click in the heading focuses the actual canvas and unlocks browser audio.
    await click(80, 40);
    await key('Escape');
    const plaza = await checkpoint('plaza', { inside: false });
    assert.ok(plaza.avatar && plaza.avatar.every((value, index) => Math.abs(value - [240, 176][index]) <= .4));
    for (const direction of ['Left', 'Right', 'Up', 'Down']) {
      const before = await worldState();
      await hold(`Arrow${direction}`, 300);
      stationary(`${direction} arrow is UI only`, before, await checkpoint(`no-move-${direction.toLowerCase()}`, { inside: false }));
    }
    for (const name of ['e', 'Enter']) {
      const before = await worldState();
      await key(name);
      stationary(`${name} without a nearby host/artifact does nothing`, before, await worldState());
    }
    await click(140, 765);
    stationary('Distant action button is disabled', plaza, await worldState());
    for (const [index, [x, y]] of [[110, 711], [250, 711], [390, 711], [470, 765]].entries()) {
      const before = await worldState();
      await click(x, y); await key('Escape');
      stationary(`Old travel control ${x},${y} cannot move the player`, before, await checkpoint(`no-teleport-${index}`, { inside: false }));
    }
    const initial = await progress(page);
    assert.ok(initial === null || initial.value.completed.length === 0, 'Fresh context has no completed chapters');
    await key('j');
    const emptyJournal = await posterCheckpoint('journal-empty', { inside: false, deferReference: true });
    await key('Tab'); await key('Tab');
    const emptyJournalEnd = await posterCheckpoint('journal-empty-end', { inside: false, deferReference: true });
    await key('Escape');

    await enterHouse(0); await checkpoint('door-entry', { reference: 'house-1' });
    const interior = await worldState();
    await key('Escape');
    stationary('Escape cannot leave a house', interior, await checkpoint('no-escape-exit', { reference: 'house-1' }));
    for (const action of ['e', 'Enter']) {
      await key(action);
      stationary(`${action} cannot interact from interior spawn`, interior, await worldState());
    }
    await click(470, 765);
    stationary('Removed global exit cannot leave a house', interior, await worldState());
    await leaveHouse(0); await checkpoint('door-return', { inside: false });
    report.phases.push('Physical W entry and S exit occur automatically; arrows, Escape, distant interactions and removed controls never teleport');
    console.log('Verified physical door entry and exit.');
    for (const index of [0, 1, 2]) {
      await enterHouse(index);
      await checkpoint(`house-${index + 1}`, { reference: `house-${index + 1}` });
      const before = await worldState();
      for (const [x, y] of [[110, 711], [250, 711], [390, 711], [470, 765]]) {
        await click(x, y); await key('Escape');
        stationary(`Old control ${x},${y} cannot leave house ${index + 1}`, before, await worldState());
      }
      if (index > 0) {
        await approachHost();
        const position = await worldState();
        await key('e');
        await checkpoint(`house-${index + 1}-prerequisite`, { panel: true, dialogue: true, reference: `house-${index + 1}-prerequisite` });
        await choose(); await key('Escape');
        stationary(`House ${index + 1} prerequisite gives directions without travel`, position,
          await checkpoint(`house-${index + 1}-prerequisite-closed`, { reference: `house-${index + 1}` }));
        assert.deepEqual((await progress(page))?.value.completed || [], []);
      }
      await leaveHouse(index);
      await checkpoint(`house-${index + 1}-return`, { inside: false });
    }
    report.phases.push('All three houses entered and left before completing any quest');

    for (const [chapter, answers] of [[1, 1, 1], [2, 1, 1]].entries()) {
      await enterHouse(chapter);
      await checkpoint(`quest-${chapter + 1}-room`, { reference: `house-${chapter + 1}` });
      await approachHost();
      const before = await worldState();
      if (chapter === 0) await key('e');
      else await click(140, 765);
      await dialogueFreezesWorld(`intro-${chapter + 1}`, before);
      await choose();
      for (const [step, answer] of answers.entries()) {
        const name = `quest-${chapter + 1}-${step + 1}`;
        const question = await checkpoint(name, { panel: true, reference: name });
        await choose(answer);
        await checkpoint(`${name}-feedback`, { panel: true, differentTitle: question.title_sha256 });
        if (step < 2) await choose();
      }
      await assertProgress(['printing', 'comparison'].slice(0, chapter + 1));
      if (chapter === 1) await workshop();
      else await key('Escape');
      await checkpoint(`house-${chapter + 1}-complete`, { reference: `house-${chapter + 1}` });
      await leaveHouse(chapter);
      console.log(`Verified chapter ${chapter + 1}: three questions and persisted completion.`);
    }
    report.activities = activities;
    report.phases.push('Six decisions completed via Tab/Enter; question title pixels match six native captures; both chapter saves verified');

    await enterHouse(2); await checkpoint('consultation-room', { reference: 'house-3' });
    await approachHost();
    const meetingRoom = await worldState();
    await key('e');
    await dialogueFreezesWorld('consultation-intro', meetingRoom);
    const intro = await posterCheckpoint('consultation-intro');
    await posterCheckpoint('poster-carried-intro');
    await key('Tab'); await key('Tab');
    await posterCheckpoint('consultation-poster', { visibleFocus: true });
    await posterCheckpoint('poster-carried-acknowledgment', { visibleFocus: true });
    await key('Shift+Tab'); await key('Enter');
    // Intro and ballot both say "Una plaza, varias ideas"; their bodies differ.
    const options = await checkpoint('consultation-options', { panel: true, differentBody: intro.body_sha256 });
    await choose(4); // Unmarked fictional ballot, identical to the native GUI journey.
    await checkpoint('consultation-result', { panel: true, differentTitle: options.title_sha256 });
    await choose(2); // Skip the optional scenario button, choose the first follow-up.
    await checkpoint('campaign-intro', { panel: true, dialogue: true, reference: 'campaign-intro' });
    await assertProgress(['printing', 'comparison', 'consultation']);
    await choose(); // Revisar el cartel para la imprenta.
    await checkpoint('campaign-review', { panel: true, spacious: true, reference: 'campaign-review' });
    await choose(); // Enviar a la imprenta de Luz.
    await checkpoint('campaign-sent', { panel: true, dialogue: true, reference: 'campaign-sent', referenceCrop: crops.dialogueBody });
    await assertProgress(['printing', 'comparison', 'consultation']);
    await key('Escape');
    stationary('Sending the campaign keeps Inés and player in place', meetingRoom,
      await checkpoint('campaign-sent-room', { reference: 'house-3' }));
    report.finale_checks.push({ check: 'Consultation and dispatch leave campaign_printed false; no automatic travel' });
    await leaveHouse(2); await enterHouse(0);
    await checkpoint('campaign-printshop-return', { reference: 'house-1' });
    const atEntrance = await worldState();
    await key('e');
    stationary('Press cannot be activated remotely from the printshop entrance', atEntrance, await worldState());
    await assertProgress(['printing', 'comparison', 'consultation']);
    await walkTo({ x: 283, y: 110 });
    const pressPosition = (await worldState()).avatar;
    await key('e');
    await checkpoint('campaign-press', { panel: true, reference: 'campaign-press' });
    await choose(); // Imprimir cartel.
    await page.waitForTimeout(700);
    await checkpoint('ending', { panel: true, spacious: true, reference: 'ending' });
    await assertProgress(['printing', 'comparison', 'consultation'], defaultSettings, true);
    report.finale_checks.push({ check: 'Physically reached Luz and used E/Imprimir cartel at her local press', position: pressPosition });
    stage = 'campaign-download';
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await choose(); // Descargar cartel PDF through the actual canvas control.
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'campana-ciudadana-voto-informado.pdf');
    const pdfPath = join(evidence, 'godot-web-campaign.pdf');
    await download.saveAs(pdfPath);
    assert.equal(await download.failure(), null);
    const pdfCheck = spawnSync('python3', [join(root, 'tests/runtime_pdf_check.py'), pdfPath, JSON.stringify(report.poster_input)],
      { cwd: root, encoding: 'utf8', timeout: 45000, maxBuffer: 1024 * 1024 });
    assert.equal(pdfCheck.status, 0, `Downloaded PDF verification failed: ${pdfCheck.error || pdfCheck.stderr}`);
    report.pdf = JSON.parse(pdfCheck.stdout);
    await assertProgress(['printing', 'comparison', 'consultation'], defaultSettings, true);
    await key('Escape');
    await checkpoint('campaign-complete-hud', { reference: 'campaign-complete-hud', referenceCrop: [40, 16, 1240, 152] });
    report.phases.push('Unmarked consultation and follow-up, Inés review/send, physical walk to Luz, nearby printing, fourth completion step, FIN and real PDF download/render/text checks');

    await click(205, 711);
    for (let i = 0; i < 3; i++) { await key('Tab'); await key('Space'); }
    const largeSettings = { ...defaultSettings, large_text: true, muted: true, reduced_motion: true };
    await assertProgress(['printing', 'comparison', 'consultation'], largeSettings, true);
    await key('Tab'); await key('ArrowRight');
    await assertProgress(['printing', 'comparison', 'consultation'], { ...largeSettings, music_volume: .25 }, true);
    await key('ArrowLeft');
    await assertProgress(['printing', 'comparison', 'consultation'], largeSettings, true);
    await key('Escape'); await key('e');
    await checkpoint('ending-large', { panel: true, spacious: true, reference: 'ending-large' });
    await key('Tab');
    await checkpoint('ending-large-download-focused', { panel: true, spacious: true, reference: 'ending-large-download-focused', referenceCrop: crops.body });
    await key('Escape'); await leaveHouse(0); await enterHouse(1); await approachHost();
    await click(140, 765);
    await checkpoint('poster-large-intro', { panel: true, dialogue: true, largeDialogue: true, reference: 'poster-large-intro', referenceCrop: [64, 384, 1216, 752] });
    await choose(2);
    for (const control of ['first', 'second', 'metric', 'question']) {
      await key('Tab'); await posterCheckpoint(`poster-large-${control}`, { visibleFocus: true });
    }
    for (const control of ['metric', 'second', 'first']) {
      await key('Shift+Tab'); await posterCheckpoint(`poster-large-back-${control}`, { visibleFocus: true });
    }
    await key('Tab'); await option(0, 2); await choose(3);
    await posterCheckpoint('poster-large-duplicate-error', { visibleFocus: true });
    await choose(5);
    await key('j'); await choose(3); // Printed completion adds Ver el final before the workshop controls.
    await posterCheckpoint('poster-large-preview');
    await key('Tab'); await posterCheckpoint('poster-large-preview-edit', { visibleFocus: true });
    await choose();
    await posterCheckpoint('poster-large-source');
    await key('Tab'); await posterCheckpoint('poster-large-source-details', { visibleFocus: true });
    await choose();
    await page.mouse.move(1000, 620); await page.mouse.wheel(0, 10000); await page.waitForTimeout(250);
    await posterCheckpoint('poster-large-preview-footer');
    await key('Escape'); await click(205, 711);
    for (let i = 0; i < 3; i++) { await key('Tab'); await key('Space'); }
    await choose(2); await choose(); await key('Escape'); // Pass volume slider, reset, confirm.
    await checkpoint('reset-plaza', { inside: false });
    await assertProgress([]);
    await key('j');
    await posterCheckpoint('journal-reset', { inside: false, sameBody: emptyJournal.body_sha256, deferReference: true });
    await key('Tab'); await key('Tab');
    await posterCheckpoint('journal-reset-end', { inside: false, sameBody: emptyJournalEnd.body_sha256, deferReference: true });
    report.phases.push('Tab/Shift+Tab reveal enlarged workshop controls; enlarged published poster/source/toolbar/footer captured; confirmed reset removes session poster and returns the journal to fresh-session pixels');

    await Promise.all(responseChecks);
    assert.equal(report.served_pack_sha256, report.artifacts['index.pck'], 'Browser loaded the exact recorded export');
    for (const name of artifactFiles) {
      assert.equal(sha256(await readFile(join(root, 'build/web/game', name))), report.artifacts[name], `Export changed during test: ${name}`);
    }
    for (const name of nativeNames) {
      assert.equal(sha256(await readFile(nativePath(name))), report.native_references[name], `Native reference changed during test: ${name}`);
    }
    assert.equal(sha256(await readFile(fileURLToPath(import.meta.url))), report.test_sha256, 'Canvas harness changed during the journey');
    assert.equal(sha256(await readFile(join(root, 'tests/native_window_smoke.py'))), report.native_script_sha256, 'Native pixel oracle changed during the journey');
    assert.equal(sha256(await readFile(join(root, 'tests/runtime_pdf_check.py'))), report.pdf_checker_sha256, 'PDF checker changed during the journey');
    assert.equal(sha256(await readFile(join(evidence, 'native-window.json'))), report.native_run_sha256, 'Native reference run changed during canvas verification');
    for (const [path, fingerprint] of Object.entries(report.source_sha256)) {
      assert.equal(sha256(await readFile(join(root, path))), fingerprint, `Source changed during canvas run: ${path}`);
    }
    assert.deepEqual(report.browser_errors, []);
    assert.deepEqual(report.page_errors, []);
    assert.deepEqual(report.request_failures, []);
    assert.deepEqual(report.reference_mismatches, [], 'Native reference mismatches were retained; inspect the captured rendering differences');
    assert.equal(timedOut, false);
    report.status = 'passed';
    console.log('Godot browser journey passed: WASD-only movement, six decisions, poster workflow, bottom dialogue, Inés dispatch, walk to Luz, printed FIN, real PDF download, enlarged controls, schema-2 private save and reset; zero browser/page errors.');
  } catch (error) {
    report.status = 'failed';
    report.failure = { stage, message: timedOut ? `900-second deadline exceeded: ${error.message}` : error.message };
    if (page && !page.isClosed()) {
      try { await capture('failure', await page.screenshot({ timeout: 3000 }), {}); } catch { /* Original failure is retained. */ }
    }
    throw error;
  } finally {
    clearTimeout(watchdog);
    closing = true;
    report.elapsed_seconds = (Date.now() - started) / 1000;
    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
    await browser?.close();
  }
}

if (process.argv.includes('--self-test')) await selfTest();
else await main();
