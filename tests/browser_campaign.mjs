import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import { PROGRESS_KEY, contentPaths } from '../web/logic.mjs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8765';
const url = new URL(process.env.HTML_PATH || '/build/web/', `${base}/`);
const evidence = process.env.EVIDENCE_DIR || 'build/evidence';
if (url.pathname.startsWith('/web/') && resolve(evidence) === resolve('build/evidence')) throw Error('Source QA needs a separate EVIDENCE_DIR.');
await mkdir(evidence, { recursive: true });
const story = await (await fetch(new URL(contentPaths('story.json', url.pathname)[0], url))).json();
assert.equal(story.schema_version, '3.0.0');
const browser = await chromium.launch({ headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  args: ['--no-sandbox'] });
const errors = [];
const mediaRangeCancellations = [];
const requests = [];
const hashes = [];
const accessibility = [];
const reveals = [];
const loaded = page => page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 e historia compartida cargados' }).waitFor();
const enter = (page, id) => page.locator(`[data-house="${id}"]`).click();
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function reload(page) {
  await page.waitForLoadState('networkidle');
  await page.reload(); await loaded(page);
}
async function close(context, page) {
  await page.waitForLoadState('networkidle'); await context.close();
}

async function session(chapters = ['printing', 'comparison'], settings = {}, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ acceptDownloads: true, reducedMotion, viewport: { width: 1280, height: 900 } });
  // Seed only neutral completion when there is no save; reloads exercise the
  // app's actual version-3 record in this isolated browser context.
  await context.addInitScript(({ key, chapters, settings }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({ version: 3, completedChapters: chapters, settings }));
  }, { key: PROGRESS_KEY, chapters, settings });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  page.on('requestfailed', request => {
    const error = request.failure()?.errorText;
    // Chromium may cancel a cached OGG byte range and request its tail instead.
    // Keep this observed transport event separate; actual playback and media
    // errors are asserted below, while every other failed request is fatal.
    if (request.resourceType() === 'media' && new URL(request.url()).pathname.endsWith('/assets/audio/sunset-walk.ogg') &&
        request.headers().range?.startsWith('bytes=') && error === 'net::ERR_ABORTED') {
      mediaRangeCancellations.push({ url: request.url(), range: request.headers().range, error });
    } else errors.push(`${request.method()} ${request.url()} ${error}`);
  });
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(url.href); await loaded(page);
  assert.equal(await page.evaluate(() => [...document.fonts].filter(font => font.family === 'Atkinson Hyperlegible' && font.status === 'loaded').length), 2,
    'Regular and bold Atkinson are actually loaded from the shared local resource');
  return { context, page };
}

async function finishConsultation(page, choice) {
  await enter(page, 'hall'); await page.locator('[data-start="consultation"]').click();
  await page.locator(`input[name="decision"][value="${choice}"]`).check();
  await page.locator('#ballot button[type="submit"]').click();
  await page.locator('input[name="followup"][value="needs"]').check();
  await page.locator('#reflection-form button[type="submit"]').click();
  assert.equal(await page.locator('#campaign-title').evaluate(node => node === document.activeElement), true);
  assert.equal(await page.locator('#ending').isVisible(), false);
  assert.equal(await page.locator('#result-content').innerText(), '');
}

async function send(page) {
  await page.locator('#campaign-send').click();
  await page.locator('#campaign-status').filter({ hasText: 'El diseño está listo' }).waitFor();
  assert.equal(await page.locator('#house-hall').isVisible(), true, 'Dispatch does not travel');
  assert.equal(await page.locator('#download-campaign').isVisible(), false, 'No file before printing');
}

