import { aggregateRecords, compareRecord } from './logic.mjs';
import { composePoster, posterStates } from './poster.mjs';
import { element, bars, integer, percent, perHundred, sourceDetails } from './views.mjs';

export function renderPoster(target, poster, data, story, headingLevel, layout) {
  const { records, metric, finding, question } = poster;
  const totals = records.map(record => aggregateRecords([record]));
  const rates = metric === 'rate';
  const values = totals.map(total => rates ? total.participation_pct : total.sv);
  const section = element('section', undefined, 'composed-poster');
  const heading = element(`h${headingLevel}`, finding, 'finding');
  heading.id = `${target.id}-title`; heading.tabIndex = -1;
  section.setAttribute('aria-labelledby', heading.id);
  const header = element('header', undefined, 'citizen-poster-header');
  header.append(element('p', layout.copy.headline, 'citizen-poster-title'), element('p', layout.copy.citizen));
  section.append(header, heading,
    element('p', `Datos reales · INE / CCPC · ${records.map(record => record.geography_name).join(' y ')} · ${records[0].year}`, 'evidence-label'),
    element('p', story.poster_workshop[rates ? 'rate_label' : 'count_label']));
  const chart = bars(records.map((record, index) => ({
    label: record.geography_name, value: values[index],
    formatted: rates ? `${perHundred(values[index])} · ${percent(values[index])}` : `${integer(values[index])} registros`,
  })), rates ? 100 : Math.max(...values), rates ?
    'Cada estado usa su propio grupo con información conocida (SV + NV). Escala de 0 a 100; NS se muestra aparte.' :
    'Registros con participación (SV). Las dos barras usan la misma escala y los conteos son exactos.');
  chart.querySelectorAll('.bar-row').forEach((row, index) => {
    const record = records[index];
    if (values[index] === null) row.querySelector('.bar-track').remove();
    row.append(element('p', `SV: ${integer(record.sv)} · NV: ${integer(record.nv)} · Base (SV + NV): ${integer(totals[index].classified)}. NS: ${integer(record.ns)} · Lista nominal (LN): ${integer(record.ln)}.`, 'poster-counts'));
  });
  section.append(chart);
  if (rates) {
    section.append(element('p', 'Los porcentajes se muestran hasta ocho decimales. El titular compara las fracciones exactas SV / (SV + NV), sin redondearlas.', 'small-note'));
    if (values.every(value => value !== null) && Math.round(values[0]) === Math.round(values[1]) &&
        !['equal', 'unavailable'].includes(compareRecord(...records, metric))) {
      section.append(element('p', 'Las cifras redondeadas se parecen, pero las fracciones exactas son distintas. Revisa los conteos y las bases en «Ver datos y fuente».', 'finding'));
    }
  }
  section.append(element('p', `Para conversar: ${question}`, 'poster-question finding'), element('p', records.map((record, index) =>
    `${record.geography_name}: ${integer(record.ns)} registros sin información (NS), de ${integer(record.ln)} en toda la lista; ${perHundred(totals[index].unknown_pct)}.`
  ).join(' '), 'unknown-note'), element('p', story.poster_workshop.limit),
  element('p', layout.copy.classification, 'small-note'));
  const source = element('p', undefined, 'poster-source');
  const sourceLink = element('a', data.source.portal_url); sourceLink.href = data.source.portal_url; sourceLink.rel = 'noreferrer';
  source.append(element('strong', `${layout.copy.source_label}: `), sourceLink);
  section.append(source, sourceDetails(records, data, story));
  const formula = element('details');
  formula.append(element('summary', 'Ver cómo se comparó'), element('p', rates ? story.optional_math.formula :
    'Comparamos las cantidades de registros con participación (SV), sin dividir. NS se mantiene aparte.'));
  if (rates) records.forEach((record, index) => formula.append(element('p',
    totals[index].classified ? `${record.geography_name}: ${integer(record.sv)} ÷ (${integer(record.sv)} + ${integer(record.nv)}) × 100 = ${percent(values[index])}.` :
      `${record.geography_name}: no hay registros con información conocida; su proporción no está disponible.`)));
  section.append(formula);
  target.replaceChildren(section); target.hidden = false;
}

