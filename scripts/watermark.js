#!/usr/bin/env node
/**
 * =============================================================================
 * watermark.js — IP-protection toolkit (watermarks + read-only hardening)
 * =============================================================================
 * Two modes:
 *
 *   1. Build a watermarked, read-only preview copy of a design file:
 *        node scripts/watermark.js --in purelane-homepage.html \
 *             --out preview/purelane-preview.html [--blur "selector1, .sel2"]
 *      - Semi-transparent diagonal watermark across the whole page
 *      - Copy / cut / right-click / drag / print / save blocked in-browser
 *      - Optional: --blur adds a CSS blur to the given selectors so exact
 *        numbers (prices, ratings, counts) can be redacted if you prefer
 *
 *   2. Stamp a semi-transparent watermark onto image files (screenshots):
 *        node scripts/watermark.js --stamp a.png b.png [--out-dir dir]
 *      - Writes <name>-wm.png next to the source (or into --out-dir)
 *
 * Uses the installed Chrome via puppeteer-core (same as scripts/px-check).
 * =============================================================================
 */
const fs = require('fs');
const path = require('path');
// puppeteer-core lives in scripts/px-check/node_modules (shared with the QA harness)
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { puppeteer = require(path.join(__dirname, 'px-check', 'node_modules', 'puppeteer-core')); }

const CHROME = process.env.PX_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DEFAULT_TEXT = process.env.WM_TEXT || 'PURELANE · CONFIDENTIAL PROTOTYPE';
const DEFAULT_SUB = process.env.WM_SUB || 'NOT FOR PUBLICATION · SHARED FOR REVIEW ONLY';

const args = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i === -1 ? dflt : args[i + 1];
};
const IN = get('--in');
const OUT = get('--out', path.join('preview', 'purelane-preview.html'));
const STAMP = args.includes('--stamp');
// Everything after --stamp up to the next -- flag is an image to stamp
const STAMP_FILES = [];
if (STAMP) {
  for (let i = args.indexOf('--stamp') + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break;
    STAMP_FILES.push(args[i]);
  }
}
const OUT_DIR = get('--out-dir', '.');
const BLUR = get('--blur', '');

// ---------------------------------------------------------------------------
// Shared visuals
// ---------------------------------------------------------------------------
const SVG_PATTERN = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'><g transform='rotate(-26 280 280)'><text x='280' y='270' font-family='Arial,Helvetica,sans-serif' font-size='30' font-weight='800' letter-spacing='3' fill='#4b3a8f' fill-opacity='0.14' text-anchor='middle' dominant-baseline='middle'>${DEFAULT_TEXT}</text><text x='280' y='308' font-family='Arial,Helvetica,sans-serif' font-size='13' font-weight='700' letter-spacing='5' fill='#4b3a8f' fill-opacity='0.10' text-anchor='middle'>${DEFAULT_SUB}</text></g></svg>`;
const PATTERN_URI = 'data:image/svg+xml,' + encodeURIComponent(SVG_PATTERN);

const BADGE_HTML = `<div id="pl-ip">
  <div class="pl-ip-wm" aria-hidden="true"></div>
  <div class="pl-ip-badge" aria-hidden="true">PURELANE · CONFIDENTIAL PROTOTYPE — NOT FOR PUBLICATION</div>
</div>`;

const GUARD_CSS = `
/* ---- Purelane IP guard: watermark + read-only hardening ---- */
#pl-ip{position:fixed;inset:0;z-index:2147483647;pointer-events:none}
#pl-ip .pl-ip-wm{position:absolute;inset:0;background-image:url("${PATTERN_URI}");background-size:560px 560px;background-repeat:repeat;opacity:.9}
#pl-ip .pl-ip-badge{position:fixed;top:10px;right:12px;max-width:calc(100vw - 24px);font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fff;background:rgba(75,58,143,.82);border:1px solid rgba(255,255,255,.55);padding:6px 12px;border-radius:999px;box-shadow:0 2px 10px rgba(0,0,0,.25);text-align:center}
html,body{-webkit-user-select:none!important;user-select:none!important}
img,svg,video{-webkit-user-drag:none!important;user-drag:none!important}
@media print{
  body>*:not(#pl-ip){display:none!important}
  #pl-ip{position:static!important}
  #pl-ip .pl-ip-wm{position:fixed;inset:0;background:#fff}
  #pl-ip .pl-ip-badge{position:fixed;top:40%;left:0;right:0;max-width:100vw;border-radius:0;font-size:20px;padding:24px;text-align:center}
}
${BLUR ? BLUR.split(',').map(s => s.trim()).filter(Boolean).map(s => `${s}{filter:blur(7px)!important;-webkit-filter:blur(7px)!important}`).join('\n') : ''}
`;