async function print(page, skip = 'Enter') {
  await enter(page, 'printshop');
  const started = Date.now();
  await page.locator('#campaign-print').click();
  assert.equal(await page.locator('#ending').evaluate(node => node.tagName), 'DIALOG', 'FIN is a dedicated screen');
  assert.equal(await page.locator('#house-printshop').isVisible(), true, 'Printing does not travel');
  const reduced = await page.evaluate(() => document.body.classList.contains('reduced-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) assert.equal(await page.locator('#print-reveal').isVisible(), false, 'Reduced motion skips the reveal immediately');
  else if (skip) {
    assert.equal(await page.locator('#print-reveal').isVisible(), true);
    if (skip === 'button') await page.locator('#skip-print').click();
    else await page.keyboard.press(skip);
  }
  await page.waitForFunction(() => document.querySelector('#ending').open && !document.querySelector('#ending-finished').hidden);
  const duration = Date.now() - started;
  assert.ok(duration <= 2500, `Print reveal completed within 2.5 seconds (${duration}ms)`);
  reveals.push({ skip: reduced ? 'reduced motion' : skip || 'automatic', duration });
  assert.equal(await page.locator('#ending-title').innerText(), story.campaign.ending_title);
  assert.equal(await page.locator('#ending-title').evaluate(node => node === document.activeElement), true);
  assert.match(await page.locator('#campaign-format').innerText(), /Carta/);
}

async function download(page, name) {
  const downloading = page.waitForEvent('download');
  await page.locator('#download-campaign').click();
  const file = await downloading;
  assert.equal(file.suggestedFilename(), 'cartel-ciudadano.pdf');
  const path = join(evidence, name); await file.saveAs(path);
  assert.equal(await file.failure(), null);
  const bytes = await readFile(path);
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' });
  assert.match(info, /Pages:\s+1\b/); assert.match(info, /Page size:\s+612 x 792 pts \(letter\)/);
  const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' });
  assert.equal(/Latas|INEhack/i.test(text), false);
  for (const word of ['CCPC', '2024', 'NS']) assert.ok(text.includes(word), word);
  return { bytes, text };
}

async function publish(page, metric = 'count') {
  await enter(page, 'archive'); await page.locator('#open-poster-workshop').click();
  for (const [key, value] of Object.entries({ first: 'state_19', second: 'state_02', metric, question: 'voices' })) {
    await page.locator(`#poster-${key}`).selectOption(value);
  }
  await page.locator('#preview-poster').click(); await page.locator('#carry-poster').click();
}

async function checkFinaleLayout(page, phase) {
  const axePath = createRequire(new URL('../.tools/browser/package.json', import.meta.url)).resolve('axe-core/axe.min.js');
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
  assert.deepEqual(result.violations, [], `axe: ${phase}`);
  accessibility.push({ phase, violations: result.violations, incomplete: result.incomplete.map(item => item.id) });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${phase} at ${width}px`);
    if (phase === 'ending') await visibleFinalActions(page, `${width}px`);
    if (phase === 'ending') await page.screenshot({ path: join(evidence, `html-ending-${width}.png`) });
  }
  if (phase === 'ending') await page.locator('#explore-after-ending').click();
  await page.locator('.settings summary').click(); await page.locator('#text-size').selectOption('large');
  const style = await page.addStyleTag({ content: ':root { font-size: 200%; }' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), '32px');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).fontSize), '40px');
  await page.setViewportSize({ width: 768, height: 900 });
  if (phase === 'ending') await page.locator('#reopen-ending').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${phase} large setting and 200% CSS text`);
  if (phase === 'ending') {
    await visibleFinalActions(page, 'large / 200%');
    await page.screenshot({ path: join(evidence, 'html-ending-large-200.png') });
    await page.locator('#explore-after-ending').click();
  }
  await style.evaluate(node => node.remove());
  await page.locator('#text-size').selectOption('normal'); await page.locator('.settings summary').click();
  await page.setViewportSize({ width: 1280, height: 900 });
  if (phase === 'ending') await page.locator('#reopen-press-ending').click();
}

async function visibleFinalActions(page, label) {
  for (const selector of ['#ending-title', '#download-campaign', '#enlarge-campaign', '#explore-after-ending']) {
    const rect = await page.locator(selector).boundingBox();
    const viewport = page.viewportSize();
    assert.ok(rect && rect.y >= 0 && rect.x >= 0 && rect.y + rect.height <= viewport.height && rect.x + rect.width <= viewport.width,
      `${selector} visible without scrolling: ${label}`);
  }
}

try {
  // Every ballot action independently reaches dispatch, press, FIN and a real
  // user-initiated download. Identical default PDFs cannot reveal the ballot.
  let defaultBytes;
  let index = 0;
  for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
    const { context, page } = await session(['printing', 'comparison'], { reducedMotion: index === 4 });
    assert.equal(await page.locator('#background-music').evaluate(node => node.paused), true);
    assert.equal(await page.locator('#background-music').evaluate(node => node.volume), 0.2);
    await finishConsultation(page, choice);
    await page.waitForFunction(() => document.querySelector('#background-music').currentTime > 0);
    assert.equal(await page.locator('#background-music').evaluate(node => node.error), null);
    await send(page);
    assert.match(await page.locator('#campaign-preview').innerText(), /AGUASCALIENTES/);
    if (index === 0) {
      await checkFinaleLayout(page, 'dispatch');
      await reload(page);
      await enter(page, 'printshop'); assert.equal(await page.locator('#campaign-print').isVisible(), false);
      await enter(page, 'hall'); assert.equal(await page.locator('#campaign-status').innerText(), story.campaign.reload_note);
      await send(page);
    }
    await print(page, ['button', 'e', 'Enter', null, null][index]);
    if (index === 0) await checkFinaleLayout(page, 'ending');
    const { bytes } = await download(page, `campaign-default-${index}.pdf`);
    if (defaultBytes) assert.deepEqual(bytes, defaultBytes, 'Ballot never changes PDF bytes');
    else defaultBytes = bytes;
    const again = await download(page, `campaign-repeat-${index}.pdf`);
    assert.deepEqual(again.bytes, bytes, 'Repeat download preserves the frozen PDF');
    await page.locator('#enlarge-campaign').click();
    assert.equal(await page.locator('#ending-poster').isVisible(), true);
    assert.match(await page.locator('#ending-poster').innerText(), /AGUASCALIENTES/);
    assert.equal(/Latas|INEhack|Voces de la Plaza/.test(await page.locator('#ending-poster .composed-poster').innerText()), false);
    assert.deepEqual(await page.locator('#ending-poster .bar-fill').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor)),
      ['rgb(180, 20, 118)', 'rgb(180, 20, 118)'], 'Both states receive the shared pink bar treatment');
    if (index === 0) await page.screenshot({ path: join(evidence, 'html-ending-enlarged-poster.png') });
    await page.locator('#ending-details').evaluate(node => { node.scrollTop = node.scrollHeight; });
    await visibleFinalActions(page, 'expanded poster scrolled');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#ending').isVisible(), false);
    assert.equal(await page.locator('#house-printshop').isVisible(), true, 'Closing FIN preserves location');
    assert.equal(await page.locator('#reopen-press-ending').evaluate(node => node === document.activeElement), true);
    await page.locator('#reopen-press-ending').click();
    assert.equal(await page.locator('#print-reveal').isVisible(), false, 'Reopening never replays the reveal');
    assert.equal(await page.locator('#ending-title').isVisible(), true);
    hashes.push(digest(bytes));
    const progress = await saved(page);
    assert.equal(progress.campaign_printed, true); assert.equal(progress.version, 3);
    assert.deepEqual(Object.keys(progress).sort(), ['assisted', 'campaign_printed', 'completedChapters', 'hints', 'legacyCompleted', 'settings', 'version']);
    assert.equal(/decision|ballot|result|selection|state_01|state_02|pdf|queue/.test(JSON.stringify(progress)), false);
    assert.equal(await page.evaluate(() => sessionStorage.length), 0);
    assert.equal(new URL(page.url()).search + new URL(page.url()).hash, '');
    await reload(page);
    assert.equal(await page.locator('#ending').isVisible(), true);
    assert.equal(await page.locator('#download-campaign').isVisible(), false);
    assert.equal(await page.locator('#download-campaign').getAttribute('href'), null);
    assert.equal(await page.locator('#enlarge-campaign').isVisible(), false, 'No fabricated preview after reload');
    assert.equal(await page.locator('#campaign-reload-note').innerText(), story.campaign.completed_reload);
    await page.locator('#explore-after-ending').click();
    await enter(page, 'hall'); assert.equal(await page.locator('#campaign-dispatch').isVisible(), false);
    await close(context, page); index++;
  }

  const { context, page } = await session(['printing', 'comparison', 'consultation']);
  await publish(page); await send(page);
  await publish(page, 'rate');
  assert.match(await page.locator('#campaign-queued-preview-title').textContent(), /Más registros: NUEVO LEON/,
    'A later publication does not replace the dispatch');
  await enter(page, 'archive'); await page.locator('#open-poster-workshop').click();
  await page.locator('#poster-first').selectOption('state_01'); await page.locator('#preview-poster').click();
  await page.locator('#cancel-poster').click();
  await enter(page, 'hall');
  assert.match(await page.locator('#campaign-queued-preview-title').textContent(), /Más registros: NUEVO LEON/);
  await page.screenshot({ path: join(evidence, 'html-campaign-dispatch.png'), fullPage: true });
  await print(page);
  const custom = await download(page, 'campaign-custom-frozen.pdf');
  assert.match(custom.text, /NUEVO LEON/); assert.notDeepEqual(custom.bytes, defaultBytes);
  await page.screenshot({ path: join(evidence, 'html-campaign-ending.png') });
  await page.locator('#explore-after-ending').click();
  assert.equal(await page.locator('#reopen-press-ending').evaluate(node => node === document.activeElement), true, 'The visible Explore button restores a usable control');
  await publish(page, 'rate');
  await page.locator('#reopen-ending').click();
  await page.locator('#enlarge-campaign').click();
  assert.match(await page.locator('#ending-poster-title').innerText(), /Más registros: NUEVO LEON/,
    'Editing the workshop after printing cannot change the frozen enlarged poster');
  const afterPrintEdit = await download(page, 'campaign-after-print-edit.pdf');
  assert.deepEqual(afterPrintEdit.bytes, custom.bytes);
  await page.locator('#explore-after-ending').click();
  await page.locator('.settings summary').click();
  await page.locator('#music-muted').check();
  await page.locator('#music-volume').focus(); await page.keyboard.press('Home');
  for (let n = 0; n < 35; n++) await page.keyboard.press('ArrowRight');
  assert.equal((await saved(page)).settings.music_volume, 0.35);
  await reload(page);
  assert.equal(await page.locator('#background-music').evaluate(node => node.muted), true);
  assert.equal(await page.locator('#background-music').evaluate(node => node.volume), 0.35);
  await page.locator('#explore-after-ending').click();
  await enter(page, 'printshop');
  assert.equal(await page.locator('#background-music').evaluate(node => node.paused), true, 'Mute survives first interaction after reload');
  await page.locator('.settings summary').click(); await page.locator('#music-muted').uncheck();
  await page.waitForFunction(() => !document.querySelector('#background-music').paused);
  assert.equal(await page.locator('#background-music').evaluate(node => node.error), null);
  await page.locator('#reset-progress').click();
  assert.equal((await saved(page)).campaign_printed, false);
  assert.deepEqual((await saved(page)).completedChapters, []);
  assert.equal((await saved(page)).settings.music_volume, 0.2);
  assert.equal(await page.locator('#plaza').isVisible(), true, 'Reset starts in the plaza');
  await enter(page, 'printshop');
  assert.equal(await page.locator('#campaign-print').isVisible(), false);
  assert.equal(await page.locator('#download-campaign').getAttribute('href'), null);
  assert.equal(await page.locator('#house-printshop').isVisible(), true);
  await close(context, page);

  const replacement = await session(['printing', 'comparison', 'consultation']);
  await publish(replacement.page); await send(replacement.page); await publish(replacement.page, 'rate');
  let release;
  let signal;
  const started = new Promise(resolve => { signal = resolve; });
  await replacement.page.route('**/campaign_font.json', async route => {
    const response = await route.fetch();
    await new Promise(resolve => { release = resolve; signal(); });
    await route.fulfill({ response });
  });
  await replacement.page.locator('#campaign-send').click(); await started;
  assert.equal(await replacement.page.locator('#campaign-send').isEnabled(), false);
  await replacement.page.locator('#campaign-cancel').click(); release();
  await replacement.page.waitForLoadState('networkidle');
  assert.match(await replacement.page.locator('#campaign-queued-preview-title').textContent(), /Más registros: NUEVO LEON/);
  assert.equal(await replacement.page.locator('#campaign-send').isEnabled(), true);
  await replacement.page.unroute('**/campaign_font.json');
  await replacement.page.route('**/campaign_font.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"schema_version":0}' }));
  await replacement.page.locator('#campaign-send').click();
  await replacement.page.locator('#campaign-status').filter({ hasText: story.campaign.error }).waitFor();
  assert.match(await replacement.page.locator('#campaign-queued-preview-title').textContent(), /Más registros: NUEVO LEON/);
  await replacement.page.unroute('**/campaign_font.json');
  await send(replacement.page);
  assert.match(await replacement.page.locator('#campaign-queued-preview-title').textContent(), /Mayor proporción: NUEVO LEON/);
  await print(replacement.page);
  const changed = await download(replacement.page, 'campaign-explicit-replacement.pdf');
  assert.notDeepEqual(changed.bytes, custom.bytes, 'Only explicit replacement changes the print');
  await close(replacement.context, replacement.page);

  const systemMotion = await session(['printing', 'comparison', 'consultation'], {}, 'reduce');
  await enter(systemMotion.page, 'hall'); await send(systemMotion.page); await print(systemMotion.page);
  await close(systemMotion.context, systemMotion.page);

  const interrupted = await session(['printing', 'comparison', 'consultation']);
  await enter(interrupted.page, 'hall'); await send(interrupted.page);
  await enter(interrupted.page, 'printshop'); await interrupted.page.locator('#campaign-print').click();
  assert.equal(await interrupted.page.locator('#print-reveal').isVisible(), true);
  assert.equal((await saved(interrupted.page)).campaign_printed, true, 'Printing commits once before the reveal');
  await interrupted.page.keyboard.press('Escape');
  assert.equal(await interrupted.page.locator('#house-printshop').isVisible(), true);
  await interrupted.page.locator('#reopen-press-ending').click();
  assert.equal(await interrupted.page.locator('#print-reveal').isVisible(), false, 'An interrupted reveal is never replayed');
  await close(interrupted.context, interrupted.page);

  assert.equal(requests.some(request => request.method !== 'GET' || new URL(request.url).origin !== url.origin), false, 'No response telemetry or external requests');
  assert.deepEqual(errors, [], 'All runtime, console and network checks remain strict');
  const result = { url: url.href, browser: browser.version(), finale: 'passed', allFiveActions: 'passed',
    downloads: 'actual local files; one Letter page; repeated bytes identical; no submission branding',
    defaultHashes: hashes, customHash: digest(custom.bytes), replacementHash: digest(changed.bytes),
    snapshotCancellation: 'passed: draft and async generation cancellation; failed replacement preserves queue', queuedReload: 'recreate at Inés', completedReload: 'completion without regenerated PDF',
    audio: 'interaction start, 20% default, persisted mute/35% volume, reset; no media errors',
    mediaRangeCancellations, privacy: 'passed', accessibility, reveals,
    widths: [320, 768, 1440], text200Percent: 'passed (CSS text enlargement; native zoom not tested)', errors };
  await writeFile(join(evidence, 'browser-campaign-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
