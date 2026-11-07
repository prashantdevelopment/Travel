// Premium polish E2E (Phase B4). Needs a production build first (`npm run build`), then: node tests/e2e/e2e-polish.mjs
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
const newPage = async (viewport, options = {}) => {
  const page = await (await browser.newContext({ viewport, ...options })).newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push('console: ' + m.text()));
  return page;
};
const settle = (page) => page.waitForFunction(() => new Promise((r) => { const y = scrollY; setTimeout(() => r(scrollY === y), 400); }));

const desktop = await newPage({ width: 1440, height: 900 });
const phone = await newPage({ width: 390, height: 844 });

// B4.1 Reload always starts at the top of the page
await desktop.goto(APP);
await desktop.evaluate(() => window.scrollTo(0, 2500));
await desktop.reload();
await settle(desktop);
check('reload after scrolling starts at the top', (await desktop.evaluate(() => scrollY)) === 0);
await desktop.goto(APP + '/#fleet');
await settle(desktop);
check('a fresh visit to /#fleet still lands on the fleet section', (await desktop.evaluate(() => scrollY)) > 500);
await desktop.reload();
await settle(desktop);
check('reloading /#fleet goes to the top and drops the old #section', (await desktop.evaluate(() => scrollY)) === 0 && !desktop.url().includes('#'));
await desktop.goto(APP + '/packages');
await desktop.evaluate(() => window.scrollTo(0, 1500));
await desktop.reload();
await settle(desktop);
check('reload on /packages also starts at the top', (await desktop.evaluate(() => scrollY)) === 0);

// B4.1 Carousel: the photo in focus pops out by size alone, with no shadow box around it
await desktop.goto(APP);
check('carousel photo in focus has no shadow', await desktop.locator('.carousel-slide[data-active=true]').evaluate((s) => getComputedStyle(s).boxShadow === 'none'));

// B4.7 Facebook page
const fb = 'https://www.facebook.com/share/18bo2AcbGZ/';
check('footer links to the Facebook page in a new tab', (await desktop.locator('footer').getByRole('link', { name: 'Facebook' }).getAttribute('href')) === fb && (await desktop.locator('footer').getByRole('link', { name: 'Facebook' }).getAttribute('target')) === '_blank');
check('contact has a Facebook card', (await desktop.locator('#contact').getByRole('link', { name: 'Follow us on Facebook' }).getAttribute('href')) === fb);
check('Facebook links do not leak the opener', await desktop.locator(`a[href="${fb}"]`).evaluateAll((as) => as.length === 2 && as.every((a) => a.rel.includes('noopener'))));

// B4.2 Header floats over the hero at the top of the home page, solid after scrolling
const headerLook = (page) => page.locator('header.site-header').evaluate((h) => ({ bg: getComputedStyle(h).backgroundColor, logo: getComputedStyle(h.querySelector('.logo')).color }));
await desktop.goto(APP);
await desktop.waitForFunction(() => document.documentElement.dataset.effects === 'ready');
let look = await headerLook(desktop);
check('home top: header is transparent with white logo', look.bg === 'rgba(0, 0, 0, 0)' && look.logo === 'rgb(255, 255, 255)', JSON.stringify(look));
check('home top: logo tagline is bright yellow on the photo', (await desktop.locator('.site-header .logo-tag').evaluate((el) => getComputedStyle(el).color)) === 'rgb(245, 183, 0)');
check('home top: hero photo reaches the very top of the screen', await desktop.locator('section.hero').evaluate((h) => Math.abs(h.getBoundingClientRect().top) < 1));
check('home top: the header Call button stands out in yellow', (await desktop.locator('.header-call').evaluate((b) => getComputedStyle(b).backgroundColor)) === 'rgb(245, 183, 0)');
await desktop.mouse.move(700, 450);
await desktop.mouse.wheel(0, 400);
check('after scrolling the header turns solid', await desktop.waitForFunction(() => getComputedStyle(document.querySelector('header.site-header')).backgroundColor !== 'rgba(0, 0, 0, 0)', null, { timeout: 3000 }).then(() => true, () => false));
await desktop.goto(APP + '/packages');
look = await headerLook(desktop);
check('other pages keep the solid header', look.bg !== 'rgba(0, 0, 0, 0)' && look.logo !== 'rgb(255, 255, 255)', JSON.stringify(look));
await phone.goto(APP);
await phone.waitForFunction(() => document.documentElement.dataset.effects === 'ready');
check('phone top: header floats over the hero', (await headerLook(phone)).bg === 'rgba(0, 0, 0, 0)');
await phone.locator('.mobile-menu button').click();
check('phone: opening the menu makes the header solid so links are readable', await phone.waitForFunction(() => getComputedStyle(document.querySelector('header.site-header')).backgroundColor === 'rgba(247, 246, 243, 0.92)', null, { timeout: 3000 }).then(() => true, () => false));
await phone.locator('.mobile-menu button').click();

