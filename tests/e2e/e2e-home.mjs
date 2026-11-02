// Home page E2E. Needs a production build first (`npm run build`), then: node tests/e2e/e2e-home.mjs
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
const res = await desktop.goto(APP);
check('home responds 200', res.status() === 200);
check('security headers set', res.headers()['x-content-type-options'] === 'nosniff');
check('html lang is set', (await desktop.getAttribute('html', 'lang')) === 'en');
check('one h1, the hero promise', (await desktop.locator('h1').count()) === 1 && /Reliable taxi for every route/.test(await desktop.locator('h1').innerText()));

// Hero CTAs
const hero = desktop.locator('section.hero');
check('Book a ride goes to the booking section', (await hero.getByRole('link', { name: 'Book a ride' }).getAttribute('href')) === '#book');
check('hero Call shows and dials the number', (await hero.getByRole('link', { name: 'Call 73102 24488' }).getAttribute('href')) === 'tel:+917310224488');
const heroWa = await hero.getByRole('link', { name: 'WhatsApp', exact: true }).getAttribute('href');
check('hero WhatsApp opens the chat with a booking message', heroWa === 'https://wa.me/917310224488?text=' + encodeURIComponent('Hi Dhruv Fine Trip, I want to book a taxi.'), heroWa);
check('voice card points to the booking assistant', (await hero.locator('a.hero-assistant').getAttribute('href')) === '#book' && (await hero.locator('a.hero-assistant').innerText()).includes('Book by voice'));
const heroImg = hero.locator('.hero-media img');
check('hero photo loads first (priority, not lazy)', (await heroImg.getAttribute('loading')) !== 'lazy' && (await heroImg.getAttribute('fetchpriority')) === 'high' && (await heroImg.evaluate((i) => i.complete && i.naturalWidth > 0)));
check('hero photo has descriptive alt text', (await heroImg.getAttribute('alt')).includes('Lahaul, Himachal Pradesh'));
// Contrast: white text needs a dark scrim; its lightest stop must stay at alpha >= 0.45.
const scrimAlpha = (el) => {
  const scrim = getComputedStyle(el.querySelector('.hero-media'), '::after');
  const alphas = [...`${scrim.backgroundColor} ${scrim.backgroundImage}`.matchAll(/rgba\([^)]*,\s*([0-9.]+)\)/g)].map((m) => Number(m[1])).filter((a) => a > 0);
  return alphas.length ? Math.min(...alphas) : 0;
};
check('hero text is white over a dark scrim (desktop)', await hero.evaluate((el, fn) => getComputedStyle(el.querySelector('h1')).color === 'rgb(255, 255, 255)' && new Function(`return ${fn}`)()(el) >= 0.45, scrimAlpha.toString()));
check('hero mentions the Chardham Yatra', (await hero.innerText()).includes('Chardham Yatra'));

