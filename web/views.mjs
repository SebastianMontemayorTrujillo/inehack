import { aggregateRecords, transferExercises, assessActivity, comparisonCaption } from './logic.mjs';

export const integer = value => new Intl.NumberFormat('es-MX').format(value);
export const percent = value => value === null ? 'Sin datos clasificables' :
  `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 8 }).format(value)} %`;
export const perHundred = value => value === null ? 'Sin información suficiente para comparar' :
  `cerca de ${Math.round(value)} de cada 100`;
const shortCount = value => value < 1000 ? `${integer(value)} registros` : value < 1000000 ?
  `cerca de ${integer(Math.round(value / 1000))} mil registros` :
  `cerca de ${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value / 1000000)} millones de registros`;

// Shared content is always text, never executable markup.
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function table(caption, headings, rows) {
  const result = element('table'); result.append(element('caption', caption));
  const head = element('thead'); const header = element('tr');
  headings.forEach(text => { const th = element('th', text); th.scope = 'col'; header.append(th); });
  head.append(header);
  const body = element('tbody');
  rows.forEach(values => {
    const row = element('tr');
    values.forEach((value, i) => {
      const cell = element(i ? 'td' : 'th', String(value));
      if (!i) cell.scope = 'row';
      row.append(cell);
    });
    body.append(row);
  });
  result.append(head, body);
  return result;
}

function scrollTable(content) {
  const wrapper = element('div', undefined, 'table-wrap');
  wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', `${content.caption.textContent}. Usa las flechas si hace falta desplazar la tabla.`);
  wrapper.append(content); return wrapper;
}

export function bars(rows, maximum, caption) {
  const figure = element('figure'); const chart = element('div', undefined, 'bar-chart');
  rows.forEach(({ label, value, formatted }) => {
    const row = element('div', undefined, 'bar-row');
    row.append(element('span', label, 'bar-label'), element('span', formatted, 'bar-value'));
    const track = element('div', undefined, 'bar-track'); track.setAttribute('aria-hidden', 'true');
    const fill = element('div', undefined, 'bar-fill');
    fill.style.width = `${maximum && value !== null ? Math.min(100, 100 * value / maximum) : 0}%`;
    track.append(fill); row.append(track); chart.append(row);
  });
  figure.append(chart, element('figcaption', caption)); return figure;
}

export function sourceDetails(records, data, story) {
  const details = element('details', undefined, 'source-details');
  details.append(element('summary', 'Ver datos y fuente'));
  details.append(element('p', 'INE · Conteos Censales de Participación Ciudadana (CCPC) · Elección federal 2024. Registros históricos; no describen a este grupo escolar.'));
  for (const record of records) {
    const totals = aggregateRecords([record]);
    details.append(scrollTable(table(`${record.geography_name} · ${record.year} · Datos exactos`, ['Clasificación', 'Registros'], [
      ['Con participación (SV)', integer(record.sv)], ['Sin participación (NV)', integer(record.nv)],
      ['Sin información (NS)', integer(record.ns)], ['Toda la lista nominal (LN)', integer(record.ln)],
      ['Con información conocida (SV + NV)', integer(totals.classified)],
    ])), element('p', `Participación: ${percent(totals.participation_pct)} de los registros con información conocida. Sin información: ${percent(totals.unknown_pct)} de toda la lista. Los porcentajes se muestran hasta con ocho decimales; los conteos son exactos.`));
  }
  const links = element('p');
  for (const [label, href] of [['Portal oficial CCPC', data.source.portal_url], ['Descarga de origen', data.source.url]]) {
    const link = element('a', label); link.href = href; link.rel = 'noreferrer';
    if (links.childNodes.length) links.append(document.createTextNode(' · '));
    links.append(link);
  }
  details.append(links, element('p', story.optional_math.limit));
  const provenance = element('dl');
  for (const [label, text] of [['Archivo recuperado (UTC)', data.source.retrieved_at_utc],
    ['SHA-256 del origen', data.source.sha256], ['Diccionario de origen', data.source.dictionary_path]]) {
    provenance.append(element('dt', label), element('dd', text));
  }
  details.append(provenance);
  if (Array.isArray(data.validation.limits)) {
    const limits = element('ul');
    data.validation.limits.filter(text => typeof text === 'string').forEach(text => limits.append(element('li', text)));
    details.append(limits);
  }
  return details;
}

