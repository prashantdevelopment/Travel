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
  page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
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
check('header logo shows the mark and the name', await desktop.locator('a.logo svg').isVisible() && (await desktop.locator('a.logo').innerText()).includes('Dhruv Fine Trip'));

const missing = await desktop.request.get(`${APP}/no-such-page`);
check('unknown page returns 404', missing.status() === 404);

if (SHOTS) {
  await desktop.screenshot({ path: `${SHOTS}/home-desktop.png`, fullPage: true });
  await phone.screenshot({ path: `${SHOTS}/home-phone.png`, fullPage: true });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
