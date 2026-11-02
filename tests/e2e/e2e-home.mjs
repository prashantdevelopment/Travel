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
check('one h1 with the business name', (await desktop.locator('h1').count()) === 1 && /Dhruv Fine Trip/.test(await desktop.locator('h1').innerText()));

const phone = await newPage({ width: 390, height: 844 });
await phone.goto(APP);
check('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

const iconHref = await desktop.locator('link[rel=icon]').first().getAttribute('href', { timeout: 2000 }).catch(() => null);
check('favicon (app/icon.svg) is linked and served', !!iconHref && (await desktop.request.get(APP + iconHref)).status() === 200);
const header = desktop.locator('header.site-header');
check('header logo shows the mark and the name', await header.locator('a.logo svg').isVisible() && (await header.locator('a.logo').innerText()).includes('Dhruv Fine Trip'));

// Header: desktop nav + call button
const navHrefs = await desktop.locator('nav[aria-label=Main] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
check('desktop nav links to the 4 sections', JSON.stringify(navHrefs) === JSON.stringify(['#fleet', '#services', '#book', '#contact']), JSON.stringify(navHrefs));
check('Call now dials the first number', (await header.getByRole('link', { name: 'Call now' }).getAttribute('href')) === 'tel:+917310224488');
check('header stays on top while scrolling', await desktop.evaluate(() => getComputedStyle(document.querySelector('.site-header')).position === 'sticky'));
check('mobile menu button hidden on desktop', !(await desktop.getByRole('button', { name: 'Menu' }).isVisible()));

// Phone: nav collapses into a menu that opens, closes on Escape and on link click
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

// 404
const missing = await desktop.goto(`${APP}/no-such-page`);
check('unknown page returns 404', missing.status() === 404);
check('404 page explains and links home', await desktop.getByRole('heading', { name: 'Page not found' }).isVisible() && (await desktop.getByRole('link', { name: 'Go to home page' }).getAttribute('href')) === '/');

if (SHOTS) {
  await desktop.goto(APP);
  await desktop.screenshot({ path: `${SHOTS}/home-desktop.png`, fullPage: true });
  await menuButton.click();
  await phone.screenshot({ path: `${SHOTS}/home-phone-menu.png` });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
