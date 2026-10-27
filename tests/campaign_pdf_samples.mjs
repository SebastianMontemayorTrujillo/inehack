// Run from repository root. Native/JS evidence, strict parser, Poppler, parity.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createCampaignPDF } from '../web/campaign-pdf.mjs';

const loadResource = async name => JSON.parse(await readFile(new URL(`../game/content/${name}`, import.meta.url), 'utf8'));
const data = await loadResource('ccpc.json'), story = await loadResource('story.json');
const cases = JSON.parse(await readFile(new URL('./fixtures/campaign_pdf_cases.json', import.meta.url), 'utf8'));
const evidence = new URL('../build/evidence/', import.meta.url);
await mkdir(evidence, { recursive: true });
function run(command, args, input) {
  const result = spawnSync(command, args, { input, maxBuffer: 1e7, timeout: 60000 });
  assert.equal(result.status, 0, `${command}: ${result.stderr?.toString()} ${result.stdout?.toString()}`);
  return result;
}
const native = run('./tools/godot', ['--headless', '--path', 'game', '--script', '../tests/campaign_pdf_samples.gd']);
await writeFile(new URL('campaign-pdf-native.log', evidence), Buffer.concat([native.stdout, native.stderr]));
assert.doesNotMatch(native.stdout + native.stderr, /SCRIPT ERROR:|\nERROR:/);
const report = { scope: 'PDF generator only; native headless and Node, not UI download/export acceptance',
  fixture_note: 'long replaces geographic labels; unavailable, near and equal replace historical counts for regression tests', samples: [] };
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
  assert.deepEqual(Buffer.from(bytes), await readFile(new URL(`campaign-native-${fixture.name}.pdf`, evidence)), `${fixture.name} native/JS byte parity`);
  await writeFile(new URL(`campaign-js-${fixture.name}.pdf`, evidence), bytes);
  const parsed = run('python3', ['tests/inspect_campaign_pdf.py'], bytes);
  assert.equal(parsed.stderr.toString(), '', 'No parser warnings/repair');
  const details = JSON.parse(parsed.stdout);
  for (const runtime of ['native', 'js']) {
    const path = `build/evidence/campaign-${runtime}-${fixture.name}`;
    const text = run('pdftotext', [`${path}.pdf`, '-']).stdout.toString().replace(/\s+/g, ' ').trim();
    assert.equal(text, details.text, 'Independent Poppler Spanish extraction');
    run('pdftoppm', ['-scale-to', '1188', '-png', '-singlefile', `${path}.pdf`, path]);
  }
  report.samples.push({ name: fixture.name, sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length, pages: 1, page_points: [612, 792], native_js_identical: true, text: details.text });
}
await writeFile(new URL('campaign-pdf.json', evidence), JSON.stringify(report, null, 2) + '\n');
console.log(`CAMPAIGN_PDF_PARITY_OK ${cases.length} native/JS pairs; strict pypdf + Poppler, 12 rendered pages`);
