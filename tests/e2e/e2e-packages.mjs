// Packages E2E. Needs a production build first (`npm run build`), then: node tests/e2e/e2e-packages.mjs
// Runs `next start` on a test port so the user's dev server (3000) keeps running.
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PORT = process.env.E2E_APP_PORT ?? '3100';
const APP = `http://localhost:${PORT}`;
const SHOTS = process.env.SHOTS_DIR;

let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (url) => { for (let i = 0; i < 60; i++) { try { await fetch(url); return; } catch { await wait(500); } } throw new Error('not up: ' + url); };
const killTree = (p) => { try { process.platform === 'win32' ? execSync(`taskkill /pid ${p.pid} /T /F`, { stdio: 'ignore' }) : process.kill(-p.pid); } catch {} };

// A stale server on the test port would make us test an old build.
if (await fetch(APP).then(() => true, () => false)) throw new Error(`port ${PORT} is already in use; stop that server first`);
const server = spawn(`npx next start -p ${PORT}`, { cwd: ROOT, shell: true, env: { ...process.env, ADMIN_TOKEN: '' }, detached: process.platform !== 'win32' });
const stop = () => killTree(server);
const crash = (e) => { console.log('Error:', String(e?.message ?? e).split(/\r?\n/)[0]); stop(); process.exit(1); };
process.on('uncaughtException', crash); process.on('unhandledRejection', crash);
await waitFor(APP);

const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: true });
const errors = [];
const newPage = async (viewport, colorScheme = 'light') => {
  const page = await (await browser.newContext({ viewport, colorScheme })).newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  // HTTP error statuses (the deliberate 404 visit, the favicon) are checked explicitly, not as console noise.
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push('console: ' + m.text()));
  return page;
};

const desktop = await newPage({ width: 1440, height: 900 });
const phone = await newPage({ width: 390, height: 844 });

// Home teaser: the client's priced tours
await desktop.goto(APP);
const teasers = desktop.locator('#packages a.teaser');
check('home shows the 3 client tour packages', JSON.stringify(await teasers.locator('.teaser-name').allInnerTexts()) === JSON.stringify(['Kasol Tour', 'Kasol Tour', 'Manali Tour']));
check('teasers show days and the client prices', JSON.stringify(await teasers.locator('.teaser-days').allInnerTexts()) === JSON.stringify(['3 days, 2 nights', '4 days, 3 nights', '4 days, 3 nights']) && JSON.stringify(await teasers.locator('.teaser-price strong').allInnerTexts()) === JSON.stringify(['₹17,000', '₹13,900', '₹16,500']));
check('only the 3 day Kasol tour says all included', (await teasers.nth(0).innerText()).includes('per person, all included') && !(await teasers.nth(1).innerText()).includes('all included'));
await teasers.nth(2).click();
check('clicking a teaser opens that tour on /packages', await desktop.waitForURL(APP + '/packages#manali-4d').then(() => true, () => false) && await desktop.locator('#manali-4d .package-name').isVisible());

// Packages page
const res = await desktop.goto(APP + '/packages');
check('/packages responds 200 with its own title', res.status() === 200 && (await desktop.title()).startsWith('Tour packages'));
check('one h1 on the packages page', (await desktop.locator('h1').count()) === 1);
check('page heading lines up with the package cards', await desktop.evaluate(() => Math.abs(document.querySelector('.page-head h1').getBoundingClientRect().left - document.querySelector('article.package').getBoundingClientRect().left) < 2));
const tourCards = desktop.locator('section[aria-labelledby=tours-title] article.package');
const planCards = desktop.locator('section[aria-labelledby=plans-title] article.package:not(.package-custom)');
check('3 priced tours and 3 yatra plans plus a custom card', (await tourCards.count()) === 3 && (await planCards.count()) === 3 && (await desktop.locator('#custom').isVisible()));
check('tour prices on the page match the client', JSON.stringify(await tourCards.locator('.price strong').allInnerTexts()) === JSON.stringify(['₹17,000', '₹13,900', '₹16,500']));
check('yatra plans show no price', !/₹|Rs\.?\s?\d|INR/.test(await desktop.locator('section[aria-labelledby=plans-title]').innerText()));
check('each plan shows days, start, car and a route of 4+ stops', await planCards.evaluateAll((els) => els.every((el) => el.querySelectorAll('.package-facts li').length === 3 && el.querySelectorAll('.route li').length >= 4)));
const tourHref = await desktop.locator('#kasol-3d').getByRole('link', { name: 'Book on WhatsApp' }).getAttribute('href');
check('tour button prefills the package and its length on WhatsApp', tourHref === 'https://wa.me/917310224488?text=' + encodeURIComponent('Hi Dhruv Fine Trip, I want to book the Kasol Tour (3 days, 2 nights) package.'), tourHref);
const fareHref = await desktop.locator('#chardham').getByRole('link', { name: 'Ask fare on WhatsApp' }).getAttribute('href');
check('plan button asks the fare for that plan on WhatsApp', fareHref === 'https://wa.me/917310224488?text=' + encodeURIComponent('Hi Dhruv Fine Trip, please share the fare for the Chardham Yatra package.'), fareHref);
check('custom trip button opens WhatsApp', (await desktop.locator('#custom a').getAttribute('href')).startsWith('https://wa.me/917310224488?text='));
check('voice booking buttons go to the home booking section', (await tourCards.first().getByRole('link', { name: 'Book by voice' }).getAttribute('href')) === '/#book');
for (let i = 0; i < 6; i++) await desktop.locator('article.package').nth(i).scrollIntoViewIfNeeded();
check('package photos load', await desktop.waitForFunction(() => [...document.querySelectorAll('.package-photo img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 10000 }).then(() => true, () => false));
check('nav has a Packages link', (await desktop.locator('nav[aria-label=Main] a', { hasText: 'Packages' }).getAttribute('href')) === '/packages');

// Phone
await phone.goto(APP + '/packages');
check('phone: no horizontal scroll on /packages', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
check('phone: package buttons are full width and thumb-sized', await phone.locator('#kasol-3d .package-actions .btn').evaluateAll((bs) => bs.every((b) => b.getBoundingClientRect().width > 300 && b.getBoundingClientRect().height >= 44)));
check('phone: action bar still there', await phone.locator('nav[aria-label="Quick actions"]').isVisible());

if (SHOTS) {
  await phone.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await phone.evaluate(() => window.scrollTo(0, document.querySelector('#kasol-3d').offsetTop - 70));
  await wait(1200);
  await phone.screenshot({ path: `${SHOTS}/packages-phone.png` });
  await desktop.goto(APP);
  await desktop.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await desktop.evaluate(() => window.scrollTo(0, document.querySelector('#packages').offsetTop - 70));
  await wait(1200);
  await desktop.screenshot({ path: `${SHOTS}/teaser-desktop.png` });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
