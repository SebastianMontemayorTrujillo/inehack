// Run from repository root. Native/JS evidence, strict parser, Poppler, parity.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createCampaignPDF } from '../web/campaign-pdf.mjs';

const loadResource = async name => JSON.parse(await readFile(new URL(`../game/content/${name}`, import.meta.url), 'utf8'));
const evidence = new URL('../build/evidence/', import.meta.url);
await mkdir(evidence, { recursive: true });
function run(command, args, input) {
  const result = spawnSync(command, args, { input, maxBuffer: 1e7, timeout: 60000 });
  assert.equal(result.status, 0, `${command}: ${result.stderr?.toString()} ${result.stdout?.toString()}`);
  return result;
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { scope: 'PDF generator only; native headless and Node, not UI download/export acceptance',
  command: 'node tests/campaign_pdf_samples.mjs', created_at: new Date().toISOString(),
  fixture_note: 'long replaces geographic labels; unavailable, near and equal replace historical counts for regression tests',
  source_sha256: {}, samples: [] };
for (const path of ['game/content/ccpc.json', 'game/content/story.json', 'game/content/campaign_font.json',
  'game/content/campaign_layout.json', 'game/scripts/campaign_pdf.gd', 'web/campaign-pdf.mjs',
  'game/scripts/poster_workshop.gd', 'game/scripts/civic_rules.gd', 'web/poster.mjs', 'web/logic.mjs',
  'tests/fixtures/campaign_pdf_cases.json', 'tests/campaign_pdf_samples.gd', 'tests/campaign_pdf_samples.mjs', 'tests/inspect_campaign_pdf.py']) {
  report.source_sha256[path] = sha256(await readFile(new URL(`../${path}`, import.meta.url)));
}
const data = await loadResource('ccpc.json'), story = await loadResource('story.json');
const cases = JSON.parse(await readFile(new URL('./fixtures/campaign_pdf_cases.json', import.meta.url), 'utf8'));
const native = run('./tools/godot', ['--headless', '--path', 'game', '--script', '../tests/campaign_pdf_samples.gd']);
await writeFile(new URL('pink-poster-native.log', evidence), Buffer.concat([native.stdout, native.stderr]));
assert.doesNotMatch(native.stdout + native.stderr, /SCRIPT ERROR:|\nERROR:/);
for (const fixture of cases) {
  const bundle = structuredClone(data);
  for (const record of bundle.records) {
    if (!fixture.overrides?.[record.id]) continue;
    Object.assign(record, fixture.overrides[record.id]);
    record.ln = record.sv + record.nv + record.ns;
    record.participation_pct = record.sv + record.nv ? 100 * record.sv / (record.sv + record.nv) : null;
    record.unknown_pct = record.ln ? 100 * record.ns / record.ln : null;
  }
  const bytes = await createCampaignPDF(bundle, story, fixture.selection, { loadResource });
  assert.deepEqual(bytes, await createCampaignPDF(bundle, story, fixture.selection, { loadResource }), 'JS determinism');
  assert.deepEqual(Buffer.from(bytes), await readFile(new URL(`pink-poster-native-${fixture.name}.pdf`, evidence)), `${fixture.name} native/JS byte parity`);
  await writeFile(new URL(`pink-poster-js-${fixture.name}.pdf`, evidence), bytes);
  const parsed = run('python3', ['tests/inspect_campaign_pdf.py'], bytes);
  assert.equal(parsed.stderr.toString(), '', 'No parser warnings/repair');
  const details = JSON.parse(parsed.stdout);
  const rendered = {};
  for (const runtime of ['native', 'js']) {
    const path = `build/evidence/pink-poster-${runtime}-${fixture.name}`;
    const text = run('pdftotext', [`${path}.pdf`, '-']).stdout.toString().replace(/\s+/g, ' ').trim();
    assert.equal(text, details.text, 'Independent Poppler Spanish extraction');
    run('pdftoppm', ['-scale-to', '1188', '-png', '-singlefile', `${path}.pdf`, path]);
    rendered[`${path}.png`] = sha256(await readFile(`${path}.png`));
  }
  assert.equal(rendered[`build/evidence/pink-poster-native-${fixture.name}.png`],
    rendered[`build/evidence/pink-poster-js-${fixture.name}.png`], 'Native/JS renders are identical');
  const gray = `build/evidence/pink-poster-gray-${fixture.name}`;
  run('pdftoppm', ['-gray', '-scale-to', '1188', '-png', '-singlefile',
    `build/evidence/pink-poster-native-${fixture.name}.pdf`, gray]);
  rendered[`${gray}.png`] = sha256(await readFile(`${gray}.png`));
  report.samples.push({ name: fixture.name, sha256: sha256(bytes),
    bytes: bytes.length, pages: 1, page_points: [612, 792], native_js_identical: true, native_js_renders_identical: true,
    minimum_text_points: Math.min(...details.font_sizes), checked_word_boxes: details.word_count,
    text: details.text, rendered_sha256: rendered });
}
for (const [path, hash] of Object.entries(report.source_sha256)) {
  assert.equal(sha256(await readFile(new URL(`../${path}`, import.meta.url))), hash, `Input changed during sample run: ${path}`);
}
await writeFile(new URL('pink-poster-pdf.json', evidence), JSON.stringify(report, null, 2) + '\n');
console.log(`PINK_POSTER_PDF_PARITY_OK ${cases.length} native/JS pairs; strict pypdf + Poppler, 12 color + 6 grayscale renders`);