// B4.3 Hero entrance and slow photo zoom
await desktop.goto(APP);
const heroAnim = await desktop.evaluate(() => [...document.querySelectorAll('.hero-copy > *, .hero-card')].map((el) => [getComputedStyle(el).animationName, getComputedStyle(el).animationDelay]));
check('hero lines rise in one after another, the card last', JSON.stringify(heroAnim) === JSON.stringify([['hero-in', '0s'], ['hero-in', '0.08s'], ['hero-in', '0.16s'], ['hero-in', '0.24s'], ['hero-in', '0.36s']]), JSON.stringify(heroAnim));
check('hero photo zooms out slowly', (await desktop.locator('.hero-media img').evaluate((i) => getComputedStyle(i).animationName + ' ' + getComputedStyle(i).animationDuration)) === 'hero-zoom 18s');
check('hero text is fully visible once the entrance ends', await desktop.waitForFunction(() => [...document.querySelectorAll('.hero-copy > *, .hero-card')].every((el) => getComputedStyle(el).opacity === '1'), null, { timeout: 3000 }).then(() => true, () => false));
const still = await newPage({ width: 1440, height: 900 }, { reducedMotion: 'reduce' });
await still.goto(APP);
check('reduced motion: hero shows at once', await still.evaluate(() => [...document.querySelectorAll('.hero-copy > *, .hero-card')].every((el) => parseFloat(getComputedStyle(el).animationDuration) < 0.01)));
await still.close();

// B4.4 Moving strip of places under the hero
const strip = desktop.locator('section.route-strip');
await desktop.goto(APP);
check('route strip lists the 12 places, drawn twice for the loop', (await strip.locator('.route-strip-list').count()) === 2 && (await strip.locator('.route-strip-list').first().locator('li').count()) === 12);
check('screen readers hear the places once', (await strip.locator('.route-strip-list[aria-hidden=true]').count()) === 1 && (await strip.getAttribute('aria-label')) === 'Places we drive to');
check('the strip moves on its own', (await strip.locator('.route-strip-track').evaluate((t) => getComputedStyle(t).animationName + ' ' + getComputedStyle(t).animationPlayState)) === 'route-strip running');
await strip.hover();
check('hovering pauses the strip', (await strip.locator('.route-strip-track').evaluate((t) => getComputedStyle(t).animationPlayState)) === 'paused');
const calmStrip = await newPage({ width: 390, height: 844 }, { reducedMotion: 'reduce' });
await calmStrip.goto(APP);
check('reduced motion: strip stands still and every place fits on screen', await calmStrip.locator('section.route-strip').evaluate((s) => getComputedStyle(s.querySelector('.route-strip-track')).animationName === 'none' && [...s.querySelectorAll('.route-strip-list:not([aria-hidden]) li')].every((li) => { const r = li.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })));
await calmStrip.close();

