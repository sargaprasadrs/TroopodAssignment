// live-check.js — interactive QA pass against the running theme dev server.
// Usage: node live-check.js   (server expected at http://localhost:9292)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.PX_URL || 'http://localhost:9292/';
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const consoleErrors = [];
  const failedReqs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', r => failedReqs.push(r.url()));

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Section presence + product card data
  const sections = await page.evaluate(() => {
    const sels = { hero: 'section.pl-hero', shop: '#shop', combos: '#combos', bundles: '#bundles', reviews: '#reviews' };
    const out = {};
    for (const [k, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      if (!el) { out[k] = 'MISSING'; continue; }
      out[k] = { h: Math.round(el.getBoundingClientRect().height) };
      if (k === 'shop' || k === 'combos') {
        const cards = [...el.querySelectorAll('[class*="card"]')].filter(c => c.querySelector('h3,h4,a[href*="products"]'));
        out[k].cards = cards.length;
        const first = cards[0];
        out[k].firstCardText = first ? first.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : null;
      }
    }
    out.bodyText = document.body.innerText.slice(0, 400).replace(/\s+/g, ' ');
    return out;
  });

  // 2. Focus pass — 12 real Tab stops via CDP keyboard events
  const focusStops = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    focusStops.push(await page.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return { tag: a.tagName, txt: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40), outline: cs.outlineStyle + ' ' + cs.outlineWidth, hasRing: cs.outlineStyle !== 'none' || parseFloat((cs.boxShadow || '').split(' ')[2] || 0) > 2 };
    }));
  }
  const firstFocus = focusStops[0];
  const thirdFocus = focusStops[2];

  // 4. Reduced motion
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.reload({ waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  const rm = await page.evaluate(() => ({
    animations: document.getAnimations().length,
    revealHidden: [...document.querySelectorAll('.rv, [data-scroll-fade]')].filter(e => getComputedStyle(e).opacity === '0').length,
    revealCount: document.querySelectorAll('.rv, [data-scroll-fade]').length,
  }));

  // 5. Full page screenshot
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: path.join(OUT, 'live-homepage.png'), fullPage: true });

  const report = {
    consoleErrors,
    failedReqs: failedReqs.slice(0, 5),
    sections,
    firstFocus,
    thirdFocus,
    reducedMotion: rm,
    pageHeight: h,
  };
  fs.writeFileSync(path.join(OUT, 'live-check.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error('LIVE CHECK ERROR', e.message); process.exit(1); });
