// Booking form E2E. Needs a production build first (`npm run build`), then: node tests/e2e/e2e-booking.mjs
// Runs `next start` on a test port so the user's dev server (3000) keeps running. WhatsApp is never opened for real.
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
const newPage = async (viewport) => {
  const page = await (await browser.newContext({ viewport })).newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push('console: ' + m.text()));
  // Record WhatsApp links instead of opening them.
  await page.addInitScript(() => { window.__opened = []; window.open = (url) => { window.__opened.push(url); return null; }; });
  return page;
};
const opened = (page) => page.evaluate(() => window.__opened.map((u) => new URL(u).searchParams.get('text')));
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nice = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const today = new Date();
const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

const desktop = await newPage({ width: 1440, height: 900 });
await desktop.goto(APP);
const book = desktop.locator('#book');
const form = book.locator('form');
const send = () => desktop.getByRole('button', { name: 'Send booking on WhatsApp' }).click();

check('booking section exists with a heading', (await book.count()) === 1 && (await book.locator('h2').innerText()) === 'Tell us your trip in a minute');
check('every input has a visible label', await form.evaluate((f) => [...f.querySelectorAll('input:not([type=radio]), select')].every((el) => f.querySelector(`label[for="${el.id}"]`))));
check('date cannot be set before today', (await form.locator('#book-date').getAttribute('min')) === iso(today));

// Empty submit
await send();
check('empty form shows pickup, drop and date errors', (await form.locator('.field-error').count()) === 3 && (await form.locator('[aria-invalid=true]').count()) === 3);
check('focus moves to the first problem (pickup)', await desktop.evaluate(() => document.activeElement.id === 'book-pickup'));
check('errors are linked to their fields for screen readers', (await form.locator('#book-pickup').getAttribute('aria-describedby')) === 'book-pickup-error');
check('nothing is sent while the form has errors', (await opened(desktop)).length === 0);
await form.locator('#book-pickup').fill('Zirakpur');
check('typing in a field clears its error', (await form.locator('#book-pickup-error').count()) === 0 && (await form.locator('.field-error').count()) === 2);

// Past date
await form.locator('#book-drop').fill('Delhi');
await form.locator('#book-date').fill(iso(yesterday));
await send();
check('a past date is refused', /already passed/.test(await form.locator('#book-date-error').innerText()) && (await opened(desktop)).length === 0);

// Valid booking
await form.locator('#book-date').fill(iso(inThreeDays));
await form.locator('#book-time').fill('06:30');
await form.locator('label.trip-option', { hasText: 'Round trip' }).click();
await form.locator('#book-car').selectOption('Toyota Innova Crysta');
await form.locator('#book-people').fill('5');
await form.locator('#book-name').fill('Test Traveller');
await send();
const expected = `Hi Dhruv Fine Trip, I want to book a taxi.\nTrip: Round trip\nFrom: Zirakpur\nTo: Delhi\nDate: ${nice(inThreeDays)}\nTime: 06:30\nCar: Toyota Innova Crysta\nPeople: 5\nName: Test Traveller`;
const sent = await opened(desktop);
check('a valid booking opens WhatsApp with every detail', sent.length === 1 && sent[0] === expected, JSON.stringify(sent[0]));
const firstUrl = await desktop.evaluate(() => window.__opened[0]);
check('WhatsApp goes to the business number', firstUrl.startsWith('https://wa.me/917310224488?text='));
check('a confirmation shows with a link to open WhatsApp again', (await book.getByRole('status').isVisible()) && (await book.getByRole('link', { name: 'Open WhatsApp again' }).getAttribute('href')) === firstUrl);
await book.getByRole('button', { name: 'Book another trip' }).click();
check('Book another trip clears the form', (await form.locator('#book-pickup').inputValue()) === '' && (await form.locator('#book-car').inputValue()) === '');