// B4.5 Micro interactions: hover on pointer devices only, press feedback everywhere
await desktop.goto(APP);
await desktop.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
check('desktop is treated as a hover device', await desktop.evaluate(() => matchMedia('(hover: hover)').matches));
const ertiga = desktop.locator('#fleet li.fleet-card', { hasText: 'Maruti Ertiga' });
await ertiga.scrollIntoViewIfNeeded();
await ertiga.hover();
check('hovering a car zooms its photo', await desktop.waitForFunction(() => { const t = getComputedStyle(document.querySelector('#fleet li[data-group="5to6"] .fleet-photo img')).transform; return t !== 'none' && new DOMMatrix(t).a > 1.03; }, null, { timeout: 2000 }).then(() => true, () => false));
const bookBtn = desktop.locator('#book').getByRole('button', { name: 'Send booking on WhatsApp' });
await bookBtn.scrollIntoViewIfNeeded();
await bookBtn.hover();
check('hovering a button lifts it by a pixel', await desktop.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('.booking-submit')).transform).f === -1, null, { timeout: 2000 }).then(() => true, () => false));
const reason = desktop.locator('#why .reason').first();
await reason.scrollIntoViewIfNeeded();
await reason.hover();
check('hovering a reason lights its icon yellow', await desktop.waitForFunction(() => getComputedStyle(document.querySelector('#why .reason .reason-icon')).backgroundColor === 'rgb(245, 183, 0)', null, { timeout: 2000 }).then(() => true, () => false));
const chip = desktop.locator('#fleet .chip', { hasText: '7 people' });
await chip.scrollIntoViewIfNeeded();
const box = await chip.boundingBox();
await desktop.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await desktop.mouse.down();
check('pressing a chip gives instant feedback', await desktop.waitForFunction(() => { const t = getComputedStyle([...document.querySelectorAll('#fleet .chip')].find((c) => c.textContent === '7 people')).transform; return t !== 'none' && new DOMMatrix(t).a < 0.99; }, null, { timeout: 1000 }).then(() => true, () => false));
await desktop.mouse.up();
const touch = await newPage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
await touch.goto(APP);
check('phone is treated as a touch device (no hover)', await touch.evaluate(() => !matchMedia('(hover: hover)').matches));
const tCard = touch.locator('#fleet li.fleet-card', { hasText: 'Maruti Ertiga' });
await tCard.scrollIntoViewIfNeeded();
await tCard.locator('.fleet-photo').tap();
await wait(800);
check('tapping a car on a phone leaves no zoom stuck on the photo', (await tCard.locator('.fleet-photo img').evaluate((i) => getComputedStyle(i).transform)) === 'none');
await touch.close();

// B4.8 Smooth scrolling (Lenis): gentle on the wheel, instant with reduced motion, anchors land below the header
await desktop.goto(APP);
await desktop.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await desktop.mouse.move(700, 450);
await desktop.mouse.wheel(0, 800);
await wait(60);
const early = await desktop.evaluate(() => scrollY);
await settle(desktop);
const late = await desktop.evaluate(() => scrollY);
check('wheel scrolling eases in instead of jumping', early > 0 && early < late * 0.8 && late > 600, `${early} then ${late}`);
await desktop.locator('nav[aria-label=Main] a', { hasText: 'Fleet' }).click();
check('nav links glide to the section and stop below the sticky header', await desktop.waitForFunction(() => Math.abs(document.querySelector('#fleet').getBoundingClientRect().top - 72) < 2, null, { timeout: 4000 }).then(() => true, () => false));
const calm = await newPage({ width: 1440, height: 900 }, { reducedMotion: 'reduce' });
await calm.goto(APP);
await calm.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await calm.mouse.move(700, 450);
await calm.mouse.wheel(0, 800);
await wait(60);
check('reduced motion: wheel scrolling is not smoothed', (await calm.evaluate(() => scrollY)) >= 700);
check('no double smoothing from CSS', await desktop.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior !== 'smooth'));

