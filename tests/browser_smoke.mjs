import assert from 'node:assert/strict';
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';
import { assessActivity, contentPaths, resolveConsultation, PROGRESS_KEY } from '../web/logic.mjs';

// Default: assembled final HTML, its packaged JSON, and Godot boot/screenshots.
// Source QA: HTML_PATH=/web/ SKIP_GODOT=1 EVIDENCE_DIR=/tmp/voces-rv09
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8765';
const htmlURL = new URL(process.env.HTML_PATH || '/build/web/', `${base}/`);
const evidence = process.env.EVIDENCE_DIR || 'build/evidence';
if (htmlURL.pathname.startsWith('/web/') && resolve(evidence) === resolve('build/evidence')) {
  throw Error('Source QA must use EVIDENCE_DIR outside final build/evidence.');
}
const executablePath = process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const json = async file => {
  const response = await fetch(new URL(contentPaths(file, htmlURL.pathname)[0], htmlURL));
  assert.equal(response.ok, true, `Served ${file} exists`);
  return response.json();
};
const [data, story] = await Promise.all([json('ccpc.json'), json('story.json')]);
assert.equal(story.schema_version, '3.0.0', 'Test the revised content, not an old export');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const errors = [];
const gameErrors = [];
let axeResult = { status: 'not available; no dependency installed' };
const loaded = page => page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 e historia compartida cargados' }).waitFor();
const screenshot = (page, file) => page.screenshot({ path: join(evidence, file), fullPage: true });
const assertFocus = async (page, selector) => assert.equal(await page.locator(selector).evaluate(node => node === document.activeElement), true, `Focus: ${selector}`);

