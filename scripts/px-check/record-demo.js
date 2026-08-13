#!/usr/bin/env node
/**
 * =============================================================================
 * record-demo.js — record a short demo video of the Purelane prototype working
 * =============================================================================
 * Records the WATERMARKED read-only preview (preview/purelane-preview.html) so
 * the video itself carries the semi-transparent watermark. Scrolls through the
 * five sections with pauses, capturing frames via Chrome's compositor screencast
 * (CDP Page.startScreencast — much faster than repeated page.screenshot on a
 * page with heavy SVG layers), then encodes them into a small WebM with ffmpeg
 * (bundled via ffmpeg-static — no system install).
 *
 *   node scripts/px-check/record-demo.js
 *   DEMO_URL=file:///path/to/preview.html node scripts/px-check/record-demo.js
 *
 * Requires: npm install in scripts/px-check (puppeteer-core + ffmpeg-static)
 * =============================================================================
 */
const puppeteer = require('puppeteer-core');
const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = process.env.PX_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PREVIEW = path.join(__dirname, '..', '..', 'preview', 'purelane-preview.html');
const URL = process.env.DEMO_URL || 'file:///' + PREVIEW.replace(/\\/g, '/');
const WIDTH = +(process.env.DEMO_WIDTH || 1440);
const HEIGHT = +(process.env.DEMO_HEIGHT || 900);
const OUT = process.env.DEMO_OUT || path.join(__dirname, '..', '..', 'delivery', 'purelane-demo.webm');
const DURATION = +(process.env.DEMO_DURATION || 15000); // ms
// Optional: hide the heavy animated layers during recording (barely visible in
// the final design, but much easier for the compositor to keep up with).
const HIDE_FOR_RECORDING = process.env.DEMO_HIDE || '.bub'; // bubbles are the most costly animation

// Timeline: [label, selector/scrollTarget, startMs, holdMs] — scroll happens at startMs
const STEPS = [
  ['hero',    0,          0,    2800],
  ['shop',    '#shop',    2800, 2600],
  ['combos',  '#combos',  5400, 2600],
  ['bundles', '#bundles', 8000, 2600],
  ['reviews', '#reviews', 10600, 2600],
  ['top',     0,          13200, 1800],
];

(async () => {
  if (!ffmpegStatic) { console.error('ffmpeg-static not found — run `npm install` in scripts/px-check'); process.exit(1); }
  const framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pl-demo-'));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  console.log('record-demo: recording', URL, `(${WIDTH}x${HEIGHT}, ${DURATION / 1000}s)`);
  // GPU enabled for compositor speed; screencast frames come from the browser.
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  const client = await page.createCDPSession();
  await client.send('Page.enable');
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500)); // let fonts/animations settle

  if (HIDE_FOR_RECORDING) {
    await page.addStyleTag({ content: `${HIDE_FOR_RECORDING}{display:none!important}` });
    await new Promise(r => setTimeout(r, 300));
  }

  let frame = 0;
  const t0 = Date.now();
  client.on('Page.screencastFrame', ({ data, sessionId }) => {
    frame += 1;
    fs.writeFileSync(path.join(framesDir, String(frame).padStart(4, '0') + '.jpg'), Buffer.from(data, 'base64'));
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 });

  // Drive the scroll timeline on a fixed cadence (independent of frame flow).
  const scrollTimer = setInterval(async () => {
    const elapsed = Date.now() - t0;
    if (elapsed > DURATION) return;
    const step = STEPS.filter(s => elapsed >= s[2]).pop();
    if (!step) return;
    if (step[1] !== 0) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, step[1]);
    } else if (elapsed > 500) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, 100);

  await new Promise(r => setTimeout(r, DURATION + 600));
  clearInterval(scrollTimer);
  await client.send('Page.stopScreencast').catch(() => {});
  await browser.close();

  console.log('record-demo: captured', frame, 'frames in', (Date.now() - t0) / 1000, 's');
  if (frame < 10) {
    fs.rmSync(framesDir, { recursive: true, force: true });
    console.error('record-demo: too few frames — aborting (try DEMO_HIDE=".wl,.bub" or DEMO_WIDTH=960)');
    process.exit(1);
  }

  const fps = Math.max(1, Math.round(frame / (DURATION / 1000)));
  const args = [
    '-y', '-framerate', String(fps),
    '-i', path.join(framesDir, '%04d.jpg'),
    '-c:v', 'libvpx', '-b:v', '900k', '-quality', 'good', '-cpu-used', '5',
    '-pix_fmt', 'yuv420p', OUT,
  ];
  await new Promise((resolve, reject) => {
    const ff = spawn(ffmpegStatic, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    ff.stderr.on('data', d => { err += d; });
    ff.on('error', reject);
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg exited ' + code + ': ' + err.slice(-500))));
  });
  fs.rmSync(framesDir, { recursive: true, force: true });
  const sizeKb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log('record-demo: wrote', path.relative(process.cwd(), OUT), `(${sizeKb} KB, ~${fps}fps)`);
})().catch(e => { console.error('record-demo: ERROR', e.message); process.exit(1); });
