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