// The main journey reaches controls using Tab/Arrow/Enter/Space, without focus(), check(), or click().
async function tabTo(page, selector) {
  const target = page.locator(selector).first();
  assert.equal(await target.isVisible(), true, `Visible keyboard target: ${selector}`);
  for (let i = 0; i < 160; i++) {
    if (await target.evaluate(node => node === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  assert.fail(`Keyboard cannot reach ${selector}`);
}
async function activate(page, selector) {
  await tabTo(page, selector);
  const outline = await page.locator(selector).first().evaluate(node => getComputedStyle(node).outlineStyle);
  assert.notEqual(outline, 'none', `Visible focus: ${selector}`);
  await page.keyboard.press('Enter');
}
async function choose(page, name, value) {
  const values = await page.locator(`input[name="${name}"]`).evaluateAll(nodes => nodes.map(node => node.value));
  assert.ok(values.includes(value));
  const checked = await page.locator(`input[name="${name}"]:checked`).count();
  await tabTo(page, checked ? `input[name="${name}"]:checked` : `input[name="${name}"]`);
  for (let i = 0; i < values.length; i++) {
    if (await page.evaluate(() => document.activeElement.value) === value) break;
    await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.press('Space');
  assert.equal(await page.locator(`input[name="${name}"][value="${value}"]`).isChecked(), true);
}
async function selectWithKeys(page, selector, value) {
  const values = await page.locator(`${selector} option`).evaluateAll(options => options.map(option => option.value));
  assert.ok(values.includes(value));
  await tabTo(page, selector); await page.keyboard.press('Home');
  for (let i = 0; i < values.indexOf(value); i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(selector).inputValue(), value);
}
async function enter(page, id) {
  await activate(page, `[data-house="${id}"]`); await assertFocus(page, `#house-title-${id}`);
}
async function storage(page) {
  // Only this app's non-sensitive test save, in a new isolated browser context.
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY);
}
async function checkStructure(page) {
  const issues = await page.locator('main').evaluate(main => {
    const result = [];
    for (const input of main.querySelectorAll('input, select')) {
      if (input.checkVisibility() && !input.labels?.length && !input.getAttribute('aria-label')) result.push('unlabelled input');
    }
    for (const table of main.querySelectorAll('table')) {
      if (!table.caption || !table.querySelector('th[scope="col"]')) result.push('table without caption/column headings');
    }
    for (const section of main.querySelectorAll('section[aria-labelledby]')) {
      if (!document.getElementById(section.getAttribute('aria-labelledby'))) result.push('broken section label');
    }
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    if (ids.length !== new Set(ids).size) result.push('duplicate IDs');
    return result;
  });
  assert.deepEqual(issues, []);
}
async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label);
}
async function checkTextContrast(page) {
  const failures = await page.evaluate(() => {
    const rgb = text => text.match(/[\d.]+/g).map(Number);
    const luminance = color => rgb(color).slice(0, 3).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
    return [...document.querySelectorAll('p, h1, h2, h3, h4, legend, label, summary, a, button, .bar-label, .bar-value')]
      .filter(node => node.checkVisibility() && node.textContent.trim() && !node.disabled).flatMap(node => {
        const style = getComputedStyle(node);
        let ancestor = node;
        while (ancestor && rgb(getComputedStyle(ancestor).backgroundColor)[3] === 0) ancestor = ancestor.parentElement;
        const background = ancestor ? getComputedStyle(ancestor).backgroundColor : 'rgb(255, 255, 255)';
        const values = [luminance(style.color), luminance(background)].sort((a, b) => b - a);
        const ratio = (values[0] + 0.05) / (values[1] + 0.05);
        const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.67 && Number(style.fontWeight) >= 700);
        return ratio + 0.01 < (large ? 3 : 4.5) ? [{ text: node.textContent.slice(0, 60), ratio }] : [];
      });
  });
  assert.deepEqual(failures, [], 'Rendered text contrast (solid backgrounds; not a full WCAG audit)');
}
async function independentQuest(page, chapter, house) {
  await enter(page, house); await activate(page, `[data-start="${chapter}"]`);
  await assertFocus(page, `#task-title-${chapter}`);
  const activities = story.activities.filter(a => a.chapter === chapter);
  for (let index = 0; index < activities.length; index++) {
    const activity = activities[index];
    assert.equal(await page.locator('.activity:visible').count(), 1, 'One decision at a time');
    const section = page.locator(`#activities-${chapter}`);
    assert.equal(await section.locator('legend').innerText(), activity.prompt);
    assert.equal(await section.locator('.explanation').isVisible(), false, 'No unsolicited solution');
    assert.equal((await section.ariaSnapshot()).includes(activity.explanation), false, 'No solution in the accessible tree');
    if (index === 0) {
      await checkTextContrast(page);
      await screenshot(page, `html-task-${chapter}.png`);
      assert.match(await section.ariaSnapshot(), /group|radio/);
    }
    const answer = activity.choices.find(choice => assessActivity(activity, choice.id, data, story).correct)?.id;
    assert.ok(answer, `Available answer: ${activity.id}`);
    if (index === 0 && chapter === 'printing') {
      const wrong = activity.choices.find(choice => choice.id !== answer).id;
      await choose(page, activity.id, wrong);
      await activate(page, `#activities-${chapter} button[type="submit"]`);
      assert.equal((await page.locator(`#feedback-${activity.id}`).innerText()).includes(activity.explanation), false);
      await activate(page, `#activities-${chapter} [data-retry-activity]`);
      await assertFocus(page, `#activity-title-${activity.id}`);
    }
    await choose(page, activity.id, answer);
    await activate(page, `#activities-${chapter} button[type="submit"]`);
    assert.match(await page.locator(`#feedback-${activity.id}`).innerText(), /sin (abrir )?apoyo/);
    assert.equal(await page.locator(`#feedback-${activity.id}`).evaluate(node => node.classList.contains('correct')), true);
    await checkStructure(page);
    if (index < activities.length - 1) {
      assert.equal(await page.locator(`#complete-${chapter}`).isEnabled(), false);
      await activate(page, `#activities-${chapter} [data-next-activity]`);
      await assertFocus(page, `#activity-title-${activities[index + 1].id}`);
    }
  }
  await activate(page, `#complete-${chapter}`);
  await assertFocus(page, `#artifact-title-${chapter}`);
  assert.equal(await page.locator(`#artifact-${chapter}`).isVisible(), true);
  assert.match(await page.locator(`#speech-${house}`).innerText(), chapter === 'printing' ? /Ahora habla con Mateo/ : /Ahora habla con Inés/);
  assert.equal(await page.locator(`[data-start="${chapter}"]`).evaluate(node => node.classList.contains('quiet')), true, 'Review is secondary after completion');
  if (chapter === 'comparison') {
    const poster = await page.locator('#artifact-comparison').innerText();
    assert.match(poster, /Antes: «Más registros = mayor proporción/);
    assert.match(poster, /Más registros: BAJA CALIFORNIA/);
    assert.match(poster, /Mayor proporción: AGUASCALIENTES/);
  }
  await screenshot(page, chapter === 'printing' ? 'html-chapter-2.png' : 'html-comparison.png');
  await page.keyboard.press('Escape'); await assertFocus(page, `[data-house="${house}"]`);
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const requests = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  await page.goto(htmlURL.href); await loaded(page);
  assert.equal(await page.locator('#background-music').evaluate(node => node.paused), true, 'No autoplay before interaction');
  assert.equal(await page.locator('#background-music').evaluate(node => node.volume), 0.2);
  await screenshot(page, 'html-desktop.png');
  for (const id of ['printshop', 'archive', 'hall']) assert.equal(await page.locator(`[data-house="${id}"]`).isEnabled(), true);
  await enter(page, 'hall');
  await page.waitForFunction(() => !document.querySelector('#background-music').paused && document.querySelector('#background-music').currentTime > 0);
  assert.equal(await page.locator('.projects article').count(), 3);
  assert.equal(await page.locator('#ballot').isVisible(), false);
  assert.match(await page.locator('#blocked-consultation').innerText(), /boletín.*cartel/i);
  assert.match(await page.locator('#speech-hall').innerText(), /Primero.*Luz/);
  assert.equal((await page.locator('#speech-hall').innerText()).includes(story.chapters.find(chapter => chapter.id === 'consultation').intro), false);
  await page.keyboard.press('Escape'); await assertFocus(page, '[data-house="hall"]');
  await enter(page, 'archive');
  assert.equal(await page.locator('#blocked-comparison').isVisible(), true);
  assert.match(await page.locator('#speech-archive').innerText(), /Primero.*Luz/);
  assert.equal(await page.locator('#open-poster-workshop').isVisible(), false, 'Workshop is optional after the comparison mission');
  await activate(page, '#house-archive [data-leave]'); await assertFocus(page, '[data-house="archive"]');

  await enter(page, 'printshop');
  assert.equal(await page.locator('#campaign-press').isVisible(), true, 'The press is a distinct object');
  assert.equal(await page.locator('#campaign-print').isVisible(), false, 'The press cannot start or finish the first lesson');
  assert.equal(await page.locator('#campaign-press [data-start]').count(), 0, 'Only the host offers lessons');
  assert.equal(await page.locator('#house-printshop > .speech-card [data-start="printing"]').count(), 1);
  assert.equal((await storage(page)).campaign_printed, false);
  await activate(page, '#house-printshop [data-leave]');

  await independentQuest(page, 'printing', 'printshop');
  await enter(page, 'hall');
  assert.match(await page.locator('#speech-hall').innerText(), /Ya ayudaste a Luz.*Mateo.*casa del centro/);
  assert.equal(await page.locator('[data-start="consultation"]').isVisible(), false);
  await page.keyboard.press('Escape');
  await independentQuest(page, 'comparison', 'archive');
  assert.deepEqual((await storage(page)).hints, []);
  assert.deepEqual((await storage(page)).assisted, []);
  await screenshot(page, 'html-chapter-3.png');

  // Author with actual keyboard input; draft edits must never replace publication until carried.
  const progressBeforePoster = await storage(page);
  await enter(page, 'archive'); await activate(page, '#open-poster-workshop');
  await assertFocus(page, '#poster-workshop-title');
  assert.equal(await page.locator('#poster-first option').count(), 32);
  assert.equal(await page.locator('#poster-first option[value="national"]').count(), 0);
  await selectWithKeys(page, '#poster-first', 'state_19');
  await selectWithKeys(page, '#poster-second', 'state_02');
  await selectWithKeys(page, '#poster-metric', 'count');
  await selectWithKeys(page, '#poster-question', 'voices');
  await activate(page, '#preview-poster'); await assertFocus(page, '#poster-preview-title');
  assert.equal(await page.locator('#poster-preview-title').innerText(), 'Más registros: NUEVO LEON.');
  await activate(page, '#poster-preview .source-details summary');
  const posterEvidence = await page.locator('#poster-preview').innerText();
  for (const text of ['INE', '2024', '2,303,911', '1,832,065', '330,295', '4,466,271', '4,135,976',
    story.poster_workshop.limit, story.poster_workshop.questions.find(q => q.id === 'voices').text]) assert.ok(posterEvidence.includes(text), text);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await noOverflow(page, `Poster editor and exact sources at ${width}px`); await checkStructure(page); await checkTextContrast(page);
    if (width === 320) {
      assert.equal(await page.locator('#poster-question-text').isVisible(), true, 'Full selected question is readable when a native select truncates it');
      assert.equal(await page.locator('#poster-question-text').innerText(), story.poster_workshop.questions.find(q => q.id === 'voices').text);
      assert.equal(await page.locator('#poster-metric-text').innerText(), story.poster_workshop.count_label);
    }
  }
  await screenshot(page, 'html-poster-preview.png');
  await activate(page, '#carry-poster'); await assertFocus(page, '#poster-meeting-title');
  assert.equal(await page.locator('#house-hall').isVisible(), true);
  assert.equal(await page.locator('#ballot').isVisible(), false, 'Carrying never opens the ballot');
  assert.match(await page.locator('#poster-meeting').innerText(), /Más registros: NUEVO LEON/);
  assert.match(await page.locator('#poster-meeting .speech-card').innerText(), /Inés/, 'Inés acknowledges the carried poster within the meeting artifact');
  assert.ok((await page.locator('#poster-meeting').innerText()).includes(story.poster_workshop.questions.find(q => q.id === 'voices').text));
  assert.ok((await page.locator('#poster-meeting').innerText()).includes(story.poster_workshop.memory_note));
  await screenshot(page, 'html-poster-meeting.png');

  await enter(page, 'archive'); await activate(page, '#open-poster-workshop');
  assert.equal(await page.locator('#poster-first').inputValue(), 'state_19');
  await selectWithKeys(page, '#poster-metric', 'rate');
  assert.equal(await page.locator('#carry-poster').isEnabled(), false, 'Edited selections need a new preview');
  await activate(page, '#preview-poster');
  assert.equal(await page.locator('#poster-preview-title').innerText(), 'Mayor proporción: NUEVO LEON.');
  assert.match(await page.locator('#poster-preview').innerText(), /55\.70416753/);
  await activate(page, '#cancel-poster'); await assertFocus(page, '#open-poster-workshop');
  assert.match(await page.locator('#poster-archive').innerText(), /Más registros: NUEVO LEON/);
  assert.equal(await page.locator('#poster-workshop').isVisible(), false);

  await activate(page, '#open-poster-workshop');
  assert.equal(await page.locator('#poster-metric').inputValue(), 'count', 'Cancel discards the draft only');
  await selectWithKeys(page, '#poster-metric', 'rate'); await activate(page, '#preview-poster'); await activate(page, '#carry-poster');
  assert.match(await page.locator('#poster-meeting').innerText(), /Mayor proporción: NUEVO LEON/);
  assert.equal(await page.locator('#poster-meeting').count(), 1);
  await enter(page, 'archive');
  assert.match(await page.locator('#poster-archive').innerText(), /Mayor proporción: NUEVO LEON/);
  await activate(page, '#open-poster-workshop'); await selectWithKeys(page, '#poster-second', 'state_19');
  await activate(page, '#preview-poster'); await assertFocus(page, '#poster-second');
  assert.match(await page.locator('#poster-error').innerText(), /dos estados distintos/);
  assert.equal(await page.locator('#carry-poster').isEnabled(), false);
  await page.keyboard.press('Escape'); await assertFocus(page, '#open-poster-workshop');
  assert.match(await page.locator('#poster-archive').innerText(), /Mayor proporción: NUEVO LEON/);
  await page.keyboard.press('Escape'); await assertFocus(page, '[data-house="archive"]');
  assert.match(await page.locator('#poster-exhibit').innerText(), /Mayor proporción: NUEVO LEON/);
  assert.deepEqual(await storage(page), progressBeforePoster, 'Poster does not enter progress or assessment data');
  assert.equal(await page.evaluate(() => sessionStorage.length), 0);
  assert.equal(new URL(page.url()).search, ''); assert.equal(new URL(page.url()).hash, '');

  for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
    if (await page.locator('#ending').isVisible()) await activate(page, '#explore-after-ending');
    await enter(page, 'hall'); await activate(page, '[data-start="consultation"]');
    await choose(page, 'decision', choice); await activate(page, '#ballot button[type="submit"]');
    await assertFocus(page, '#consultation-result');
    const result = resolveConsultation(choice, 'baseline', story);
    assert.match(await page.locator('#result-content').innerText(), new RegExp(`${result.participants} participantes`));
    for (const id of ['A', 'B', 'C']) assert.equal(await page.locator(`#result-content [data-count="${id}"]`).innerText(), String(result.counts[id]));
    assert.equal(await page.locator('#ballot input:checked').count(), 0);
    await choose(page, 'followup', 'budget'); await activate(page, '#reflection-form button[type="submit"]');
    if (choice === 'A') {
      await assertFocus(page, '#campaign-title');
      assert.equal(await page.locator('#house-hall').isVisible(), true);
      assert.equal(await page.locator('#ending').isVisible(), false, 'The consultation leads to dispatch, not premature completion');
      await activate(page, '#campaign-send');
      await page.locator('#campaign-status').filter({ hasText: 'El diseño está listo' }).waitFor();
      await enter(page, 'printshop'); await activate(page, '#campaign-print');
      await assertFocus(page, '#skip-print'); await page.keyboard.press('e');
      await assertFocus(page, '#ending-title');
      const file = page.waitForEvent('download'); await activate(page, '#download-campaign');
      const download = await file; await download.saveAs(join(evidence, 'html-campaign.pdf'));
      assert.equal((await readFile(join(evidence, 'html-campaign.pdf'))).subarray(0, 5).toString(), '%PDF-');
    }
    if (choice !== 'A') {
      await assertFocus(page, '#ending-title');
      assert.equal(await page.locator('#print-reveal').isVisible(), false, 'Replaying the consultation returns to FIN immediately');
      assert.equal(await page.locator('#house-hall').isVisible(), true, 'Ending does not travel');
    }
    const saved = await storage(page);
    assert.deepEqual(saved.completedChapters, ['printing', 'comparison', 'consultation']);
    assert.deepEqual(Object.keys(saved).sort(), ['assisted', 'campaign_printed', 'completedChapters', 'hints', 'legacyCompleted', 'settings', 'version']);
    assert.equal(saved.campaign_printed, true);
    assert.equal(new URL(page.url()).search, '');
    assert.equal(await page.locator('#result-content').innerText(), '', 'Leaving discards option-linked outcomes');
  }
  assert.equal(requests.some(r => r.method !== 'GET' || new URL(r.url).origin !== htmlURL.origin), false, 'No response telemetry');
  await screenshot(page, 'html-ending.png');
  await page.reload(); await loaded(page);
  for (const slot of ['archive', 'exhibit', 'meeting']) {
    assert.equal(await page.locator(`#poster-${slot}`).isVisible(), false, 'Reload never invents or restores authorship');
    assert.equal(await page.locator(`#poster-${slot}`).innerText(), '');
  }
  assert.equal(await page.locator('#plaza').isVisible(), true);
  assert.equal(await page.locator('#ending').isVisible(), true);
  assert.equal(await page.locator('#download-campaign').isVisible(), false, 'No regenerated personalized download after reload');
  assert.equal(await page.locator('#campaign-reload-note').innerText(), story.campaign.completed_reload);
  assert.match(await page.locator('#progress-summary').innerText(), /3 de 3/);
  assert.equal(await page.locator('#result-content').innerText(), '');
  await activate(page, '#explore-after-ending');
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await noOverflow(page, `Plaza at ${width}px`);
    for (const house of ['printshop', 'archive', 'hall']) {
      await enter(page, house); await noOverflow(page, `${house} at ${width}px`); await checkStructure(page);
      const chapter = story.houses.find(h => h.id === house).chapter;
      await activate(page, `[data-start="${chapter}"]`);
      await noOverflow(page, `${house} task at ${width}px`);
      if (chapter !== 'consultation') {
        await activate(page, `#activities-${chapter} .source-details summary`);
        await noOverflow(page, `${house} exact table at ${width}px`);
      }
      await checkTextContrast(page);
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    }
  }
  await activate(page, '.settings summary');
  await tabTo(page, '#text-size'); await page.keyboard.press('End'); await page.keyboard.press('Tab');
  await tabTo(page, '#reduced-motion'); await page.keyboard.press('Space');
  assert.equal(await page.locator('body.large-text.reduced-motion').count(), 1);
  await page.addStyleTag({ content: ':root { font-size: 200%; }' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), '32px');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).fontSize), '40px');
  await page.setViewportSize({ width: 768, height: 1000 });
  await noOverflow(page, '200% text enlargement and large setting');
  await enter(page, 'printshop'); await activate(page, '[data-start="printing"]');
  await noOverflow(page, '200% text in active task');
  await screenshot(page, 'html-responsive.png');
  await page.reload(); await loaded(page);
  await activate(page, '#explore-after-ending');

  // An existing local axe installation is optional; never fetch a remote script.
  let axePath = process.env.AXE_PATH;
  if (!axePath) {
    try { axePath = createRequire(new URL('../.tools/browser/package.json', import.meta.url)).resolve('axe-core/axe.min.js'); } catch { /* optional */ }
  }
  if (axePath) {
    await access(axePath); await page.addScriptTag({ path: axePath });
    const checks = [];
    for (const house of ['printshop', 'archive', 'hall']) {
      await enter(page, house); await activate(page, `[data-start="${story.houses.find(h => h.id === house).chapter}"]`);
      const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
      checks.push({ house, violations: result.violations, incomplete: result.incomplete.map(item => item.id) });
      assert.deepEqual(result.violations, [], `axe: ${house}`);
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    }
    await enter(page, 'archive'); await activate(page, '#open-poster-workshop'); await activate(page, '#preview-poster');
    for (const phase of ['poster-preview', 'poster-meeting']) {
      if (phase === 'poster-meeting') await activate(page, '#carry-poster');
      const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
      checks.push({ house: phase, violations: result.violations, incomplete: result.incomplete.map(item => item.id) });
      assert.deepEqual(result.violations, [], `axe: ${phase}`);
    }
    axeResult = { status: 'passed', checks };
  }

  const supportContext = await browser.newContext(); const support = await supportContext.newPage();
  await support.goto(htmlURL.href); await loaded(support);
  await enter(support, 'printshop'); await activate(support, '[data-start="printing"]');
  await activate(support, '[data-example]'); assert.equal(await support.locator('.explanation').isVisible(), true);
  await activate(support, '[data-assist]');
  assert.match(await support.locator('#feedback-participation-reading').innerText(), /Completado con apoyo/);
  await support.keyboard.press('Escape'); await assertFocus(support, '[data-start="printing"]');
  await support.keyboard.press('Escape'); await assertFocus(support, '[data-house="printshop"]');
  await support.reload(); await loaded(support);
  assert.deepEqual((await storage(support)).completedChapters, []);
  assert.deepEqual((await storage(support)).assisted, ['participation-reading']);
  for (const [house, chapter] of [['printshop', 'printing'], ['archive', 'comparison']]) {
    await enter(support, house); await activate(support, `[data-start="${chapter}"]`);
    const items = story.activities.filter(a => a.chapter === chapter);
    for (let i = 0; i < items.length; i++) {
      await activate(support, `#activities-${chapter} [data-assist]`);
      assert.equal(await support.locator(`#feedback-${items[i].id}`).evaluate(node => node.classList.contains('correct')), false, 'Support is not an independently correct answer');
      if (i < items.length - 1) await activate(support, `#activities-${chapter} [data-next-activity]`);
    }
    await activate(support, `#complete-${chapter}`);
    assert.match(await support.locator(`#artifact-${chapter}`).innerText(), /Publicado con apoyo/);
    await support.keyboard.press('Escape');
  }
  assert.deepEqual((await storage(support)).assisted, story.activities.map(a => a.id));
  await supportContext.close();

  // Close rates must remain readable even when both rounded labels say 50/100.
  const closeContext = await browser.newContext();
  await closeContext.addInitScript(key => localStorage.setItem(key, JSON.stringify({ version: 2,
    completedChapters: ['printing'], legacyCompleted: [], hints: [], assisted: [], settings: {} })), PROGRESS_KEY);
  const closePage = await closeContext.newPage();
  const closeData = structuredClone(data);
  for (const [id, sv] of [['state_01', 1000], ['state_02', 1001]]) {
    Object.assign(closeData.records.find(r => r.id === id), { sv, nv: sv + 1, ns: 0, ln: 2 * sv + 1,
      participation_pct: 100 * sv / (2 * sv + 1), unknown_pct: 0 });
  }
  await closePage.route('**/ccpc.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(closeData) }));
  await closePage.goto(htmlURL.href); await loaded(closePage);
  await enter(closePage, 'archive'); await activate(closePage, '[data-start="comparison"]');
  await activate(closePage, '[data-assist]'); await activate(closePage, '[data-next-activity]');
  assert.match(await closePage.locator('#activities-comparison').innerText(), /BAJA CALIFORNIA tiene una proporción ligeramente mayor/);
  await choose(closePage, 'higher-rate', 'state_02'); await activate(closePage, '.activity button[type="submit"]');
  assert.equal(await closePage.locator('#feedback-higher-rate.correct').count(), 1);
  await activate(closePage, '[data-next-activity]'); await activate(closePage, '[data-assist]'); await activate(closePage, '#complete-comparison');
  await activate(closePage, '#open-poster-workshop'); await selectWithKeys(closePage, '#poster-metric', 'rate'); await activate(closePage, '#preview-poster');
  assert.match(await closePage.locator('#poster-preview').innerText(), /cifras redondeadas se parecen/);
  assert.match(await closePage.locator('#poster-preview').innerText(), /fracciones exactas/);
  assert.match(await closePage.locator('#poster-preview').innerText(), /49\.97501249/);
  assert.match(await closePage.locator('#poster-preview-title').innerText(), /BAJA CALIFORNIA/);
  await closeContext.close();

  const metadataContext = await browser.newContext();
  await metadataContext.addInitScript(key => localStorage.setItem(key, JSON.stringify({ version: 2,
    completedChapters: ['printing', 'comparison'], legacyCompleted: [], hints: [], assisted: [], settings: {} })), PROGRESS_KEY);
  const metadataPage = await metadataContext.newPage();
  const metadataErrors = []; metadataPage.on('pageerror', error => metadataErrors.push(error.message));
  const withoutLevels = structuredClone(data);
  for (const record of withoutLevels.records) delete record.geography_level;
  withoutLevels.records.find(record => record.id === 'state_19').geography_level = 'national';
  await metadataPage.route('**/ccpc.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(withoutLevels) }));
  await metadataPage.goto(htmlURL.href); await loaded(metadataPage);
  await enter(metadataPage, 'archive'); await activate(metadataPage, '#open-poster-workshop');
  assert.equal(await metadataPage.locator('#poster-first option').count(), 32);
  await selectWithKeys(metadataPage, '#poster-first', 'state_19'); await activate(metadataPage, '#preview-poster'); await activate(metadataPage, '#carry-poster');
  assert.match(await metadataPage.locator('#poster-meeting-title').innerText(), /Más registros: NUEVO LEON/);
  assert.deepEqual(metadataErrors, []); await metadataContext.close();

  // Deliberately synthetic replacement in an isolated test; never a shipped CCPC record.
  const zeroContext = await browser.newContext(); const zero = await zeroContext.newPage();
  const zeroData = structuredClone(data);
  Object.assign(zeroData.records.find(r => r.id === 'national'), { sv: 0, nv: 0, ns: 10, ln: 10, participation_pct: null, unknown_pct: 100 });
  await zero.route('**/ccpc.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(zeroData) }));
  await zero.goto(htmlURL.href); await loaded(zero);
  await enter(zero, 'printshop'); await activate(zero, '[data-start="printing"]');
  assert.equal(await zero.locator('.activity button[type="submit"]').isEnabled(), false);
  assert.match(await zero.locator('#feedback-participation-reading').innerText(), /No hay información suficiente/);
  await activate(zero, '[data-assist]');
  assert.match(await zero.locator('#feedback-participation-reading').innerText(), /Completado con apoyo/);
  assert.equal(await zero.locator('#feedback-participation-reading.correct').count(), 0);
  await activate(zero, '[data-next-activity]');
  await choose(zero, 'unknown', 'separate'); await activate(zero, '.activity button[type="submit"]');
  assert.equal(await zero.locator('#feedback-unknown.correct').count(), 1, 'Unknown classification remains meaningful after an unavailable national rate');
  await activate(zero, '[data-next-activity]'); await choose(zero, 'unknown-transfer', 'unknown');
  await activate(zero, '.activity button[type="submit"]'); await activate(zero, '#complete-printing');
  assert.match(await zero.locator('#artifact-printing').innerText(), /No hay registros con información conocida/);
  await zeroContext.close();

  const legacyContext = await browser.newContext();
  await legacyContext.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ version: 1,
    completedChapters: [1, 2, 3], hints: ['transfer1', 'transfer2'], mastery: true, decision: 'B' })), { key: PROGRESS_KEY });
  const legacy = await legacyContext.newPage(); await legacy.goto(htmlURL.href); await loaded(legacy);
  assert.match(await legacy.locator('#legacy-notice').innerText(), /no.*actividades nuevas/i);
  assert.deepEqual((await storage(legacy)).legacyCompleted, ['printing', 'comparison', 'consultation']);
  assert.equal(await legacy.locator('#ending').isVisible(), false, 'Legacy consultation completion does not invent a printed campaign');
  await enter(legacy, 'hall'); assert.equal(await legacy.locator('#campaign-dispatch').isVisible(), true); await legacyContext.close();

  const failedContext = await browser.newContext(); const failed = await failedContext.newPage();
  await failed.route('**/story.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"schema_version":"1.0.0"}' }));
  await failed.goto(htmlURL.href); await failed.locator('#retry-data').waitFor({ state: 'visible' });
  assert.equal(await failed.locator('.activity').count(), 0);
  assert.match(await failed.locator('#data-status').innerText(), /historia compartida/);
  await failed.unroute('**/story.json'); await activate(failed, '#retry-data'); await loaded(failed); await failedContext.close();

  const noStorageContext = await browser.newContext();
  await noStorageContext.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw Error('Storage denied for test'); } }));
  const noStorage = await noStorageContext.newPage(); await noStorage.goto(htmlURL.href); await loaded(noStorage);
  await activate(noStorage, '.settings summary'); assert.match(await noStorage.locator('#storage-status').innerText(), /no está disponible/);
  await enter(noStorage, 'printshop'); await activate(noStorage, '[data-start="printing"]'); await activate(noStorage, '[data-assist]');
  assert.match(await noStorage.locator('#feedback-participation-reading').innerText(), /con apoyo/);
  await noStorage.keyboard.press('Escape'); await noStorage.keyboard.press('Escape');
  for (const [house, chapter] of [['printshop', 'printing'], ['archive', 'comparison']]) {
    await enter(noStorage, house); await activate(noStorage, `[data-start="${chapter}"]`);
    for (let i = 0; i < 3; i++) {
      await activate(noStorage, `#activities-${chapter} [data-assist]`);
      if (i < 2) await activate(noStorage, `#activities-${chapter} [data-next-activity]`);
    }
    await activate(noStorage, `#complete-${chapter}`); await noStorage.keyboard.press('Escape');
  }
  await enter(noStorage, 'archive'); await activate(noStorage, '#open-poster-workshop'); await activate(noStorage, '#preview-poster'); await activate(noStorage, '#carry-poster');
  assert.equal(await noStorage.locator('#poster-meeting').isVisible(), true, 'Workshop works without any storage');
  await activate(noStorage, '#reset-progress');
  for (const slot of ['archive', 'exhibit', 'meeting']) assert.equal(await noStorage.locator(`#poster-${slot}`).innerText(), '');
  assert.match(await noStorage.locator('#progress-summary').innerText(), /0 de 3/);
  await enter(noStorage, 'archive'); assert.equal(await noStorage.locator('#open-poster-workshop').isVisible(), false);
  await noStorageContext.close();
  assert.deepEqual(errors, []);

  const godotBoot = process.env.SKIP_GODOT === '1' ? 'not run (source QA only)' : 'passed';
  if (process.env.SKIP_GODOT !== '1') {
    const classroom = await context.newPage();
    for (const name of ['classroom.html', 'classroom-handout.html', 'classroom-handout.pdf']) {
      const response = await context.request.get(new URL(name, htmlURL).href);
      assert.equal(response.ok(), true, `Classroom resource: ${name}`);
      if (name.endsWith('.pdf')) assert.equal((await response.body()).subarray(0, 5).toString(), '%PDF-');
    }
    await classroom.setViewportSize({ width: 320, height: 900 });
    await classroom.goto(new URL('classroom.html', htmlURL).href);
    await noOverflow(classroom, 'Teacher guide at 320px');
    await classroom.getByRole('link', { name: 'Abrir e imprimir la hoja', exact: true }).click();
    await noOverflow(classroom, 'Printable sheet HTML at 320px');
    await classroom.close();
    const game = await context.newPage();
    game.on('pageerror', error => gameErrors.push(error.message));
    game.on('console', message => { if (message.type() === 'error') gameErrors.push(message.text()); });
    await game.setViewportSize({ width: 1280, height: 800 });
    await game.goto(new URL(process.env.GODOT_PATH || './game/index.html', htmlURL).href);
    await game.locator('#status').waitFor({ state: 'hidden', timeout: 90000 });
    await game.screenshot({ path: join(evidence, 'godot-browser.png') });
    await game.keyboard.press('Escape');
    await game.screenshot({ path: join(evidence, 'godot-plaza.png') });
    assert.deepEqual(gameErrors, []);
  }
  const result = { html: 'passed', url: htmlURL.href, browser: browser.version(), keyboardJourney: 'passed',
    activities: story.activities.map(a => a.id), allBallotChoices: 'passed', assistance: 'passed', zeroNationalContinuation: 'passed', closeRatesReadable: 'passed', legacyMigration: 'passed',
    posterWorkshop: 'passed: keyboard state_19/state_02 count/rate, preview, cancel, revise, archive/exhibit/meeting, source, narrow layout, reset/reload/no storage, unchanged tally and progress',
    failClosedContent: 'passed', storageUnavailable: 'passed', semanticChecks: 'passed', textContrast: 'passed (rendered solid backgrounds)', widths: [320, 768, 1024, 1440],
    text200Percent: 'passed (CSS text enlargement; native browser zoom not tested)',
    classroomResources: process.env.SKIP_GODOT === '1' ? 'not run (source QA only)' : 'passed',
    axe: axeResult, screenReader: 'not rerun for schema-3 HTML; prior Orca observations remain historical', godotBoot, errors, gameErrors };
  await writeFile(join(evidence, 'browser-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
