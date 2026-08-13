const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// Credentials come from env only — never hardcode store passwords in this repo.
const STORE = process.env.PX_STORE || 'https://purelane-dev-rzcwvlkv.myshopify.com';
const PASSWORD = process.env.PX_PASSWORD;
if (!PASSWORD) {
  console.error('PX_PASSWORD env var required (storefront password for the dev store)');
  process.exit(1);
}
const OUT = path => path;

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const assetRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('requestfailed', r => failedRequests.push({ url: r.url(), err: r.failure().errorText }));
  page.on('response', r => {
    if (/purelane\.(css|js)/.test(r.url())) assetRequests.push({ url: r.url(), status: r.status() });
  });

  // 1. Load storefront; handle password gate
  await page.goto(STORE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (/password/i.test(page.url()) || (await page.$('#password'))) {
    await page.type('#password', PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
      page.click('button[type="submit"], input[type="submit"]')
    ]);
    // navigate to homepage root
    await page.goto(STORE + '/', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  } else {
    await page.waitForNetworkIdle({ idleTime: 1500, timeout: 30000 }).catch(() => {});
  }

  await page.setViewport({ width: 1440, height: 900 });

  // 2. Hero verification
  const hero = await page.evaluate(() => {
    const sec = document.querySelector('section.pl-hero, section.hero');
    if (!sec) return { found: false };
    const slides = [...sec.querySelectorAll('[data-slide], .pl-hslide')];
    const dots = [...sec.querySelectorAll('.pl-hdots button, .pl-hdot')];
    const imgs = [...sec.querySelectorAll('.pl-hstage img')].map(i => ({
      src: i.src.slice(0, 120), naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight,
      loading: i.loading, fetchpriority: i.getAttribute('fetchpriority')
    }));
    return {
      found: true,
      title: (sec.querySelector('h1') || {}).innerText || null,
      slideCount: slides.length,
      dotCount: dots.length,
      slideLabels: slides.map(s => (s.innerText || '').trim().slice(0, 80)),
      imgs
    };
  });

  // 3. Hero block geometry / slide visibility
  const vis = await page.evaluate(() => {
    const sec = document.querySelector('section.pl-hero, section.hero');
    if (!sec) return null;
    const stage = sec.querySelector('.pl-hstage');
    const slides = [...sec.querySelectorAll('[data-slide], .pl-hslide')];
    return {
      stage: stage ? stage.getBoundingClientRect().height : null,
      slides: slides.map(s => { const r = s.getBoundingClientRect(); return { h: Math.round(r.height), opacity: getComputedStyle(s).opacity, visible: r.width > 0 && getComputedStyle(s).visibility !== 'hidden' }; })
    };
  });

  // 4. Full-page screenshot + hero crop as evidence
  await page.screenshot({ path: 'out/live-hero-full.png', fullPage: true });
  const heroEl = await page.$('section.pl-hero, section.hero');
  if (heroEl) await heroEl.screenshot({ path: 'out/live-hero-section.png' });

  const report = {
    url: page.url(),
    title: await page.title(),
    hero,
    vis,
    assetRequests,
    failedRequests: failedRequests.slice(0, 10),
    consoleErrors: consoleErrors.slice(0, 10)
  };
  fs.writeFileSync('out/live-hero.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await browser.close();
})();