const phone = await newPage({ width: 390, height: 844 });
await phone.goto(APP);
check('hero CTAs visible on phone without scrolling', await phone.getByRole('link', { name: 'Book a ride' }).evaluate((el) => el.getBoundingClientRect().bottom <= window.innerHeight));
check('hero text is white over a dark scrim (phone)', await phone.locator('section.hero').evaluate((el, fn) => getComputedStyle(el.querySelector('h1')).color === 'rgb(255, 255, 255)' && new Function(`return ${fn}`)()(el) >= 0.45, scrimAlpha.toString()));
check('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

const iconHref = await desktop.locator('link[rel=icon]').first().getAttribute('href', { timeout: 2000 }).catch(() => null);
check('favicon (app/icon.svg) is linked and served', !!iconHref && (await desktop.request.get(APP + iconHref)).status() === 200);
const header = desktop.locator('header.site-header');
check('header logo shows the mark and the name', await header.locator('a.logo svg').isVisible() && (await header.locator('a.logo').innerText()).includes('Dhruv Fine Trip'));

// Fleet
const fleetCards = desktop.locator('#fleet li.fleet-card');
check('fleet shows the five vehicles', JSON.stringify(await fleetCards.locator('h3').allInnerTexts()) === JSON.stringify(['Toyota Innova Crysta', 'Maruti Ertiga', 'Toyota Etios', 'Swift Dzire', 'Tempo Traveller']));
check('each car shows its seats', JSON.stringify(await fleetCards.locator('.seats').allInnerTexts()) === JSON.stringify(['7 + 1 seats', '6 + 1 seats', '4 + 1 seats', '4 + 1 seats', 'Group travel']));
check('each car has a Book this car link to #book', (await fleetCards.getByRole('link', { name: 'Book this car' }).evaluateAll((as) => as.map((a) => a.getAttribute('href')))).every((h) => h === '#book') && (await fleetCards.getByRole('link', { name: 'Book this car' }).count()) === 5);
const photos = fleetCards.locator('.fleet-photo img');
check('each car has a photo with its name as alt text', JSON.stringify(await photos.evaluateAll((imgs) => imgs.map((i) => i.alt))) === JSON.stringify(['Toyota Innova Crysta', 'Maruti Ertiga', 'Toyota Etios', 'Swift Dzire', 'Tempo Traveller']));
await desktop.locator('#fleet').scrollIntoViewIfNeeded();
for (let i = 0; i < 5; i++) await photos.nth(i).scrollIntoViewIfNeeded();
check('all car photos load (optimised by next/image)', await desktop.waitForFunction(() => [...document.querySelectorAll('.fleet-photo img')].every((i) => i.complete && i.naturalWidth > 0 && i.currentSrc.includes('/_next/image')), null, { timeout: 10000 }).then(() => true, () => false));
check('nav Fleet link lands on the fleet section', (await desktop.locator('#fleet').count()) === 1);

// Header: desktop nav + call button
const navHrefs = await desktop.locator('nav[aria-label=Main] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
check('desktop nav links to the 4 sections', JSON.stringify(navHrefs) === JSON.stringify(['/#fleet', '/#services', '/#book', '/#contact']), JSON.stringify(navHrefs));
check('Call now dials the first number', (await header.getByRole('link', { name: 'Call now' }).getAttribute('href')) === 'tel:+917310224488');
check('header stays on top while scrolling', await desktop.evaluate(() => getComputedStyle(document.querySelector('.site-header')).position === 'sticky'));
check('mobile menu button hidden on desktop', !(await desktop.getByRole('button', { name: 'Menu' }).isVisible()));

// Phone: nav collapses into a menu that opens, closes on Escape and on link click
// Phone: sticky action bar replaces the header Call button
const bar = phone.locator('nav[aria-label="Quick actions"]');
const barHrefs = await bar.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
check('phone action bar: Call, WhatsApp, Book', JSON.stringify(barHrefs) === JSON.stringify(['tel:+917310224488', 'https://wa.me/917310224488?text=' + encodeURIComponent('Hi Dhruv Fine Trip, I want to book a taxi.'), '/#book']), JSON.stringify(barHrefs));
check('action bar stays at the bottom of the screen', await bar.evaluate((el) => getComputedStyle(el).position === 'fixed' && Math.abs(el.getBoundingClientRect().bottom - window.innerHeight) < 2));
check('action bar buttons are thumb-sized (>= 48px)', (await bar.locator('a').evaluateAll((as) => as.every((a) => a.getBoundingClientRect().height >= 48))));
check('action bar labels fit inside their buttons', await bar.locator('a').evaluateAll((as) => as.every((a) => a.scrollWidth <= a.clientWidth)));
check('header Call hidden on phone (bar has it)', !(await phone.locator('.header-call').isVisible()));
await phone.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
check('action bar does not cover the footer at the bottom', await phone.evaluate(() => document.querySelector('.footer-bottom').getBoundingClientRect().bottom <= document.querySelector('.action-bar').getBoundingClientRect().top + 1));
await phone.evaluate(() => window.scrollTo(0, 0));
check('action bar hidden on desktop', !(await desktop.locator('nav[aria-label="Quick actions"]').isVisible()));
check('anchored sections land below the sticky header', await phone.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#fleet')).scrollMarginTop) >= document.querySelector('.site-header').offsetHeight));
check('fleet is one column on phone', await phone.locator('#fleet li.fleet-card').evaluateAll((li) => new Set(li.map((el) => Math.round(el.getBoundingClientRect().left))).size === 1));
check('Book this car is thumb-sized on phone', await phone.locator('#fleet .btn').first().evaluate((el) => el.getBoundingClientRect().height >= 44 && el.getBoundingClientRect().width > 300));
check('desktop nav hidden on phone', !(await phone.locator('nav[aria-label=Main]').isVisible()));
const menuButton = phone.locator('.mobile-menu button');
check('menu button starts collapsed', (await menuButton.getAttribute('aria-expanded')) === 'false');
await menuButton.click();
check('menu opens with 4 links', (await menuButton.getAttribute('aria-expanded')) === 'true' && (await phone.locator('#mobile-nav a').count()) === 4);
await phone.keyboard.press('Escape');
check('Escape closes the menu', !(await phone.locator('#mobile-nav').isVisible()));
await menuButton.click();
await phone.locator('#mobile-nav a', { hasText: 'Contact' }).click();
check('choosing a link closes the menu', !(await phone.locator('#mobile-nav').isVisible()) && phone.url().endsWith('#contact'));

// Footer
const footer = desktop.locator('footer.site-footer');
check('footer shows the address', (await footer.innerText()).includes('Ravindra Enclave, Baltana, Zirakpur'));
const footerTel = await footer.locator('a[href^="tel:"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
check('footer lists both phone numbers', JSON.stringify(footerTel) === JSON.stringify(['tel:+917310224488', 'tel:+919621110066']));
check('footer WhatsApp opens the business chat', (await footer.getByRole('link', { name: 'Chat on WhatsApp' }).getAttribute('href')) === 'https://wa.me/917310224488');

// Photo credits
check('footer links to photo credits', (await footer.getByRole('link', { name: 'Photo credits' }).getAttribute('href')) === '/credits');
const credits = await desktop.goto(APP + '/credits');
check('credits page lists all six photos with a source link', credits.status() === 200 && (await desktop.locator('.credits li').count()) === 6 && (await desktop.locator('.credits li a[href^="https://commons.wikimedia.org/wiki/File:"]').count()) === 6);
await desktop.locator('nav[aria-label=Main] a', { hasText: 'Fleet' }).click();
check('nav works from another page (credits to home fleet)', await desktop.waitForURL(APP + '/#fleet').then(() => true, () => false));
await desktop.goto(APP + '/credits');
check('credits page names authors and licences', (await desktop.locator('.credits').innerText()).includes('Premnath Kudva, CC BY-SA 4.0'));

// 404
const missing = await desktop.goto(`${APP}/no-such-page`);
check('unknown page returns 404', missing.status() === 404);
check('404 page explains and links home', await desktop.getByRole('heading', { name: 'Page not found' }).isVisible() && (await desktop.getByRole('link', { name: 'Go to home page' }).getAttribute('href')) === '/');

if (SHOTS) {
  await desktop.goto(APP);
  await desktop.screenshot({ path: `${SHOTS}/home-desktop.png`, fullPage: true });
  await menuButton.click();
  await phone.screenshot({ path: `${SHOTS}/home-phone-menu.png` });
  await menuButton.click();
  await phone.goto(APP);
  await phone.screenshot({ path: `${SHOTS}/home-phone.png`, fullPage: true });
  await phone.screenshot({ path: `${SHOTS}/home-phone-screen.png` });
  await phone.goto(APP + '#fleet');
  await phone.screenshot({ path: `${SHOTS}/fleet-phone-screen.png` });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
