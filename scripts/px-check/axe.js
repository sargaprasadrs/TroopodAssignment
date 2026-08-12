const puppeteer = require('puppeteer-core');
const axeSource = require('axe-core').source;
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.PX_URL || 'file:///C:/Users/LOQ/Desktop/TroopodAssignment/purelane-homepage.html';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] },
      resultTypes: ['violations']
    });
  });
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', 'axe-report.json'), JSON.stringify(results.violations, null, 2));
  console.log('TOTAL VIOLATIONS:', results.violations.length);
  for (const v of results.violations) {
    const t = v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ');
    console.log('[' + v.impact + '] ' + v.id + ' x' + v.nodes.length + '  ->  ' + t);
  }
  await browser.close();
})().catch(e => { console.error('AXE ERROR', e.message); process.exit(1); });
