const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.PX_URL || 'file:///C:/Users/LOQ/Desktop/TroopodAssignment/purelane-homepage.html';
const WIDTHS = [375, 768, 1024, 1440];
const SECTIONS = [['hero','section.hero'],['shop','#shop'],['combos','#combos'],['bundles','#bundles'],['reviews','#reviews']];
const OUT = path.join(__dirname, 'prototype');
const report = {};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run','--disable-gpu'] });
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 900));
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: path.join(OUT, w + '.png'), fullPage: true });
    report[w] = { pageHeight: h };
    for (const [name, sel] of SECTIONS) {
      const el = await page.$(sel);
      if (el) await el.screenshot({ path: path.join(OUT, 'sec-' + w + '-' + name + '.png') });
      else report[w][name] = 'MISSING';
    }
    await page.close();
  }
  await browser.close();
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', 'capture-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error('CAPTURE ERROR', e.message); process.exit(1); });
