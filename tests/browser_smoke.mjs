import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '../.tools/browser/node_modules/playwright/index.mjs';

const executablePath = process.env.BROWSER_EXECUTABLE || '/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8765';
await mkdir('build/evidence', { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${base}/build/web/`);
  await page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 cargado' }).waitFor();
  await page.locator('#reveal-national').click();
  await page.screenshot({ path: 'build/evidence/html-desktop.png', fullPage: true });
  const { assessAnswer } = await import('../web/logic.mjs');
  const data = await (await fetch(`${base}/game/content/ccpc.json`)).json();
  for (const [number, quests] of [[1, ['denominator', 'unknown', 'transfer1']], [2, ['more-count', 'higher-rate', 'combined', 'limit', 'transfer2']]]) {
    for (const quest of quests) {
      const inputs = await page.locator(`input[name="${quest}"]`).evaluateAll(nodes => nodes.map(node => node.value));
      const answer = inputs.find(value => assessAnswer(quest, value, data).correct);
      assert.ok(answer, `A correct answer exists for ${quest}`);
      await page.locator(`input[name="${quest}"][value="${answer}"]`).check();
      await page.locator(`form:has(input[name="${quest}"]) button[type=submit]`).click();
      await page.locator(`#feedback-${quest}.correct`).waitFor();
    }
    await page.locator(`#complete-${number}`).click();
    await page.locator(`[data-next="${number + 1}"]`).click();
    await page.screenshot({ path: `build/evidence/html-chapter-${number + 1}.png`, fullPage: true });
  }
  for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
    await page.locator(`#ballot input[value="${choice}"]`).check();
    await page.locator('#ballot button[type=submit]').click();
    await page.locator('#consultation-result').waitFor({ state: 'visible' });
    await page.locator('#reflection-form input[value=budget]').check();
    await page.locator('#reflection-form button[type=submit]').click();
    await page.locator('#ending').waitFor({ state: 'visible' });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('voces-plaza.web.v1')));
    assert.deepEqual(stored.completedChapters, [1, 2, 3]);
    for (const key of ['choice', 'votes', 'decision', 'result', 'followup']) assert.equal(Object.hasOwn(stored, key), false);
    if (choice !== 'decline') await page.locator('#repeat-consultation').click();
  }
  await page.screenshot({ path: 'build/evidence/html-ending.png', fullPage: true });
  await page.reload();
  await page.locator('#data-status').filter({ hasText: 'Archivo CCPC 2024 cargado' }).waitFor();
  assert.match(await page.locator('#progress-summary').innerText(), /3 de 3/);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `No horizontal page overflow at ${width}px`);
  }
  await page.screenshot({ path: 'build/evidence/html-responsive.png', fullPage: true });
  await page.locator('.settings summary').click();
  await page.locator('#text-size').selectOption('large');
  await page.locator('#reduced-motion').check();
  assert.ok(await page.locator('body.large-text.reduced-motion').count());
  assert.deepEqual(errors, []);
  const game = await context.newPage();
  const gameErrors = [];
  game.on('pageerror', error => gameErrors.push(error.message));
  game.on('console', message => { if (message.type() === 'error') gameErrors.push(message.text()); });
  await game.setViewportSize({ width: 1280, height: 800 });
  await game.goto(`${base}/build/web/game/index.html`);
  await game.locator('#status').waitFor({ state: 'hidden', timeout: 90000 });
  await game.screenshot({ path: 'build/evidence/godot-browser.png' });
  await game.keyboard.press('Escape');
  await game.screenshot({ path: 'build/evidence/godot-plaza.png' });
  assert.deepEqual(gameErrors, []);
  await writeFile('build/evidence/browser-results.json', JSON.stringify({ html: 'passed', allBallotChoices: 'passed', widths: [320, 768, 1440], godotBoot: 'passed', errors, gameErrors }, null, 2));
  console.log('Browser: full HTML journey, five ballot paths, persistence, responsive layouts, and Godot Web boot passed.');
} finally {
  await browser.close();
}
