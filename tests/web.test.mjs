import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  aggregateRecords, validateDataset, loadDataset, assessAnswer,
  SCENARIOS, createRoster, resolveConsultation, resolveTally,
  sanitizeProgress, readProgress, writeProgress, gameHref, creditsHref, normalizeStory,
  contentPaths, transferExercises,
} from '../web/logic.mjs';
import * as logic from '../web/logic.mjs';

const canonicalStory = () => JSON.parse(readFileSync(new URL('../game/content/story.json', import.meta.url)));
const canonicalData = () => JSON.parse(readFileSync(new URL('../game/content/ccpc.json', import.meta.url)));

test('campaign requires every chapter, defaults to the sourced example, and only prints after dispatch', async () => {
  const { createCampaignSession } = await import('../web/poster.mjs');
  const calls = [];
  const session = createCampaignSession({ data: canonicalData(), story: canonicalStory(),
    createPDF: async (...args) => { calls.push(args); return new TextEncoder().encode('%PDF-test'); } });
  const progress = sanitizeProgress(null);
  assert.equal(session.print(progress), false);
  for (const chapter of ['printing', 'comparison', 'consultation']) {
    assert.equal(await session.queue(progress), false);
    progress.completedChapters.push(chapter);
  }
  assert.equal(await session.queue(progress), true);
  assert.deepEqual(session.selection, { first: 'state_01', second: 'state_02', metric: 'rate', question: 'missing' });
  assert.equal(session.download(), null, 'No file before using the press');
  assert.equal(await session.queue(progress), false, 'Replacing a queue must be explicit');
  assert.equal(session.print(progress), true);
  assert.equal(progress.campaign_printed, true);
  assert.equal(session.print(progress), true, 'Printing is idempotent');
  assert.equal(await session.queue(progress, null, true), false, 'A completed campaign cannot silently change');
  assert.equal(calls.length, 1);
  const bytes = session.download(); bytes[0] = 0;
  assert.equal(new TextDecoder().decode(session.download()), '%PDF-test', 'Downloads cannot mutate retained bytes');
});

test('campaign snapshots a publication before async generation; cancel, failure and reset preserve the right queue', async () => {
  const { createCampaignSession } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const progress = sanitizeProgress({ version: 3, completedChapters: ['printing', 'comparison', 'consultation'] });
  let finish;
  const session = createCampaignSession({ data, story, createPDF: () => new Promise(resolve => { finish = resolve; }) });
  const selection = { first: 'state_19', second: 'state_02', metric: 'count', question: 'voices', ballot: 'private' };
  const pending = session.queue(progress, selection);
  assert.equal(session.busy, true);
  selection.first = 'state_01';
  finish(new TextEncoder().encode('%PDF-original')); await pending;
  assert.deepEqual(session.selection, { first: 'state_19', second: 'state_02', metric: 'count', question: 'voices' });
  const replacement = session.queue(progress, selection, true);
  session.cancel(); finish(new TextEncoder().encode('%PDF-cancelled'));
  assert.equal(await replacement, false);
  assert.equal(session.selection.first, 'state_19');
  const failure = session.queue(progress, selection, true); finish(new Uint8Array());
  await assert.rejects(failure, /PDF/);
  assert.equal(session.selection.first, 'state_19', 'Failed replacement preserves publication');
  const success = session.queue(progress, selection, true); finish(new TextEncoder().encode('%PDF-replaced')); await success;
  assert.equal(session.selection.first, 'state_01');
  assert.equal(session.print(progress), true);
  assert.equal(new TextDecoder().decode(session.download()), '%PDF-replaced');
  session.clear();
  assert.equal(session.selection, null); assert.equal(session.download(), null);
  progress.campaign_printed = false;
  const resetPending = session.queue(progress); session.clear(); finish(new TextEncoder().encode('%PDF-late'));
  assert.equal(await resetPending, false); assert.equal(session.ready, false);
});