function optionalMath(records, story, chapter) {
  const details = element('details', undefined, 'optional-math');
  details.append(element('summary', story.optional_math.title),
    element('p', 'Opcional. Abrir esta explicación cuenta como apoyo para la actividad actual.', 'small-note'),
    element('p', story.optional_math.known), element('p', story.optional_math.formula));
  if (records.length) {
    const total = aggregateRecords(records);
    details.append(element('p', total.classified ? `${integer(total.sv)} ÷ ${integer(total.classified)} × 100 = ${percent(total.participation_pct)}.` :
      'No hay registros con información conocida. No podemos calcular este porcentaje.'));
    if (records.length > 1) details.append(element('p', story.optional_math.combined));
  }
  const fixtures = story.assessment_fixtures;
  const validBases = [fixtures.printing, ...fixtures.comparison].every(r => r.sv + r.nv > 0);
  if (validBases) {
    const exercise = transferExercises(fixtures)[chapter === 'printing' ? 'transfer1' : 'transfer2'];
    details.append(element('p', story.fiction_label, 'synthetic-notice'),
      element('p', exercise.question), element('p', exercise.explanation));
  } else details.append(element('p', 'Este ejemplo no tiene información conocida suficiente para calcular un porcentaje.'));
  return details;
}

export function renderEvidence(target, view, data, story, onHelp = () => {}) {
  target.replaceChildren();
  const national = data.records.find(r => r.id === 'national');
  const states = ['state_01', 'state_02'].map(id => data.records.find(r => r.id === id));
  let records = [];
  let chapter = 'printing';
  if (view === 'national') {
    records = [national];
    const totals = aggregateRecords(records);
    target.append(element('p', `Datos reales · INE / CCPC · ${national.geography_name} · ${national.year}`, 'evidence-label'),
      element('p', 'Aquí comparamos solo los registros con información conocida: con participación o sin participación. Cada barra usa esa misma base.'));
    target.append(bars([
      { label: 'Con participación', value: totals.participation_pct, formatted: perHundred(totals.participation_pct) },
      { label: 'Sin participación', value: totals.classified ? 100 * totals.nv / totals.classified : null,
        formatted: perHundred(totals.classified ? 100 * totals.nv / totals.classified : null) },
    ], 100, 'De cada 100 registros con información conocida. Escala de 0 a 100; cantidades redondeadas.'));
    target.append(element('p', `Conteos exactos: ${integer(totals.sv)} con participación; ${integer(totals.nv)} sin participación.`));
    target.append(element('p', `Por separado: ${perHundred(totals.unknown_pct)} registros de toda la lista no tienen información sobre participación. Esta base incluye también los casos desconocidos.`, 'unknown-note'));
  } else if (view === 'count' || view === 'rate') {
    records = states; chapter = 'comparison';
    target.append(element('p', `Cartel por revisar: «${story.comparison_artifact.before}»`, 'finding'));
    target.append(element('p', 'Datos reales · INE / CCPC · Aguascalientes y Baja California · 2024', 'evidence-label'));
    const control = element('label', 'Ver la comparación como ');
    const select = element('select'); select.id = 'compare-metric';
    for (const [id, name] of [['count', 'Cantidad de registros'], ['rate', 'De cada 100 con información']]) {
      const option = element('option', name); option.value = id; select.append(option);
    }
    select.value = view; control.append(select);
    const chart = element('div');
    const draw = () => {
      const rates = select.value === 'rate';
      const values = states.map(r => rates ? aggregateRecords([r]).participation_pct : r.sv);
      chart.replaceChildren(bars(states.map((record, i) => ({ label: record.geography_name, value: values[i],
        formatted: rates ? perHundred(values[i]) : shortCount(values[i]) })), rates ? 100 : Math.max(...values),
      rates ? 'Cada lugar usa sus propios registros con información conocida. Escala de 0 a 100; los casos sin información se muestran aparte.' :
        'Registros con participación. Las barras usan la misma escala; las cantidades redondeadas ayudan a leer tamaños.'));
      if (rates && values.every(v => v !== null) && Math.round(values[0]) === Math.round(values[1])) {
        const winner = states.find(record => assessActivity('higher-rate', record.id, data, story).correct);
        if (winner) chart.append(element('p', `Las cifras redondeadas se parecen. Con los conteos exactos, ${winner.geography_name} tiene una proporción ligeramente mayor.`));
      }
    };
    select.addEventListener('change', draw); draw(); target.append(control, chart);
    target.append(element('p', states.map(record => `${record.geography_name}: ${perHundred(aggregateRecords([record]).unknown_pct)} de toda su lista no tienen información de participación.`).join(' ') +
      ' Estos casos se muestran aparte de las barras con información conocida.', 'unknown-note'));
  } else if (view === 'printing-fixture') {
    const record = story.assessment_fixtures.printing;
    target.append(element('p', story.fiction_label, 'synthetic-notice'));
    target.append(bars(['sv', 'nv', 'ns'].map((key, i) => ({ label: ['Participaron', 'No participaron', 'Sin información'][i],
      value: record[key], formatted: `${integer(record[key])} registros` })), record.ln,
    `Tres grupos inventados de una misma lista de ${integer(record.ln)} registros. Se muestran cantidades, no porcentajes.`));
  } else if (view === 'comparison-fixture') {
    chapter = 'comparison';
    target.append(element('p', story.fiction_label, 'synthetic-notice'));
    const examples = story.assessment_fixtures.comparison;
    target.append(bars(examples.map((r, i) => ({ label: `Lugar ${i ? 'B' : 'A'}: ${integer(r.sv)} con participación de ${integer(r.sv + r.nv)} con información`,
      value: aggregateRecords([r]).participation_pct, formatted: perHundred(aggregateRecords([r]).participation_pct) })), 100,
    'En cada lugar, la base es su propio grupo con información conocida. Escala de 0 a 100.'));
  }
  if (records.length) target.append(sourceDetails(records, data, story));
  const math = optionalMath(records, story, chapter);
  math.addEventListener('toggle', () => { if (math.open) onHelp(); });
  target.append(math);
}