// This controller owns only volatile draft/publication state. No storage, URL,
// progress, assessment, consultation or network API enters this module.
export function createPosterWorkshop({ data, story, layout, archive, meeting, exhibit, onOpen, onCarry, announce }) {
  const copy = story.poster_workshop;
  const states = posterStates(data);
  const open = element('button', copy.title); open.type = 'button'; open.id = 'open-poster-workshop'; open.hidden = true;
  open.setAttribute('aria-controls', 'poster-workshop'); open.setAttribute('aria-expanded', 'false');
  const editor = element('section', undefined, 'poster-workshop'); editor.id = 'poster-workshop'; editor.hidden = true;
  editor.setAttribute('aria-labelledby', 'poster-workshop-title');
  const title = element('h3', copy.title); title.id = 'poster-workshop-title'; title.tabIndex = -1;
  const note = element('p', `${copy.memory_note} Al recargar o reiniciar se borra.`, 'small-note'); note.id = 'poster-memory-note';
  const form = element('form'); form.autocomplete = 'off'; form.setAttribute('aria-describedby', note.id);
  const fields = element('div', undefined, 'poster-fields');
  const selects = {};
  const selectedText = {};
  for (const [key, label, choices] of [
    ['first', copy.first_label, states.map(record => [record.id, record.geography_name])],
    ['second', copy.second_label, states.map(record => [record.id, record.geography_name])],
    ['metric', copy.metric_label, [['count', copy.count_label], ['rate', copy.rate_label]]],
    ['question', copy.question_label, copy.questions.map(question => [question.id, question.text])],
  ]) {
    const field = element('div'); const control = element('select'); control.id = `poster-${key}`; control.name = key; control.required = true;
    const caption = element('label', label); caption.htmlFor = control.id;
    for (const [value, text] of choices) { const option = element('option', text); option.value = value; control.append(option); }
    const readback = element('p', undefined, 'poster-selection-text small-note'); readback.id = `poster-${key}-text`;
    // Native selects do not wrap at narrow widths. This visual copy wraps;
    // assistive technology already receives the full selected option once.
    readback.setAttribute('aria-hidden', 'true'); selectedText[key] = readback;
    field.append(caption, control, readback); fields.append(field); selects[key] = control;
  }
  const error = element('p', undefined, 'feedback'); error.id = 'poster-error';
  const previewButton = element('button', 'Ver vista previa'); previewButton.id = 'preview-poster'; previewButton.type = 'submit';
  const preview = element('div'); preview.id = 'poster-preview'; preview.hidden = true;
  const carry = element('button', 'Llevar a la reunión'); carry.id = 'carry-poster'; carry.type = 'button'; carry.disabled = true;
  const cancel = element('button', 'Volver sin publicar', 'quiet'); cancel.id = 'cancel-poster'; cancel.type = 'button';
  const actions = element('div', undefined, 'poster-actions'); actions.append(carry, cancel);
  form.append(fields, error, previewButton);
  editor.append(element('p', 'Opcional · No añade preguntas al recorrido', 'eyebrow'), title, element('p', copy.intro), note, form, preview, actions);
  const archiveSlot = element('div'); archiveSlot.id = 'poster-archive'; archiveSlot.hidden = true;
  const meetingSlot = element('div'); meetingSlot.id = 'poster-meeting'; meetingSlot.hidden = true;
  const exhibitSlot = element('div'); exhibitSlot.id = 'poster-exhibit'; exhibitSlot.hidden = true;
  archive.append(open, editor, archiveSlot);
  meeting.querySelector('#consultation-bridge').before(meetingSlot);
  let published = null;
  let draft = null;
  let available = false;
  const selection = () => Object.fromEntries(Object.entries(selects).map(([key, select]) => [key, select.value]));
  const showSelected = () => {
    for (const [key, select] of Object.entries(selects)) selectedText[key].textContent = select.selectedOptions[0]?.textContent || '';
  };
  const resetPreview = () => {
    draft = null; preview.replaceChildren(); preview.hidden = true; carry.disabled = true; error.textContent = '';
    for (const select of Object.values(selects)) { select.removeAttribute('aria-invalid'); select.removeAttribute('aria-describedby'); }
  };
  const sync = enabled => {
    available = enabled; open.hidden = !available;
    open.textContent = published ? 'Revisar mi cartel' : copy.title;
    for (const [target, level] of [[archiveSlot, 3], [meetingSlot, 3], [exhibitSlot, 4]]) {
      if (published) {
        renderPoster(target, published.poster, data, story, level, layout);
        target.append(element('p', `${copy.memory_note} Al recargar o reiniciar se borra; puedes crear otro.`, 'small-note'));
        if (target === meetingSlot) {
          const speech = element('div', undefined, 'speech-card');
          speech.append(element('p', 'Inés', 'speaker'), element('p',
            'Gracias por traer tu cartel. Tomemos tu pregunta para conversar y escuchar otras necesidades. El cartel no elige un proyecto por nosotros.'));
          target.append(speech);
        }
      } else { target.replaceChildren(); target.hidden = true; }
    }
    // The app rebuilds the required exhibit when a chapter is completed.
    exhibit.append(exhibitSlot);
  };
  const close = (focus = true) => {
    if (editor.hidden) return false;
    editor.hidden = true; open.setAttribute('aria-expanded', 'false'); resetPreview();
    if (focus) open.focus();
    return true;
  };
  open.addEventListener('click', () => {
    if (!available) return;
    onOpen(); resetPreview();
    const initial = published?.selection || { first: states[0].id, second: states[1].id, metric: 'count', question: 'missing' };
    for (const [key, value] of Object.entries(initial)) selects[key].value = value;
    showSelected();
    cancel.textContent = published ? 'Cancelar y conservar mi publicación' : 'Volver sin publicar';
    editor.hidden = false; open.setAttribute('aria-expanded', 'true'); title.focus();
  });
  form.addEventListener('change', () => { resetPreview(); showSelected(); });
  form.addEventListener('submit', event => {
    event.preventDefault(); resetPreview();
    const chosen = selection();
    const poster = composePoster(data, story, chosen);
    if (!poster) {
      error.textContent = chosen.first === chosen.second ? 'Elige dos estados distintos para comparar.' :
        'No podemos preparar este cartel con la selección y los datos disponibles.';
      const invalid = chosen.first === chosen.second ? selects.second : selects.first;
      invalid.setAttribute('aria-invalid', 'true'); invalid.setAttribute('aria-describedby', error.id); invalid.focus();
      return;
    }
    draft = { selection: chosen, poster }; renderPoster(preview, poster, data, story, 4, layout); carry.disabled = false;
    preview.querySelector('h4').focus();
  });
  carry.addEventListener('click', () => {
    if (!draft || !available) return;
    // Recheck rather than carry a stale preview after a changed form.
    if (Object.entries(selection()).some(([key, value]) => value !== draft.selection[key])) { resetPreview(); return; }
    published = draft; close(false); sync(available); onCarry();
  });
  cancel.addEventListener('click', () => {
    close(); announce(published ? 'Cambios descartados. Conservas tu publicación anterior.' : 'Volviste sin publicar un cartel.');
  });
  return { sync, close, get selection() { return published ? { ...published.selection } : null; },
    clear() { published = null; close(false); sync(available); } };
}
