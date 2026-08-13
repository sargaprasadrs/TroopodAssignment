#!/usr/bin/env node
/**
 * =============================================================================
 * make-pdf.js — render notes/ip-summary.md into a shareable, high-level PDF
 * =============================================================================
 * The PDF deliberately contains strategy and steps only — no source code and
 * no exact business figures (see notes/ip-summary.md). Rendered with the
 * installed Chrome via puppeteer-core so no extra tooling is needed.
 *
 *   node scripts/make-pdf.js [--in notes/ip-summary.md] [--out delivery/Purelane_Strategy_Summary.pdf]
 * =============================================================================
 */
const fs = require('fs');
const path = require('path');
// puppeteer-core lives in scripts/px-check/node_modules (shared with the QA harness)
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { puppeteer = require(path.join(__dirname, 'px-check', 'node_modules', 'puppeteer-core')); }

const CHROME = process.env.PX_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i === -1 ? dflt : args[i + 1];
};
const IN = path.resolve(get('--in', path.join('notes', 'ip-summary.md')));
const OUT = path.resolve(get('--out', path.join('delivery', 'Purelane_Strategy_Summary.pdf')));

const BRAND = '#4b3a8f';
const ACCENT = '#b8701c';

// --- tiny markdown renderer (subset used by the summary doc) -----------------
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let list = null; // 'ul' | 'ol' | null
  let inTable = false;

  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const closeTable = () => { if (inTable) { out.push('</tbody></table>'); inTable = false; } };

  for (let raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*$/.test(line)) { closeList(); closeTable(); out.push(''); continue; }

    // headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { closeList(); closeTable(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }

    // hr
    if (/^---+$/.test(line.trim())) { closeList(); closeTable(); out.push('<hr/>'); continue; }

    // blockquote
    if (line.startsWith('>')) { closeList(); closeTable(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }

    // table
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isSep = cells.every(c => /^:?-{2,}:?$/.test(c));
      if (isSep) continue;
      if (!inTable) { out.push('<table><thead><tr>' + cells.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'); inTable = true; }
      else out.push('<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>');
      continue;
    }

    // ordered list
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) { closeTable(); if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(ol[1])}</li>`); continue; }

    // bullet list
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) { closeTable(); if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(ul[1])}</li>`); continue; }

    closeList(); closeTable();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList(); closeTable();
  return out.join('\n');
}

const CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #241a3d; font-size: 11.5pt; line-height: 1.55; }
  h1 { color: ${BRAND}; font-size: 21pt; margin: 0 0 2mm; letter-spacing: .3px; }
  h2 { color: ${BRAND}; font-size: 14pt; margin: 8mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 2px solid ${ACCENT}; }
  h3 { color: ${BRAND}; font-size: 12pt; margin: 6mm 0 2mm; }
  h4 { font-size: 11pt; margin: 5mm 0 2mm; }
  p { margin: 0 0 3mm; }
  strong { color: #17102b; }
  code { background: #f4f0fb; border: 1px solid #e4ddf2; border-radius: 4px; padding: 0 4px; font-size: 10pt; }
  blockquote { margin: 3mm 0; padding: 3mm 5mm; background: #f4f0fb; border-left: 4px solid ${BRAND}; color: #3b2f63; border-radius: 0 8px 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0 4mm; }
  th { background: ${BRAND}; color: #fff; text-align: left; padding: 2.5mm 3mm; font-size: 10pt; }
  td { border: 1px solid #d9d1ec; padding: 2.5mm 3mm; font-size: 10pt; vertical-align: top; }
  tr:nth-child(even) td { background: #faf7ff; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }
  hr { border: none; border-top: 1px solid #d9d1ec; margin: 6mm 0; }
  .cover { border-bottom: 4px solid ${ACCENT}; padding-bottom: 4mm; margin-bottom: 6mm; }
  .cover .meta { color: #6b5f8f; font-size: 10pt; }
  footer { position: fixed; bottom: -14mm; left: 0; right: 0; text-align: center; font-size: 8.5pt; color: #8d82ad; }
`;

(async () => {
  const md = fs.readFileSync(IN, 'utf8');
  const body = mdToHtml(md);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body>
  <div class="cover">
    <h1>Purelane — Strategy &amp; Build Summary</h1>
    <div class="meta">High-level overview · confidential · source and exact figures not included</div>
  </div>
  ${body}
  <footer>PURELANE · CONFIDENTIAL PROTOTYPE — NOT FOR PUBLICATION</footer>
</body></html>`;

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.pdf({ path: OUT, format: 'A4', printBackground: true, displayHeaderFooter: false });
  await browser.close();
  console.log('make-pdf: wrote', path.relative(process.cwd(), OUT));
})().catch(e => { console.error('make-pdf: ERROR', e.message); process.exit(1); });