test('the printed preview and bytes stay frozen across replay, later edits and cancelled replacement', async () => {
  const { createCampaignSession, composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const selected = { first: 'state_19', second: 'state_02', metric: 'count', question: 'voices' };
  const expected = structuredClone(composePoster(data, story, selected));
  let calls = 0;
  const session = createCampaignSession({ data, story,
    createPDF: async () => { calls++; return new TextEncoder().encode('%PDF-frozen'); } });
  const progress = sanitizeProgress({ version: 3, completedChapters: ['printing', 'comparison', 'consultation'] });
  assert.equal(session.poster, null);
  await session.queue(progress, selected);
  data.records.find(record => record.id === selected.first).geography_name = 'Edited after dispatch';
  story.poster_workshop.questions.find(question => question.id === 'voices').text = 'Edited question';
  session.print(progress);
  const copy = session.poster;
  assert.deepEqual(copy, expected);
  copy.records[0].geography_name = 'Edited preview';
  selected.first = 'state_01';
  assert.equal(await session.queue(progress, selected, true), false);
  session.cancel();
  assert.equal(session.print(progress), true);
  assert.deepEqual(session.poster, expected);
  assert.equal(calls, 1, 'Replay does not generate or replace a print');
  session.clear();
  assert.equal(session.poster, null);
  assert.equal(session.print(progress), false, 'Saved completion cannot fabricate a session print');
});

test('version 3 migrates old progress and allowlists only completion and bounded audio settings', () => {
  for (const version of [1, 2]) {
    const saved = sanitizeProgress({ version, campaign_printed: true,
      completedChapters: version === 1 ? [1, 2, 3] : ['printing', 'comparison', 'consultation'] });
    assert.equal(saved.version, 3); assert.equal(saved.campaign_printed, false);
    assert.equal(saved.settings.muted, false); assert.equal(saved.settings.music_volume, 0.2);
  }
  const saved = sanitizeProgress({ version: 3, completedChapters: ['printing', 'comparison', 'consultation'],
    campaign_printed: true, selection: { first: 'state_19' }, pdf: [37, 80], queue: 'private', ballot: 'private',
    settings: { music_volume: 0.35, muted: true, ballot: 'private' } });
  assert.equal(saved.campaign_printed, true);
  assert.equal(saved.settings.music_volume, 0.35); assert.equal(saved.settings.muted, true);
  assert.equal(/private|state_19|pdf|queue|ballot/.test(JSON.stringify(saved)), false);
  assert.equal(sanitizeProgress({ version: 3, campaign_printed: true }).campaign_printed, false);
  for (const [volume, expected] of [[-1, 0], [4, 1], [NaN, 0.2], [null, 0.2], ['0.9', 0.2]]) {
    assert.equal(sanitizeProgress({ version: 3, settings: { music_volume: volume } }).settings.music_volume, expected);
  }
});

test('poster workshop contract requires shared labels, limits and exactly three named discussion questions', () => {
  const shared = canonicalStory();
  assert.deepEqual(normalizeStory(shared).poster_workshop, shared.poster_workshop);
  for (const mutate of [
    s => { delete s.poster_workshop; },
    s => { s.poster_workshop.memory_note = ''; },
    s => { s.poster_workshop.first_label = null; },
    s => { s.poster_workshop.questions.pop(); },
    s => { s.poster_workshop.questions[0].id = 'project-A'; },
    s => { s.poster_workshop.questions[1].id = 'missing'; },
    s => { s.poster_workshop.questions[2].text = ''; },
  ]) {
    const changed = canonicalStory(); mutate(changed);
    assert.equal(normalizeStory(changed), null);
  }
});

test('all 496 bundled state pairs compose count and rate posters from an exact reference, in either order', async () => {
  const { composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const before = JSON.stringify({ data, story });
  const states = data.records.filter(r => r.geography_level === 'state');
  assert.equal(states.length, 32);
  let pairs = 0;
  for (let i = 0; i < states.length; i++) for (let j = i + 1; j < states.length; j++) {
    pairs++;
    const [a, b] = [states[i], states[j]];
    for (const metric of ['count', 'rate']) {
      const left = BigInt(a.sv) * (metric === 'rate' ? BigInt(b.sv) + BigInt(b.nv) : 1n);
      const right = BigInt(b.sv) * (metric === 'rate' ? BigInt(a.sv) + BigInt(a.nv) : 1n);
      const expected = left === right ? story.comparison_artifact[`equal_${metric}`] :
        story.comparison_artifact[metric].replace('{place}', (left > right ? a : b).geography_name);
      for (const [first, second] of [[a.id, b.id], [b.id, a.id]]) {
        const selection = { first, second, metric, question: 'voices' };
        const poster = composePoster(data, story, selection);
        assert.equal(poster.finding, expected, `${first}/${second}/${metric}`);
        assert.equal(poster.metric, metric);
        assert.deepEqual(poster.records.map(r => r.id), [first, second]);
        assert.equal(poster.question, story.poster_workshop.questions.find(q => q.id === 'voices').text);
        assert.deepEqual(selection, { first, second, metric, question: 'voices' });
      }
    }
  }
  assert.equal(pairs, 496);
  assert.equal(JSON.stringify({ data, story }), before, 'Composition is pure');
});

test('poster composition fails closed for invalid selections, records or canonical content', async () => {
  const { composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const valid = { first: 'state_19', second: 'state_02', metric: 'count', question: 'missing' };
  for (const selection of [null, {}, [], { ...valid, first: 'national' }, { ...valid, second: 'state_19' },
    { ...valid, first: 'state_99' }, { ...valid, metric: 'turnout' }, { ...valid, question: '__proto__' }]) {
    assert.equal(composePoster(data, story, selection), null);
  }
  for (const mutate of [
    d => { d.records = d.records.filter(r => r.id !== 'state_19'); },
    d => { d.records.find(r => r.id === 'state_19').ln++; },
    d => { d.records.find(r => r.id === 'state_19').year = 2025; },
  ]) {
    const changed = canonicalData(); mutate(changed);
    assert.equal(composePoster(changed, story, valid), null);
  }
  const incomplete = canonicalStory(); delete incomplete.poster_workshop.questions;
  assert.equal(composePoster(data, incomplete, valid), null);
  assert.equal(composePoster(null, story, valid), null);
});

test('poster state identities follow validated canonical IDs even without optional geography metadata', async () => {
  const { composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const selection = { first: 'state_19', second: 'state_02', metric: 'count', question: 'missing' };
  for (const record of data.records) delete record.geography_level;
  data.records.find(record => record.id === 'state_19').geography_level = 'national';
  assert.equal(validateDataset(data), data, 'The existing contract identifies records by canonical ID');
  assert.equal(composePoster(data, story, selection)?.finding, 'Más registros: NUEVO LEON.');
  assert.equal(composePoster(data, story, { ...selection, first: 'national' }), null);
});

test('poster ties, zero classified records and unknown classification never invent an ordering', async () => {
  const { composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const replace = (id, sv, nv, ns) => Object.assign(data.records.find(r => r.id === id), {
    sv, nv, ns, ln: sv + nv + ns, participation_pct: sv + nv ? 100 * sv / (sv + nv) : null,
    unknown_pct: sv + nv + ns ? 100 * ns / (sv + nv + ns) : null,
  });
  const selection = { first: 'state_19', second: 'state_02', metric: 'rate', question: 'followup' };
  replace('state_19', 20, 20, 100); replace('state_02', 60, 60, 0);
  assert.equal(composePoster(data, story, selection).finding, story.comparison_artifact.equal_rate);
  replace('state_19', 60, 40, 0);
  assert.equal(composePoster(data, story, { ...selection, metric: 'count' }).finding, story.comparison_artifact.equal_count);
  const original = composePoster(data, story, selection).finding;
  replace('state_19', 60, 40, 1000000);
  assert.equal(composePoster(data, story, selection).finding, original, 'NS is not NV or the classified denominator');
  replace('state_19', 0, 0, 10);
  assert.equal(composePoster(data, story, selection).finding, story.comparison_artifact.unavailable);
  replace('state_02', 0, 0, 0);
  assert.equal(composePoster(data, story, { ...selection, metric: 'count' }).finding, story.comparison_artifact.equal_count);
});

test('reusable exact comparator distinguishes near-rounded and overflow-sized ratios for quiz and poster', () => {
  const a = { id: 'state_01', sv: 4000000000000000, nv: 3999999999999999, ns: 0, ln: 7999999999999999 };
  const b = { id: 'state_02', sv: 4000000000000001, nv: 4000000000000000, ns: 0, ln: 8000000000000001 };
  assert.equal(100 * a.sv / a.ln, 100 * b.sv / b.ln, 'IEEE-754 rounds these two distinct ratios together');
  assert.equal(logic.compareRecord(a, b, 'rate'), 'state_01');
  assert.equal(logic.compareRecord(a, b, 'count'), 'state_02');
  assert.equal(logic.assessActivity('higher-rate', 'state_01', { records: [a, b] }, canonicalStory()).correct, true);
  assert.equal(logic.compareRecord(a, b, 'unknown'), 'unavailable');
  assert.equal(logic.compareRecord(a, null, 'count'), 'unavailable');
  assert.equal(logic.compareRecord({ ...a, sv: -1 }, b, 'rate'), 'unavailable');
});

test('poster composition neither alters consultation outcomes nor enters the progress allowlist', async () => {
  const { composePoster } = await import('../web/poster.mjs');
  const data = canonicalData(); const story = canonicalStory();
  const selection = { first: 'state_19', second: 'state_02', metric: 'rate', question: 'followup' };
  const before = ['A', 'B', 'C', 'unmarked', 'decline'].map(choice => resolveConsultation(choice, 'baseline', story));
  const poster = composePoster(data, story, selection);
  assert.deepEqual(['A', 'B', 'C', 'unmarked', 'decline'].map(choice => resolveConsultation(choice, 'baseline', story)), before);
  const progress = sanitizeProgress({ version: 2, completedChapters: ['printing', 'comparison'], poster, selection });
  assert.deepEqual(Object.keys(progress).sort(), ['assisted', 'campaign_printed', 'completedChapters', 'hints', 'legacyCompleted', 'settings', 'version']);
  assert.equal(JSON.stringify(progress).includes('state_19'), false);
});

test('the corrected poster states the actual count and rate findings, including changed or unavailable records', () => {
  const story = canonicalStory();
  const data = { records: [
    { id: 'state_01', geography_name: 'A', sv: 20, nv: 20, ns: 0, ln: 40 },
    { id: 'state_02', geography_name: 'B', sv: 60, nv: 140, ns: 0, ln: 200 },
  ] };
  assert.equal(logic.comparisonCaption(data, story), 'Más registros: B.\nMayor proporción: A.');
  Object.assign(data.records[0], { sv: 100, nv: 0, ln: 100 });
  assert.equal(logic.comparisonCaption(data, story), 'Más registros: A.\nMayor proporción: A.');
  Object.assign(data.records[0], { sv: 0, nv: 0, ln: 0 });
  assert.match(logic.comparisonCaption(data, story), /Falta información/);
});

// Deliberately synthetic: never presented as official CCPC observations.
function fixture() {
  const record = (id, geography_name, sv, nv, ns) => ({
    id, geography_name, year: 2024, ln: sv + nv + ns, sv, nv, ns,
    participation_pct: sv + nv ? 100 * sv / (sv + nv) : null,
    unknown_pct: sv + nv + ns ? 100 * ns / (sv + nv + ns) : null,
  });
  return {
    schema_version: '1.0.0', dataset_id: 'ccpc-2024-v1',
    source: { url: 'https://example.org/source.zip', portal_url: 'https://example.org/portal',
      retrieved_at_utc: '2026-10-24T12:00:00Z', sha256: 'a'.repeat(64), dictionary_path: 'dictionary.md' },
    records: [record('national', 'Nacional', 60, 30, 10),
      record('state_01', 'Aguascalientes', 60, 40, 5), record('state_02', 'Baja California', 120, 180, 10)],
    validation: { reconciliation_passed: true },
  };
}

test('participation excludes NS; unknown share uses LN; aggregate sums before dividing', () => {
  const data = fixture();
  const national = aggregateRecords([data.records[0]]);
  assert.equal(national.classified, 90);
  assert.equal(national.participation_pct, 100 * 60 / 90);
  assert.equal(national.unknown_pct, 10);
  const both = aggregateRecords(data.records.slice(1));
  assert.equal(both.participation_pct, 45);
  assert.notEqual(both.participation_pct, 50);
});

test('zero denominators remain null rather than inventing zero rates', () => {
  assert.equal(aggregateRecords([{ ln: 5, sv: 0, nv: 0, ns: 5 }]).participation_pct, null);
  assert.equal(aggregateRecords([{ ln: 0, sv: 0, nv: 0, ns: 0 }]).unknown_pct, null);
});

test('runtime contract rejects inconsistent, duplicate, unsafe, wrong-year and unsupported records', () => {
  assert.equal(validateDataset(fixture()).records.length, 3);
  for (const mutate of [
    d => { d.records[0].ln++; }, d => { d.records[0].sv = -1; },
    d => { d.records[0].year = 2025; }, d => { d.records[0].participation_pct = 10; },
    d => { d.records[1].id = 'national'; }, d => { d.source.url = 'javascript:alert(1)'; },
    d => { d.source.sha256 = 'unverified'; }, d => { d.records[0].ns = NaN; },
    d => { d.records.pop(); }, d => { d.dataset_id = 'other'; },
    d => { d.records[0].sv = Number.MAX_SAFE_INTEGER + 1; },
    d => { d.source.dictionary_path = ''; },
  ]) {
    const data = fixture(); mutate(data);
    assert.throws(() => validateDataset(data));
  }
});

test('accepts the full 33-record bundle while requiring national and the two quest states', () => {
  const data = fixture();
  for (let n = 3; n <= 32; n++) data.records.push({ ...data.records[1], id: `state_${String(n).padStart(2, '0')}` });
  assert.equal(validateDataset(data).records.length, 33);
  data.records[32].id = 'state_99';
  assert.throws(() => validateDataset(data));
});

test('loading uses shared source first and exported content fallback, validates either', async () => {
  const paths = [];
  const data = await loadDataset(async path => {
    paths.push(path);
    return { ok: paths.length > 1, json: async () => fixture() };
  });
  assert.deepEqual(paths, ['../game/content/ccpc.json', './content/ccpc.json']);
  assert.equal(data.dataset_id, 'ccpc-2024-v1');
  const invalid = fixture(); invalid.records[0].ln++;
  await assert.rejects(() => loadDataset(async () => ({ ok: true, json: async () => invalid })), /datos verificados/i);
  await assert.rejects(() => loadDataset(async () => { throw Error('offline'); }), /reintentar/i);
});

test('browser content paths select source only for /web/ and package content everywhere else', async () => {
  for (const file of ['ccpc.json', 'story.json']) {
    for (const path of ['/web/', '/web/index.html']) assert.deepEqual(contentPaths(file, path), [`../game/content/${file}`]);
    for (const path of ['/build/web/', '/build/web/index.html', '/', '/index.html', '/voces/index.html']) {
      assert.deepEqual(contentPaths(file, path), [`./content/${file}`]);
    }
  }
  const paths = [];
  await loadDataset(async path => { paths.push(path); return { ok: true, json: async () => fixture() }; }, '/build/web/');
  assert.deepEqual(paths, ['./content/ccpc.json']);
  const missing = [];
  await assert.rejects(() => loadDataset(async path => { missing.push(path); return { ok: false }; }, '/build/web/'));
  assert.deepEqual(missing, ['./content/ccpc.json']);
});

test('quest explanations and count/rate answers respond to changed shared records', () => {
  const data = fixture();
  assert.equal(assessAnswer('denominator', 'classified', data).correct, true);
  assert.equal(assessAnswer('denominator', 'ln', data).correct, false);
  assert.match(assessAnswer('unknown', 'nv', data).message, /clasificaci/i);
  assert.equal(assessAnswer('more-count', 'state_02', data).correct, true);
  assert.equal(assessAnswer('higher-rate', 'state_01', data).correct, true);
  assert.equal(assessAnswer('combined', 'sum-first', data).correct, true);
  assert.equal(assessAnswer('combined', 'average', data).correct, false);
  data.records[1] = { ...data.records[1], sv: 240, nv: 160, ln: 405 };
  assert.equal(assessAnswer('more-count', 'state_01', data).correct, true);
  assert.equal(assessAnswer('higher-rate', 'state_01', data).correct, true);
  assert.equal(assessAnswer('transfer1', '66.67', data).correct, true);
  assert.equal(assessAnswer('transfer2', '33.33', data).correct, true);
  assert.equal(assessAnswer('limit', 'motives', data).correct, false);
});

test('transfer cases match Godot: classified 60/90 and combined 80/240, not a mean of rates', () => {
  const exercises = transferExercises();
  assert.match(exercises.transfer1.question, /SV = 60, NV = 30, NS = 10 y LN = 100/);
  assert.equal(exercises.transfer1.correctAnswer, '66.67');
  assert.match(exercises.transfer2.question, /SV = 20 y NV = 20/);
  assert.match(exercises.transfer2.question, /SV = 60 y NV = 140/);
  assert.equal(exercises.transfer2.correctAnswer, '33.33');
  assert.equal(assessAnswer('transfer1', '60', fixture()).correct, false);
  assert.equal(assessAnswer('transfer2', '40', fixture()).correct, false);
  assert.match(assessAnswer('transfer2', '33.33', fixture()).message, /80 ÷ 240/);
});

test('optional shared assessment fixtures drive both prompts and accepted answers', () => {
  const assessments = {
    printing: { ln: 25, sv: 12, nv: 8, ns: 5 },
    comparison: [{ ln: 100, sv: 60, nv: 40, ns: 0 }, { ln: 300, sv: 120, nv: 180, ns: 0 }],
  };
  const exercises = transferExercises(assessments);
  assert.equal(exercises.transfer1.correctAnswer, '60');
  assert.equal(exercises.transfer2.correctAnswer, '45');
  assert.equal(assessAnswer('transfer2', '45', fixture(), assessments).correct, true);
  assert.equal(assessAnswer('transfer2', '33.33', fixture(), assessments).correct, false);
  const shared = canonicalStory(); shared.assessment_fixtures = assessments;
  assert.deepEqual(normalizeStory(shared).assessment_fixtures, assessments);
  assert.equal(transferExercises({ printing: { sv: -1 } }).transfer1.correctAnswer, '66.67');
});

test('equal and missing state rates have honest supported answers', () => {
  const data = fixture();
  data.records[2] = { ...data.records[2], sv: 180, nv: 120, ln: 310 };
  assert.equal(assessAnswer('higher-rate', 'equal', data).correct, true);
  data.records[2] = { ...data.records[2], sv: 0, nv: 0, ln: 10 };
  assert.equal(assessAnswer('higher-rate', 'unavailable', data).correct, true);
  assert.equal(assessAnswer('not-a-quest', 'anything', data).correct, false);
});

test('synthetic scenarios use the same deterministic roster of 30 with A12/B10/C8 preferences', () => {
  const roster = createRoster();
  assert.equal(roster.length, 30);
  assert.deepEqual(['A', 'B', 'C'].map(option => roster.filter(n => n.preference === option).length), [12, 10, 8]);
  assert.equal(new Set(roster.map(n => n.id)).size, 30);
  assert.deepEqual(createRoster(), roster);
  assert.deepEqual(Object.values(SCENARIOS).map(s => Object.values(s).reduce((a, b) => a + b)), [16, 25, 25]);
});

test('31st participant may choose any option, leave unmarked or decline without changing NPCs', () => {
  for (const scenario of Object.keys(SCENARIOS)) {
    for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
      const result = resolveConsultation(choice, scenario);
      const base = SCENARIOS[scenario];
      assert.equal(result.population, 31);
      assert.equal(result.participants, Object.values(base).reduce((a, b) => a + b) + (choice === 'decline' ? 0 : 1));
      for (const option of ['A', 'B', 'C']) assert.equal(result.counts[option], base[option] + (choice === option ? 1 : 0));
      assert.equal(result.unmarked, choice === 'unmarked' ? 1 : 0);
      assert.deepEqual(result, resolveConsultation(choice, scenario));
    }
  }
  assert.equal(resolveConsultation('decline', 'base').winner, 'A');
  assert.equal(resolveConsultation('decline', 'more-a').winner, 'A');
  assert.equal(resolveConsultation('decline', 'more-b').winner, 'B');
  assert.throws(() => resolveConsultation('invalid'));
  assert.throws(() => resolveConsultation('A', 'random'));
});

test('ties trigger a second decision rather than automatically favoring A', () => {
  assert.deepEqual(resolveTally({ A: 8, B: 8, C: 3 }), { winner: null, tied: ['A', 'B'], needsSecondDecision: true });
  assert.deepEqual(resolveTally({ A: 0, B: 0, C: 0 }).tied, ['A', 'B', 'C']);
});

test('persistence whitelists chapter completion, settings and hints only, never ballot or revealing outcome', () => {
  const progress = sanitizeProgress({
    version: 1, completedChapters: [1, 1, 3, 9], settings: { textSize: 'large', reducedMotion: true, vote: 'B' },
    hints: ['denominator', 'denominator', 'vote:B'], vote: 'B', outcome: { A: 8, B: 6, C: 3 },
    reflection: 'private', attempts: { B: 1 },
  });
  assert.deepEqual(progress, { version: 3, completedChapters: ['printing', 'consultation'], legacyCompleted: ['printing', 'consultation'], campaign_printed: false,
    settings: { textSize: 'large', reducedMotion: true, muted: false, music_volume: 0.2 }, hints: [], assisted: [] });
  let saved;
  const storage = { setItem: (key, value) => { saved = value; }, getItem: () => saved };
  assert.equal(writeProgress(storage, { ...progress, vote: 'B', outcome: 'B' }), true);
  assert.deepEqual(readProgress(storage), progress);
  assert.equal(saved.includes('outcome'), false);
  assert.equal(saved.includes('vote'), false);
});

test('unavailable, malformed, or old localStorage fails gracefully', () => {
  const unavailable = { getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } };
  assert.deepEqual(readProgress(unavailable).completedChapters, []);
  assert.equal(writeProgress(unavailable, {}), false);
  assert.deepEqual(readProgress({ getItem: () => '{broken' }).completedChapters, []);
  assert.deepEqual(readProgress({ getItem: () => JSON.stringify({ version: 0, completedChapters: [1] }) }).completedChapters, []);
  assert.deepEqual(readProgress(null).completedChapters, []);
});

test('Godot link supports the source checkout and packages hosted at root or a subpath', () => {
  assert.equal(gameHref('/web/index.html'), '../build/web/game/index.html');
  assert.equal(gameHref('/web/'), '../build/web/game/index.html');
  assert.equal(gameHref('/build/web/index.html'), './game/index.html');
  assert.equal(gameHref('/index.html'), './game/index.html');
  assert.equal(gameHref('/voces/index.html'), './game/index.html');
  for (const path of ['/web/', '/web/index.html']) assert.equal(creditsHref(path), '../game/THIRD_PARTY_NOTICES.txt');
  for (const path of ['/web/', '/web/index.html']) assert.equal(logic.musicHref(path), '../game/assets/audio/sunset-walk.ogg');
  for (const path of ['/build/web/', '/build/web/index.html', '/', '/index.html', '/voces/index.html']) {
    assert.equal(creditsHref(path), './licenses/THIRD_PARTY_NOTICES.txt');
    assert.equal(logic.musicHref(path), './assets/audio/sunset-walk.ogg');
  }
});

test('schema 3 is required: canonical prompts, choices, hints, explanations and views remain shared', () => {
  const shared = canonicalStory();
  shared.activities[0].prompt = 'Pregunta editada por quien escribe la historia';
  shared.activities[0].hint = 'Una pista compartida';
  const story = normalizeStory(shared);
  assert.deepEqual(story.activities, shared.activities);
  assert.deepEqual(story.houses, shared.houses);
  assert.deepEqual(story.chapters.map(ch => ch.id), ['printing', 'comparison', 'consultation']);
  assert.deepEqual(story.consultation, shared.consultation);
  assert.equal(story.activities.length, 6);
  assert.equal(story.activities.filter(a => a.transfer).length, 2);
});

test('missing or unsupported shared content is unavailable, never an old hard-coded quiz', () => {
  for (const mutate of [
    s => { s.schema_version = '1.0.0'; }, s => { s.schema_version = '2.0.0'; }, s => { s.activities.pop(); },
    s => { delete s.campaign; }, s => { s.campaign.ending_title = ''; }, s => { s.dialogue.revisit = ''; },
    s => { s.activities[0].rule = 'eval(alert(1))'; }, s => { s.activities[0].view = 'unknown-view'; },
    s => { s.activities[0].choices[0].id = 'state_99'; }, s => { s.activities[0].prompt = ''; },
    s => { s.activities[1].id = s.activities[0].id; }, s => { s.activities[0].explanation = ''; },
    s => { s.activities[0].id = '__proto__'; },
    s => { s.houses[0].chapter = 'missing'; }, s => { s.houses.pop(); },
    s => { s.assessment_fixtures.printing.sv = -1; }, s => { delete s.assessment_fixtures; },
    s => { s.chapters.pop(); }, s => { s.consultation.projects.pop(); },
  ]) {
    const shared = canonicalStory(); mutate(shared);
    assert.equal(normalizeStory(shared), null);
  }
  assert.equal(normalizeStory(null), null);
});

test('required shared story loading fails closed and uses the packaged path', async () => {
  const paths = [];
  const story = await logic.loadStory(async path => { paths.push(path); return { ok: true, json: async () => canonicalStory() }; }, '/build/web/');
  assert.deepEqual(paths, ['./content/story.json']);
  assert.equal(story.activities.length, 6);
  await assert.rejects(() => logic.loadStory(async () => ({ ok: true, json: async () => ({ schema_version: '1.0.0' }) })), /historia compartida/);
  await assert.rejects(() => logic.loadStory(async () => { throw Error('offline'); }), /reintentar/);
});

test('canonical consultation scenarios match retained fixtures for every action and preserve changed shared counts', () => {
  const story = canonicalStory();
  for (const [canonical, legacy] of [['baseline', 'base'], ['more_same_winner', 'more-a'], ['more_other_winner', 'more-b']]) {
    for (const choice of ['A', 'B', 'C', 'unmarked', 'decline']) {
      assert.deepEqual(resolveConsultation(choice, canonical, story), resolveConsultation(choice, legacy));
    }
  }
  story.consultation.scenarios[0].votes = [8, 8, 3];
  assert.deepEqual(resolveConsultation('decline', 'baseline', story).tied, ['A', 'B']);
  assert.equal(resolveConsultation('B', 'baseline', story).winner, 'B');
});

test('six canonical activities evaluate shared rules and changed records without disclosing failed answers', () => {
  const story = canonicalStory(); const data = fixture();
  const answers = ['sv', 'separate', 'unknown', 'state_02', 'state_01', 'no'];
  story.activities.forEach((activity, i) => {
    const result = logic.assessActivity(activity, answers[i], data, story);
    assert.equal(result.available, true, activity.id);
    assert.equal(result.correct, true, activity.id);
    assert.ok(result.message.includes(activity.explanation));
    const wrong = activity.choices.find(choice => choice.id !== answers[i]);
    const failure = logic.assessActivity(activity, wrong.id, data, story);
    assert.equal(failure.correct, false);
    assert.equal(failure.message.includes(activity.explanation), false, 'No solution before explicit help');
  });
  data.records[0] = { ...data.records[0], sv: 30, nv: 60 };
  assert.equal(logic.assessActivity(story.activities[0], 'nv', data, story).correct, true);
  data.records[1] = { ...data.records[1], sv: 240, nv: 160, ln: 405 };
  assert.equal(logic.assessActivity(story.activities[3], 'state_01', data, story).correct, true);
  assert.equal(logic.assessActivity({ ...story.activities[0], rule: 'arbitrary' }, 'sv', data, story).available, false);
});

test('new activity comparisons support ties, zero counts, absent records, and missing rates', () => {
  const story = canonicalStory(); const data = fixture();
  const activity = id => story.activities.find(item => item.id === id);
  data.records[0] = { ...data.records[0], sv: 45, nv: 45 };
  assert.equal(logic.assessActivity(activity('participation-reading'), 'equal', data, story).correct, true);
  data.records[2] = { ...data.records[2], sv: 60, nv: 40, ln: 110 };
  for (const id of ['more-count', 'higher-rate']) assert.equal(logic.assessActivity(activity(id), 'equal', data, story).correct, true);
  for (const index of [1, 2]) data.records[index] = { ...data.records[index], sv: 0, nv: 0, ln: data.records[index].ns };
  assert.equal(logic.assessActivity(activity('more-count'), 'equal', data, story).correct, true);
  assert.equal(logic.assessActivity(activity('higher-rate'), 'equal', data, story).available, false);
  data.records[0] = { ...data.records[0], sv: 0, nv: 0, ln: 10 };
  assert.equal(logic.assessActivity(activity('participation-reading'), 'equal', data, story).available, false);
  data.records.pop();
  assert.equal(logic.assessActivity(activity('more-count'), 'state_01', data, story).available, false);
  assert.equal(logic.assessActivity(activity('higher-rate'), 'unavailable', data, story).correct, true);
});

test('comparison uses unrounded counts/rates, including near-ties', () => {
  const story = canonicalStory(); const data = fixture();
  data.records[1] = { ...data.records[1], sv: 500000, nv: 500000, ns: 0, ln: 1000000 };
  data.records[2] = { ...data.records[2], sv: 500001, nv: 499999, ns: 0, ln: 1000000 };
  const activity = story.activities.find(item => item.id === 'higher-rate');
  assert.equal(logic.assessActivity(activity, 'state_02', data, story).correct, true);
  assert.equal(logic.assessActivity(activity, 'equal', data, story).correct, false);
});

test('shared transfer fixtures keep zero data explicit instead of silently substituting defaults', () => {
  const story = canonicalStory();
  story.assessment_fixtures.printing = { sv: 0, nv: 0, ns: 10, ln: 10 };
  story.assessment_fixtures.comparison[0] = { sv: 0, nv: 0, ns: 10, ln: 10 };
  assert.deepEqual(normalizeStory(story).assessment_fixtures, story.assessment_fixtures);
  assert.equal(logic.assessActivity(story.activities[2], 'unknown', fixture(), story).correct, true);
  assert.equal(logic.assessActivity(story.activities[5], 'no', fixture(), story).correct, true);
});

test('old completion is honored but no old answer, transfer or mastery migrates into six new checks', () => {
  const old = sanitizeProgress({ version: 1, completedChapters: [1, 2, 3], hints: ['transfer1', 'unknown'],
    answered: ['transfer1', 'transfer2'], mastery: true });
  assert.deepEqual(old.completedChapters, ['printing', 'comparison', 'consultation']);
  assert.deepEqual(old.legacyCompleted, old.completedChapters);
  assert.deepEqual(old.hints, []);
  assert.deepEqual(old.assisted, []);
  const fresh = sanitizeProgress({ version: 2, completedChapters: ['printing', 'printing', 'fake'],
    hints: ['unknown-transfer', 'transfer1', 'unknown-transfer'], assisted: ['unknown-transfer', 'ballot:A'],
    legacyCompleted: ['printing', 'comparison'], answers: ['unknown'], result: 'A', decision: 'B' });
  assert.deepEqual(fresh.completedChapters, ['printing']);
  assert.deepEqual(fresh.legacyCompleted, ['printing']);
  assert.deepEqual(fresh.hints, ['unknown-transfer']);
  assert.deepEqual(fresh.assisted, ['unknown-transfer']);
  assert.deepEqual(Object.keys(fresh).sort(), ['assisted', 'campaign_printed', 'completedChapters', 'hints', 'legacyCompleted', 'settings', 'version']);
});