export function artifact(chapter, data, story) {
  const body = element('div');
  if (chapter === 'comparison') {
    body.append(element('p', `Antes: «${story.comparison_artifact.before}» Era una generalización; revisamos las dos medidas.`));
    body.append(element('h4', 'Titular corregido con datos'));
    for (const finding of comparisonCaption(data, story).split('\n')) body.append(element('p', finding, 'finding'));
  }
  const records = chapter === 'printing' ? [data.records.find(r => r.id === 'national')] :
    ['state_01', 'state_02'].map(id => data.records.find(r => r.id === id));
  for (const record of records) {
    const value = aggregateRecords([record]);
    body.append(element('p', `${record.geography_name} · 2024: ${value.participation_pct === null ?
      'No hay registros con información conocida para describir la participación.' :
      `${perHundred(value.participation_pct)} registros con información conocida muestran participación.`}`));
    body.append(element('p', `Por separado, ${shortCount(value.ns)} no tienen información de participación, de toda la lista de este lugar.`));
  }
  if (chapter === 'comparison') body.append(element('p', 'Una cantidad mayor no siempre significa un porcentaje mayor. Estos datos no explican motivos personales ni quién es mejor ciudadano.'));
  body.append(element('p', story.chapters.find(c => c.id === chapter).reflection, 'finding'),
    sourceDetails(records, data, story));
  return body;
}
