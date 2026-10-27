// Pure composition: choices affect this sourced poster, never progress or the ballot.
import { compareRecord, normalizeStory, validateDataset } from './logic.mjs';

export function posterStates(data) {
  return Array.isArray(data?.records) ? data.records.filter(record => /^state_(0[1-9]|[12]\d|3[0-2])$/.test(record?.id)) : [];
}

export function composePoster(data, story, selection) {
  if (!selection || Array.isArray(selection) || !normalizeStory(story)) return null;
  const { first, second, metric, question } = selection;
  if (first === second || !['count', 'rate'].includes(metric)) return null;
  const discussion = story.poster_workshop.questions.find(item => item.id === question);
  if (!discussion) return null;
  try { validateDataset(data); } catch { return null; }
  const states = posterStates(data);
  const records = [first, second].map(id => states.find(record => record.id === id));
  if (records.some(record => !record)) return null;
  const result = compareRecord(...records, metric);
  const finding = result === 'unavailable' ? story.comparison_artifact.unavailable : result === 'equal' ?
    story.comparison_artifact[`equal_${metric}`] :
    story.comparison_artifact[metric].replace('{place}', records.find(record => record.id === result).geography_name);
  return { records, metric, finding, question: discussion.text };
}

// Only an explicit dispatch may replace a queue. Generation and publication are
// separate so cancellation, failure, navigation and reset cannot commit late work.
export function createCampaignSession({ data, story, createPDF }) {
  let queued = null;
  let busy = false;
  let printed = false;
  let generation = 0;
  const complete = progress => ['printing', 'comparison', 'consultation'].every(id => progress.completedChapters.includes(id));
  const cancel = () => { generation++; busy = false; };
  return {
    get ready() { return queued !== null; },
    get busy() { return busy; },
    get selection() { return queued ? { ...queued.selection } : null; },
    get poster() { return queued ? structuredClone(queued.poster) : null; },
    async queue(progress, published = null, replace = false) {
      if (!complete(progress) || progress.campaign_printed || busy || (queued && !replace)) return false;
      const source = published ?? { first: 'state_01', second: 'state_02', metric: 'rate', question: 'missing' };
      const selection = Object.freeze(Object.fromEntries(['first', 'second', 'metric', 'question'].map(key => [key, source[key]])));
      const poster = composePoster(data, story, selection);
      if (!poster) throw new Error('No se pudo preparar el PDF con este cartel.');
      const snapshot = structuredClone(poster);
      const token = ++generation;
      busy = true;
      try {
        const bytes = await createPDF(structuredClone(data), structuredClone(story), { ...selection });
        if (token !== generation) return false;
        if (!(bytes instanceof Uint8Array) || bytes.length < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
          throw new Error('No se pudo preparar el PDF.');
        }
        queued = { selection, poster: snapshot, bytes: new Uint8Array(bytes) };
        return true;
      } finally { if (token === generation) busy = false; }
    },
    print(progress) {
      if (!queued || busy || !complete(progress) || (progress.campaign_printed && !printed)) return false;
      printed = true; progress.campaign_printed = true;
      return true;
    },
    download() { return printed && queued ? new Uint8Array(queued.bytes) : null; },
    cancel,
    clear() { cancel(); queued = null; printed = false; },
  };
}