// Book buttons elsewhere on the page prefill the form
await desktop.locator('#fleet li.fleet-card', { hasText: 'Maruti Ertiga' }).getByRole('link', { name: 'Book this car' }).click();
check('Book this car picks that car and goes to the form', (await form.locator('#book-car').inputValue()) === 'Maruti Ertiga' && desktop.url().endsWith('#book'));
await desktop.locator('a.destination-card', { hasText: 'Delhi' }).click();
check('a destination fills the drop and resets the rest', (await form.locator('#book-drop').inputValue()) === 'Delhi' && (await form.locator('#book-car').inputValue()) === '');
await desktop.locator('a.destination-card', { hasText: 'Chandigarh tricity' }).click();
check('the tricity card picks daily pick and drop', await form.locator('input[name=trip][value="Daily pick and drop"]').isChecked());
check('hero Book a ride opens the form', (await desktop.locator('section.hero').getByRole('link', { name: 'Book a ride' }).getAttribute('href')) === '#book');
check('no page promises voice booking any more', !/by voice|booking assistant|tap the mic/i.test(await desktop.locator('body').innerText()));

// From the packages page
await desktop.goto(APP + '/packages');
check('no voice promise on the packages page', !/by voice|booking assistant/i.test(await desktop.locator('body').innerText()));
await desktop.locator('#kasol-3d').getByRole('link', { name: 'Use the booking form' }).click();
await desktop.waitForURL(/\/\?package=.*#book$/);
check('a package opens the home form with the package filled in', (await desktop.locator('.booking-package').isVisible()) && (await desktop.locator('.booking-package strong').innerText()) === 'Kasol Tour (3 days, 2 nights)');
check('a package booking does not ask for a drop', (await desktop.locator('#book-drop').count()) === 0);
await desktop.locator('#book-pickup').fill('Mohali');
await desktop.locator('#book-date').fill(iso(inThreeDays));
await send();
const pkgSent = await opened(desktop);
check('the package booking message names the package', pkgSent.length === 1 && pkgSent[0].startsWith('Hi Dhruv Fine Trip, I want to book a taxi.\nPackage: Kasol Tour (3 days, 2 nights)\nFrom: Mohali\nDate: '), JSON.stringify(pkgSent[0]));
await desktop.goto(APP + '/?package=' + encodeURIComponent('Chardham Yatra') + '#book');
await desktop.locator('.booking-package').getByRole('button', { name: 'Remove' }).click();
check('removing the package brings the drop field back', await desktop.locator('#book-drop').isVisible());

// Phone
const phone = await newPage({ width: 390, height: 844 });
await phone.goto(APP + '/#book');
check('phone: no horizontal scroll', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
check('phone: inputs are 48px tall with 16px text (no zoom on iPhone)', await phone.locator('#book form').evaluate((f) => [...f.querySelectorAll('.field input, .field select')].every((el) => el.getBoundingClientRect().height >= 48 && parseFloat(getComputedStyle(el).fontSize) >= 16)));
await phone.getByRole('button', { name: 'Send booking on WhatsApp' }).click();
check('phone: date and time stay level when the date shows an error', await phone.evaluate(() => Math.abs(document.querySelector('#book-date').getBoundingClientRect().top - document.querySelector('#book-time').getBoundingClientRect().top) < 1));
check('phone: send button is full width', await phone.getByRole('button', { name: 'Send booking on WhatsApp' }).evaluate((b) => b.getBoundingClientRect().width > 300));
check('phone: action bar Book goes to the form', (await phone.locator('nav[aria-label="Quick actions"] a', { hasText: 'Book' }).getAttribute('href')) === '/#book');

if (SHOTS) {
  await phone.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await phone.evaluate(() => window.scrollTo(0, document.querySelector('#book form').getBoundingClientRect().top + scrollY - 80));
  await wait(800);
  await phone.screenshot({ path: `${SHOTS}/book-phone.png` });
  await phone.getByRole('button', { name: 'Send booking on WhatsApp' }).click();
  await wait(300);
  await phone.screenshot({ path: `${SHOTS}/book-phone-errors.png` });
  await desktop.goto(APP + '/#book');
  await desktop.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await desktop.evaluate(() => window.scrollTo(0, document.querySelector('#book').offsetTop - 72));
  await wait(1200);
  await desktop.screenshot({ path: `${SHOTS}/book-desktop.png` });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
