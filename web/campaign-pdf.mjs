// Offline Carta PDF, deliberately limited to text, rectangles, bars and one link.
// PDF 1.7 Type0/Identity-H + CIDFontType2/FontFile2 + explicit ToUnicode map.
// Both runtimes consume the same generated font data and declarative layout.
import { composePoster } from './poster.mjs';
import { contentPaths } from './logic.mjs';

const encode = text => new TextEncoder().encode(text);
const binary = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
const integer = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const template = (text, model) => text.replace(/\{([a-z_]+)\}/g, (token, key) => typeof model[key] === 'string' ? model[key] : token);
function number(value) {
  const scaled = Math.floor(Math.abs(value) * 10000 + 0.5);
  const digits = `${Math.floor(scaled / 10000)}.${String(scaled % 10000).padStart(4, '0')}`.replace(/0+$/, '').replace(/\.$/, '');
  return (value < 0 && scaled ? '-' : '') + digits;
}
function percentage(numerator, denominator) {
  const scaled = BigInt(numerator) * 10000n;
  const base = BigInt(denominator);
  const rounded = scaled / base + (2n * (scaled % base) >= base ? 1n : 0n);
  return `${rounded / 100n}.${String(rounded % 100n).padStart(2, '0')} %`;
}
async function localResource(name) {
  for (const path of contentPaths(name)) {
    const response = await fetch(path);
    if (response.ok) return response.json();
  }
  throw new Error(`Falta el recurso local ${name}.`);
}
function modelFor(poster, data, story, layout) {
  const rates = poster.metric === 'rate';
  const maximum = Math.max(...poster.records.map(record => record.sv));
  const model = { finding: poster.finding, question: poster.question, limit: story.poster_workshop.limit,
    source_url: data.source.portal_url, year: String(poster.records[0].year),
    measure: story.poster_workshop[rates ? 'rate_label' : 'count_label'],
    scale: rates ? layout.copy.rate_scale : maximum ? template(layout.copy.count_scale, { maximum: integer(maximum) }) : layout.copy.zero_scale };
  poster.records.forEach((record, index) => {
    const prefix = index === 0 ? 'first_' : 'second_';
    const base = record.sv + record.nv;
    model[`${prefix}name`] = record.geography_name;
    model[`${prefix}value`] = rates ? base ? percentage(record.sv, base) : layout.copy.unavailable : integer(record.sv);
    model[`${prefix}ratio`] = rates ? base ? record.sv / base : null : maximum ? record.sv / maximum : 0;
    model[`${prefix}details`] = template(layout.copy.details, Object.fromEntries(
      Object.entries({ sv: record.sv, nv: record.nv, ns: record.ns, ln: record.ln, base }).map(([key, value]) => [key, integer(value)])));
  });
  return model;
}
function width(value, font, size) {
  let units = 0;
  for (const character of value) {
    if (!font.characters[character]) throw new Error(`El tipo de letra no incluye ${character}.`);
    units += font.characters[character][1];
  }
  return units * size / 1000;
}
function lines(value, font, size, available) {
  const result = [];
  for (const paragraph of value.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ').filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (width(candidate, font, size) <= available) { line = candidate; continue; }
      if (line) result.push(line);
      line = '';
      for (const character of word) {
        if (width(line + character, font, size) > available) {
          if (!line) throw new Error('El texto no cabe en el cartel.');
          result.push(line); line = '';
        }
        line += character;
      }
    }
    result.push(line);
  }
  return result;
}
function concatenate(parts) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}
function stream(bytes, extra = '') {
  return concatenate([encode(`<< /Length ${bytes.length}${extra} >>\nstream\n`), bytes, encode('\nendstream')]);
}
function fontObjects(font, start) {
  const bytes = binary(font.ttf_base64);
  const cidMap = binary(font.cid_map_base64);
  if (bytes[0] !== 0 || bytes[1] !== 1 || bytes[2] !== 0 || bytes[3] !== 0 || !cidMap.length) throw new Error('Tipo de letra inválido.');
  return [
    encode(`<< /Type /Font /Subtype /Type0 /BaseFont /${font.name} /Encoding /Identity-H /DescendantFonts [${start + 1} 0 R] /ToUnicode ${start + 4} 0 R >>`),
    encode(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${font.name} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${start + 2} 0 R /CIDToGIDMap ${start + 5} 0 R /DW 0 /W [0 [${font.widths.join(' ')}]] >>`),
    encode(`<< /Type /FontDescriptor /FontName /${font.name} /Flags 32 /FontBBox [${font.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${font.ascent} /Descent ${font.descent} /CapHeight ${font.cap_height} /StemV 80 /FontFile2 ${start + 3} 0 R >>`),
    stream(bytes, ` /Length1 ${bytes.length}`), stream(encode(font.to_unicode)), stream(cidMap),
  ];
}
function documentBytes(model, layout, fonts) {
  const color = key => layout.colors[key].match(/../g).map(value => number(parseInt(value, 16) / 255)).join(' ') + ' rg\n';
  const rectangle = (block, w, fill) => color(fill) + `${number(block.x)} ${number(792 - block.y - block.h)} ${number(w)} ${number(block.h)} re f\n`;
  let commands = '', annotation = '';
  for (const block of layout.blocks) {
    if (block.type === 'text') {
      const fontIndex = block.font ?? 0, font = fonts[fontIndex];
      const leading = block.leading ?? block.size * 1.25;
      const wrapped = lines(template(block.text, model), font, block.size, block.w);
      if (block.size + (wrapped.length - 1) * leading > block.h) throw new Error(`El texto no cabe: ${block.text}`);
      commands += color(block.color ?? 'ink');
      wrapped.forEach((line, index) => {
        const x = block.x + (block.align === 'right' ? block.w - width(line, font, block.size) : 0);
        const encoded = Array.from(line, character => font.characters[character][0].toString(16).padStart(4, '0')).join('');
        commands += `BT /F${fontIndex} ${number(block.size)} Tf 1 0 0 1 ${number(x)} ${number(792 - block.y - block.size - index * leading)} Tm <${encoded}> Tj ET\n`;
      });
    } else if (block.type === 'rect') commands += rectangle(block, block.w, block.color);
    else if (block.type === 'bar') {
      const ratio = model[block.value];
      if (ratio !== null) {
        commands += rectangle(block, block.w, 'track');
        if (ratio > 0) commands += rectangle(block, block.w * ratio, 'teal');
      }
    } else if (block.type === 'link') {
      annotation = `<< /Type /Annot /Subtype /Link /Rect [${number(block.x)} ${number(792 - block.y - block.h)} ${number(block.x + block.w)} ${number(792 - block.y)}] /Border [0 0 0] /A << /S /URI /URI <${hex(encode(model[block.value]))}> >> >>`;
    } else throw new Error('Operación PDF no compatible.');
  }
  if (!annotation) throw new Error('Falta la fuente oficial.');
  const objects = [
    encode('<< /Type /Catalog /Pages 2 0 R /Lang (es-MX) >>'),
    encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    encode('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F0 6 0 R /F1 12 0 R >> >> /Contents 4 0 R /Annots [5 0 R] >>'),
    stream(encode(commands)), encode(annotation),
  ];
  for (const font of fonts) objects.push(...fontObjects(font, objects.length + 1));
  const parts = [encode('%PDF-1.7\n'), new Uint8Array([37, 226, 227, 207, 211, 10])];
  const offsets = [0];
  let length = parts.reduce((sum, part) => sum + part.length, 0);
  objects.forEach((object, index) => {
    offsets.push(length);
    const bytes = concatenate([encode(`${index + 1} 0 obj\n`), object, encode('\nendobj\n')]);
    parts.push(bytes); length += bytes.length;
  });
  parts.push(encode(`xref\n0 ${offsets.length}\n0000000000 65535 f \n` +
    offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('') +
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF\n`));
  return concatenate(parts);
}

/** Return deterministic bytes without saving/downloading anything.
 * Node can inject {loadResource: async filename => parsedJSON}; browsers load
 * only campaign_font.json and campaign_layout.json from the local content tree.
 */
export async function createCampaignPDF(data, story, selection, { loadResource = localResource } = {}) {
  const poster = composePoster(data, story, selection);
  if (!poster || !/^https:\/\/(?:www\.)?ine\.mx\/[\x21-\x7e]*$/.test(data.source.portal_url)) throw new Error('Selección o datos del cartel inválidos.');
  const [resource, layout] = await Promise.all(['campaign_font.json', 'campaign_layout.json'].map(loadResource));
  if (resource.schema_version !== 1 || resource.fonts?.length !== 2 || layout.schema_version !== 1 ||
    layout.page?.[0] !== 612 || layout.page?.[1] !== 792 || layout.page.length !== 2 || !Array.isArray(layout.blocks)) throw new Error('Recursos PDF inválidos.');
  return documentBytes(modelFor(poster, data, story, layout), layout, resource.fonts);
}