const GUARD_JS = `(function(){
  'use strict';
  var guard = document.getElementById('pl-ip');
  if (!guard) {
    guard = document.createElement('div');
    guard.id = 'pl-ip';
    guard.innerHTML = '<div class="pl-ip-wm" aria-hidden="true"></div><div class="pl-ip-badge" aria-hidden="true">PURELANE · CONFIDENTIAL PROTOTYPE — NOT FOR PUBLICATION</div>';
    (document.body || document.documentElement).appendChild(guard);
  }
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; });
  document.addEventListener('copy', function(e){ e.preventDefault(); return false; });
  document.addEventListener('cut', function(e){ e.preventDefault(); return false; });
  document.addEventListener('dragstart', function(e){ e.preventDefault(); return false; });
  window.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['c','x','s','p','u','a','v'].indexOf(k) !== -1) { e.preventDefault(); return false; }
  });
})();`;

// ---------------------------------------------------------------------------
// Mode 1: build a watermarked + hardened copy of an HTML design file
// ---------------------------------------------------------------------------
function buildPreview() {
  const srcPath = path.resolve(IN);
  const outPath = path.resolve(OUT);
  if (!fs.existsSync(srcPath)) {
    console.error('watermark: input not found:', srcPath);
    process.exit(1);
  }
  let html = fs.readFileSync(srcPath, 'utf8');
  const inject = (html, marker, block) => {
    const i = html.indexOf(marker);
    return i === -1 ? html : html.slice(0, i) + block + '\n' + html.slice(i);
  };
  html = inject(html, '</head>', `<meta name="robots" content="noindex"><style>${GUARD_CSS}</style>`);
  html = inject(html, '</body>', `<div id="pl-ip"><div class="pl-ip-wm" aria-hidden="true"></div><div class="pl-ip-badge" aria-hidden="true">PURELANE · CONFIDENTIAL PROTOTYPE — NOT FOR PUBLICATION</div></div><script>${GUARD_JS}</script>`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('watermark: wrote read-only preview ->', path.relative(process.cwd(), outPath));
  if (BLUR) console.log('watermark: blur selectors:', BLUR);
}

// ---------------------------------------------------------------------------
// Mode 2: stamp a watermark onto screenshots/images
// ---------------------------------------------------------------------------
// Real function passed to page.evaluate — the watermark strings travel as
// serialized args, so nothing depends on a page-side closure.
// jpg=true outputs a JPEG (smaller; used for the shareable package).
function makeStampScript() {
  return async (b64, t, s, b, jpg) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/png;base64,' + b64; });
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-26 * Math.PI / 180);
    const scale = Math.max(W / 1400, H / 1400, 1);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 34px Arial, sans-serif';
    ctx.fillStyle = 'rgba(75,58,143,0.16)';
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        ctx.fillText(t, dx * 420, dy * 420);
        ctx.font = '700 14px Arial, sans-serif';
        ctx.fillStyle = 'rgba(75,58,143,0.12)';
        ctx.fillText(s, dx * 420, dy * 420 + 40);
        ctx.font = '800 34px Arial, sans-serif';
        ctx.fillStyle = 'rgba(75,58,143,0.16)';
      }
    }
    ctx.restore();
    ctx.font = '700 15px Arial, sans-serif';
    ctx.fillStyle = 'rgba(75,58,143,0.85)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(b, W - 16, 12);
    return jpg ? c.toDataURL('image/jpeg', 0.82).split(',')[1] : c.toDataURL('image/png').split(',')[1];
  };
}

async function stampImages() {
  if (!STAMP_FILES.length) { console.error('watermark: --stamp needs image paths'); process.exit(1); }
  const files = STAMP_FILES.filter(f => fs.existsSync(f) && /\.(png|jpe?g|webp)$/i.test(f));
  if (!files.length) { console.error('watermark: no image files matched'); process.exit(1); }
  const jpg = args.includes('--jpg');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run', '--disable-gpu'] });
  const page = await browser.newPage();
  for (const f of files) {
    const b64 = fs.readFileSync(f).toString('base64');
    const res = await page.evaluate(makeStampScript(), b64, DEFAULT_TEXT, DEFAULT_SUB, 'PURELANE · CONFIDENTIAL PROTOTYPE', jpg);
    const ext = jpg ? 'jpg' : path.extname(f).replace(/^\./, '');
    const outName = path.basename(f).replace(/(\.[a-z0-9]+)$/i, '-wm.' + ext);
    const outPath = path.join(OUT_DIR === '.' ? path.dirname(f) : path.resolve(OUT_DIR), outName);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(res, 'base64'));
    console.log('watermark: stamped ->', path.relative(process.cwd(), outPath));
  }
  await browser.close();
}

(async () => {
  if (IN) buildPreview();
  else if (STAMP) await stampImages();
  else {
    console.error(`usage:
  node scripts/watermark.js --in <design.html> [--out preview.html] [--blur "sel1, .sel2"]
  node scripts/watermark.js --stamp <img...> [--out-dir dir]`);
    process.exit(1);
  }
})().catch(e => { console.error('watermark: ERROR', e.message); process.exit(1); });
