const puppeteer = require('puppeteer-core');

// Credentials come from env only — never hardcode store passwords in this repo.
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const STORE = process.env.PX_STORE || 'https://purelane-dev-rzcwvlkv.myshopify.com';
const PASSWORD = process.env.PX_PASSWORD;
if (!PASSWORD) {
  console.error('PX_PASSWORD env var required (storefront password for the dev store)');
  process.exit(1);
}

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setDefaultNavigationTimeout(90000);
  const base = STORE;
  await p.goto(base + '/password', { waitUntil: 'networkidle2' });
  await p.type('#password', PASSWORD);
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    p.click('button[type=submit], input[type=submit]')
  ]);
  const cookies = await p.cookies();
  const digest = cookies.filter(c => /digest|secure_customer/i.test(c.name)).map(c => c.name).join(',');
  console.log('digest cookies:', digest || 'none');
  await p.goto(base + '/?preview_theme_id=160989905142', { waitUntil: 'networkidle2' });
  console.log('preview URL:', p.url());
  const html = await p.content();
  console.log('slide refs:', (html.match(/pl-hslide/g) || []).length, 'dots:', (html.match(/pl-hdot/g) || []).length);
  const labels = [...html.matchAll(/class="pl-hslide[^"]*"[^>]*aria-label="([^"]*)"/g)].map(m => m[1]);
  console.log('slide labels:', JSON.stringify(labels));
  await b.close();
})().catch(e => { console.log('ERR:', e.message); process.exit(1); });