// Mobile: no sideways scrolling anywhere and nothing poking out of the screen, on small and common phones
for (const width of [360, 375, 390]) {
  const small = await newPage({ width, height: 800 }, { isMobile: true, hasTouch: true });
  for (const path of ['/', '/packages', '/credits', '/no-such-page']) {
    await small.goto(APP + path);
    const out = await small.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')].filter((el) => {
        // Clipped on purpose: the carousel track, the moving route strip and the zooming hero photo.
        if (el.closest('.carousel-track, .route-strip-track, .hero-media, .sr-only, .skip-link, dialog')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > w + 1 || r.left < -1);
      });
      return { scroll: document.documentElement.scrollWidth - w, bad: bad.slice(0, 3).map((el) => el.className || el.tagName) };
    });
    check(`${width}px ${path}: no sideways scroll and nothing off screen`, out.scroll <= 0 && out.bad.length === 0, JSON.stringify(out));
  }
  await small.close();
}
await phone.goto(APP);
check('phone: the car filter chips wrap instead of scrolling sideways', await phone.locator('#fleet .chips').evaluate((c) => getComputedStyle(c).flexWrap === 'wrap' && c.scrollWidth <= c.clientWidth));
const pads = await phone.locator('main > section.section').evaluateAll((s) => [...new Set(s.map((el) => `${getComputedStyle(el).paddingTop}/${getComputedStyle(el).paddingBottom}`))]);
check('phone: every home section has the same top and bottom spacing (48px)', pads.length === 1 && pads[0] === '48px/48px', JSON.stringify(pads));
const chipRows = await phone.locator('#fleet .chip').evaluateAll((cs) => new Set(cs.map((c) => Math.round(c.getBoundingClientRect().top))).size);
check('phone: the five size chips fit on two lines', chipRows <= 2, String(chipRows));
const chipHeights = await phone.locator('#fleet .chip').evaluateAll((cs) => cs.every((c) => c.getBoundingClientRect().height >= 44));
check('phone: chips stay thumb-sized (44px)', chipHeights);

// Every button, chip and icon has the same size and padding as its kind, on phone, tablet and desktop
for (const width of [390, 820, 1440]) {
  const view = await newPage({ width, height: 900 }, { reducedMotion: 'reduce' });
  const kinds = {};
  for (const path of ['/', '/packages']) {
    await view.goto(APP + path);
    const found = await view.evaluate(() => {
      const visible = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.getBoundingClientRect().width > 0);
      const look = (el) => { const cs = getComputedStyle(el); return `h${Math.round(el.getBoundingClientRect().height)} p${cs.paddingTop}/${cs.paddingLeft} f${cs.fontSize} r${cs.borderRadius}`; };
      return {
        buttons: visible('.btn').map(look),
        chips: [...visible('.chip'), ...visible('.trip-option span')].map(look),
        icons: visible('.btn svg, .action-bar svg, .carousel-arrow svg').map((s) => Math.round(s.getBoundingClientRect().width)),
        bar: visible('.action-bar a').map((a) => Math.round(a.getBoundingClientRect().height)),
      };
    });
    for (const [k, list] of Object.entries(found)) kinds[k] = [...new Set([...(kinds[k] ?? []), ...list])];
  }
  check(`${width}px: every text button has one size and padding`, kinds.buttons.length === 1, JSON.stringify(kinds.buttons));
  check(`${width}px: filter chips and trip chips match`, kinds.chips.length === 1, JSON.stringify(kinds.chips));
  check(`${width}px: every button icon is 20px`, kinds.icons.length === 1 && kinds.icons[0] === 20, JSON.stringify(kinds.icons));
  if (width < 768) check(`${width}px: action bar buttons match the other buttons (52px)`, kinds.bar.length === 1 && kinds.bar[0] === 52, JSON.stringify(kinds.bar));
  await view.close();
}

if (SHOTS) {
  await desktop.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await desktop.evaluate(() => window.scrollTo(0, document.querySelector('.carousel').getBoundingClientRect().top + scrollY - 120));
  await wait(1500);
  await desktop.screenshot({ path: `${SHOTS}/polish-carousel.png` });
}

check('no page or console errors', errors.length === 0, JSON.stringify(errors.slice(0, 3)));
await browser.close();
stop();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
