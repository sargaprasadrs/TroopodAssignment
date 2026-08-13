const puppeteer = require('puppeteer-core');
// Credentials come from env only — never hardcode store passwords in this repo.
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const STORE = process.env.PX_STORE || 'https://purelane-dev-rzcwvlkv.myshopify.com';
const PASSWORD = process.env.PX_PASSWORD;
if (!PASSWORD) {
  console.error('PX_PASSWORD env var required (storefront password for the dev store)');
  process.exit(1);
}
const base = STORE;
const storeHost = new URL(base).host;

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setDefaultNavigationTimeout(60000);

  await p.goto(base + '/password', { waitUntil: 'networkidle2' });
  await p.type('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('button[type=submit], input[type=submit]')]);

  const consoleErrors = [];
  const failedReqs = [];
  const badStatus = [];
  const assetStatus = {};
  p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
  p.on('requestfailed', r => failedReqs.push({ url: r.url().slice(0, 120), err: r.failure() ? r.failure().errorText : '' }));
  p.on('response', r => {
    const u = r.url();
    if (/purelane\.(css|js)/.test(u)) assetStatus[u.split('/').pop().split('?')[0]] = r.status();
    if (r.status() >= 400 && u.includes(storeHost)) badStatus.push({ status: r.status(), url: u.slice(0, 140) });
  });

  await p.goto(base + '/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const home = await p.evaluate(() => {
    const sec = document.querySelector('section.pl-hero, section.hero');
    const stage = sec ? sec.querySelector('.pl-hstage') : null;
    return {
      title: document.title,
      sections: {
        hero: !!document.querySelector('#hero, section.pl-hero'),
        shop: !!document.querySelector('#shop'),
        combos: !!document.querySelector('#combos'),
        bundles: !!document.querySelector('#bundles'),
        reviews: !!document.querySelector('#reviews'),
      },
      heroSlides: stage ? stage.querySelectorAll('.pl-hslide').length : 0,
      heroLabels: stage ? [...stage.querySelectorAll('.pl-hslide')].map(s => (s.getAttribute('aria-label') || '').slice(0, 30)) : [],
      bodyLen: document.body.innerText.length,
    };
  });

  const pages = {};
  for (const [name, path] of [['product', '/products/sample-product'], ['collection', '/collections/all'], ['cart', '/cart'], ['search', '/search?q=clean'], ['404', '/does-not-exist']]) {
    try {
      const resp = await p.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
      pages[name] = { status: resp.status(), title: await p.title() };
    } catch (e) {
      pages[name] = { status: 'ERR', err: e.message.slice(0, 100) };
    }
  }

  const report = { home, pages, assetStatus, badStatus: badStatus.slice(0, 6), failedReqs: failedReqs.slice(0, 4), consoleErrors: consoleErrors.slice(0, 6) };
  console.log(JSON.stringify(report, null, 2));
  await b.close();
})().catch(e => { console.log('QA ERROR:', e.message); process.exit(1); });
