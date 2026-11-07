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
check('hero card points to the booking form', (await hero.locator('a.hero-card').getAttribute('href')) === '#book' && (await hero.locator('a.hero-card').innerText()).includes('Book in a minute'));
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

// Destinations (nav Services lands here)
const destCards = desktop.locator('#services a.destination-card');
check('destinations show the four trip types', JSON.stringify(await destCards.locator('.destination-name').allInnerTexts()) === JSON.stringify(['Chardham Yatra', 'Himachal Pradesh', 'Delhi', 'Chandigarh tricity']));
check('each destination card books that trip', (await destCards.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).every((h) => h === '#book') && (await destCards.locator('.destination-cta').count()) === 4);
for (let i = 0; i < 4; i++) await destCards.nth(i).scrollIntoViewIfNeeded();
check('destination photos load with alt text', await desktop.waitForFunction(() => [...document.querySelectorAll('.destination-card img')].every((i) => i.complete && i.naturalWidth > 0 && i.alt.length > 10), null, { timeout: 10000 }).then(() => true, () => false));
check('destination text sits on a dark scrim (desktop)', await destCards.first().evaluate((a) => getComputedStyle(a, '::after').backgroundImage.includes('0.92)') && getComputedStyle(a).color === 'rgb(255, 255, 255)'));
// offsetTop measures layout, not the reveal animation's transform.
check('destinations: two large columns on desktop', await destCards.evaluateAll((as) => new Set(as.map((a) => a.parentElement.offsetTop)).size === 2 && as[0].offsetWidth > 480));

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

// How booking works + Why ride with us
check('how booking works shows 3 numbered steps in order', JSON.stringify(await desktop.locator('#how .step h3').allInnerTexts()) === JSON.stringify(['Tell us your trip', 'We confirm car and fare', 'Your car comes to you']) && (await desktop.locator('#how ol.steps').count()) === 1);
check('why ride with us lists 4 reasons with icons', (await desktop.locator('#why .reason').count()) === 4 && (await desktop.locator('#why .reason svg').count()) === 4);
check('why mentions the local office address', (await desktop.locator('#why').innerText()).includes('Baltana, Zirakpur'));
check('sections appear in order: hero, destinations, packages, fleet, how, book, why, reviews, faq, contact', JSON.stringify(await desktop.locator('main > section').evaluateAll((s) => s.map((el) => el.id || el.className))) === JSON.stringify(['hero', 'services', 'packages', 'fleet', 'how', 'book', 'why', 'reviews', 'faq', 'contact']));

// Happy customers: real trip photos from the client in a swipeable carousel, no text reviews yet
const reviewsSec = desktop.locator('#reviews');
const slides = reviewsSec.locator('.carousel-slide');
const activeSlide = () => reviewsSec.locator('.carousel-slide[data-active=true]').getAttribute('aria-label');
// The active slide must be the one in the middle of the track, after every move.
const activeCentred = (label) => desktop.waitForFunction((label) => { const t = document.querySelector('.carousel-track'); const s = t.querySelector('.carousel-slide[data-active=true]'); if (s?.getAttribute('aria-label') !== label) return false; const r = s.getBoundingClientRect(), tr = t.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - (tr.left + tr.width / 2)) < 6; }, label, { timeout: 4000 }).then(() => true, () => false);
check('happy customers shows the 8 customer photos in a carousel', (await slides.count()) === 8 && (await reviewsSec.locator('h2').innerText()) === 'Moments from our trips');
check('no text review cards until real reviews exist', (await reviewsSec.locator('.review').count()) === 0);
check('every slide photo has alt text', await slides.locator('img').evaluateAll((imgs) => imgs.every((i) => i.alt.length > 10)));
check('carousel swipes natively (scroll snap)', await reviewsSec.locator('.carousel-track').evaluate((t) => getComputedStyle(t).scrollSnapType.startsWith('x')));
await reviewsSec.scrollIntoViewIfNeeded();
check('desktop: the photo in focus is wide and centred', await reviewsSec.locator('.carousel-track').evaluate((t) => { const s = t.querySelector('.carousel-slide[data-active=true]'); const tr = t.getBoundingClientRect(); const r = s.getBoundingClientRect(); return r.width > tr.width * 0.3 && Math.abs(r.left + r.width / 2 - (tr.left + tr.width / 2)) < 4; }));
check('first photo starts in focus', (await activeSlide()) === '1 of 8');
await reviewsSec.getByRole('button', { name: 'Next photo' }).click();
check('Next brings photo 2 into focus, centred', await activeCentred('2 of 8'));
check('touching the carousel stops autoplay', (await reviewsSec.locator('.carousel').getAttribute('data-auto')) === 'off');
await reviewsSec.getByRole('button', { name: 'Show photo 6' }).click();
check('a dot jumps straight to its photo, centred', await activeCentred('6 of 8') && (await reviewsSec.getByRole('button', { name: 'Show photo 6' }).getAttribute('aria-current')) === 'true');
await reviewsSec.getByRole('button', { name: 'Previous photo' }).click();
check('Previous moves back, centred', await activeCentred('5 of 8'));
await reviewsSec.getByRole('button', { name: 'Show photo 8' }).click();
check('the last photo can also come to the centre', await activeCentred('8 of 8'));
// Wide screens push the container further from the page edge; the carousel must still centre the active photo.
const wide = await newPage({ width: 1920, height: 1080 });
await wide.goto(APP);
await wide.locator('#reviews .carousel').scrollIntoViewIfNeeded();
for (const n of [2, 3, 6]) {
  await wide.getByRole('button', { name: `Show photo ${n}` }).click();
  check(`wide screen: photo ${n} comes to the centre and is the one in focus`, await wide.waitForFunction((label) => { const t = document.querySelector('.carousel-track'); const s = t.querySelector('.carousel-slide[data-active=true]'); if (s?.getAttribute('aria-label') !== label) return false; const r = s.getBoundingClientRect(), tr = t.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - (tr.left + tr.width / 2)) < 6; }, `${n} of 8`, { timeout: 4000 }).then(() => true, () => false));
}
check('the photo in focus loads', await desktop.waitForFunction(() => { const i = document.querySelector('.carousel-slide[data-active=true] img'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 }).then(() => true, () => false));
check('share button prefills WhatsApp', (await reviewsSec.getByRole('link', { name: 'Share your trip photos on WhatsApp' }).getAttribute('href')) === 'https://wa.me/917310224488?text=' + encodeURIComponent('Hi Dhruv Fine Trip, I travelled with you and want to share my trip photos and experience.'));

// FAQ: native accordion
const faqItems = desktop.locator('#faq details.faq');
check('FAQ lists 7 questions, all closed at first', (await faqItems.count()) === 7 && (await faqItems.evaluateAll((ds) => ds.every((d) => !d.open))));
await faqItems.nth(4).locator('summary').click();
check('clicking a question opens its answer', await faqItems.nth(4).evaluate((d) => d.open) && /fare on call or WhatsApp/.test(await faqItems.nth(4).locator('p').innerText()));
await faqItems.nth(0).locator('summary').focus();
await desktop.keyboard.press('Enter');
check('FAQ opens with the keyboard (Enter)', await faqItems.nth(0).evaluate((d) => d.open));
check('FAQ answers never promise a price', !/₹|Rs\.?\s?\d|INR/.test(await desktop.locator('#faq').innerText()));

// Contact (nav Contact lands here)
const contact = desktop.locator('#contact');
check('contact lists both numbers as tap to call', JSON.stringify(await contact.locator('a.contact-big').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.textContent]))) === JSON.stringify([['tel:+917310224488', '73102 24488'], ['tel:+919621110066', '96211 10066']]));
check('contact WhatsApp opens the booking chat', (await contact.getByRole('link', { name: 'Chat on WhatsApp' }).getAttribute('href')).startsWith('https://wa.me/917310224488?text='));
check('contact shows the office address and directions', (await contact.locator('address').innerText()).includes('Ravindra Enclave') && (await contact.getByRole('link', { name: 'Get directions' }).getAttribute('href')).startsWith('https://www.google.com/maps/search/'));
const mapFrame = contact.locator('iframe');
check('map is a lazy, titled Google Maps embed', (await mapFrame.getAttribute('loading')) === 'lazy' && (await mapFrame.getAttribute('title')).includes('Dhruv Fine Trip') && (await mapFrame.getAttribute('src')).endsWith('&output=embed'));

// Fleet filter by group size
const visibleCars = () => desktop.locator('#fleet li.fleet-card:visible h3').allInnerTexts();
const chip = (name) => desktop.locator('#fleet .chip', { hasText: name });
await chip('1 to 4 people').click();
check('filter 1 to 4 shows only the sedans', JSON.stringify(await visibleCars()) === JSON.stringify(['Toyota Etios', 'Swift Dzire']) && (await chip('1 to 4 people').getAttribute('aria-pressed')) === 'true');
check('filter announces the count to screen readers', (await desktop.locator('#fleet [aria-live]').innerText()) === 'Showing 2 cars');
await chip('8 or more').click();
check('filter 8 or more shows only the Tempo Traveller', JSON.stringify(await visibleCars()) === JSON.stringify(['Tempo Traveller']) && (await desktop.locator('#fleet [aria-live]').innerText()) === 'Showing 1 car');
await chip('Any size').click();
check('Any size shows all five again', (await visibleCars()).length === 5);

// Scroll reveal and active nav link
await desktop.locator('#how').scrollIntoViewIfNeeded();
check('sections reveal when scrolled into view', await desktop.waitForFunction(() => [...document.querySelectorAll('#how .step')].every((el) => el.classList.contains('revealed') && getComputedStyle(el).opacity === '1'), null, { timeout: 5000 }).then(() => true, () => false));
await desktop.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, document.querySelector('#fleet').offsetTop + 200); });
check('nav highlights the section you are in', await desktop.waitForFunction(() => document.querySelector('nav[aria-label=Main] a[aria-current=page]')?.getAttribute('href') === '/#fleet', null, { timeout: 5000 }).then(() => true, () => false));
await desktop.evaluate(() => window.scrollTo(0, document.querySelector('#reviews').offsetTop + 200));
check('nav clears the highlight in a section that has no nav link', await desktop.waitForFunction(() => !document.querySelector('nav[aria-label=Main] a[aria-current=page]'), null, { timeout: 5000 }).then(() => true, () => false));
const calm = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
await calm.goto(APP);
await calm.waitForFunction(() => document.documentElement.dataset.effects === 'ready');
await calm.waitForTimeout(5500);
check('reduced motion: carousel does not autoplay', (await calm.locator('.carousel-slide[data-active=true]').getAttribute('aria-label')) === '1 of 8');
check('reduced motion: no reveal effect, everything visible', await calm.evaluate(() => !document.documentElement.classList.contains('reveal-ready') && [...document.querySelectorAll('.fleet-grid > li')].every((el) => getComputedStyle(el).opacity === '1')));
await calm.goto(APP + '/packages');
check('nav marks Packages as current on /packages', (await calm.locator('nav[aria-label=Main] a[aria-current=page]').getAttribute('href')) === '/packages');
await desktop.evaluate(() => window.scrollTo(0, 0));

// Header: desktop nav + call button
const navHrefs = await desktop.locator('nav[aria-label=Main] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
check('desktop nav links to packages and the 4 sections', JSON.stringify(navHrefs) === JSON.stringify(['/packages', '/#fleet', '/#services', '/#book', '/#contact']), JSON.stringify(navHrefs));
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
check('destination text on a solid navy panel below the photo (phone)', await phone.locator('a.destination-card').first().evaluate((a) => getComputedStyle(a).backgroundColor === 'rgb(15, 42, 68)' && a.querySelector('.destination-text').getBoundingClientRect().top >= a.querySelector('.destination-photo').getBoundingClientRect().bottom - 1));
check('destination cards stay short on phone (< 75% of the screen)', await phone.locator('a.destination-card').evaluateAll((as) => as.every((a) => a.getBoundingClientRect().height < window.innerHeight * 0.75)));
check('phone: one photo in focus with the next one peeking in (layout width, not the scale effect)', await phone.locator('.carousel-slide').first().evaluate((s) => s.offsetWidth > window.innerWidth * 0.7 && s.offsetWidth < window.innerWidth * 0.85));
check('contact: cards come before the map on phone', await phone.evaluate(() => document.querySelector('.contact-list').getBoundingClientRect().bottom <= document.querySelector('.contact-map').getBoundingClientRect().top));
check('steps and reasons stack in one column on phone', await phone.evaluate(() => ['#how .step', '#why .reason'].every((sel) => new Set([...document.querySelectorAll(sel)].map((el) => Math.round(el.getBoundingClientRect().left))).size === 1)));
const tablet = await newPage({ width: 820, height: 1180 });
await tablet.goto(APP);
check('tablet: destination text sits over the photo on a scrim', await tablet.locator('a.destination-card').first().evaluate((a) => getComputedStyle(a.querySelector('.destination-photo')).position === 'absolute' && getComputedStyle(a, '::after').backgroundImage.includes('0.92)')));
check('tablet: no horizontal scroll', await tablet.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
check('destinations: one column on phone', await phone.locator('a.destination-card').evaluateAll((as) => new Set(as.map((a) => Math.round(a.getBoundingClientRect().left))).size === 1));
check('fleet is one column on phone', await phone.locator('#fleet li.fleet-card').evaluateAll((li) => new Set(li.map((el) => Math.round(el.getBoundingClientRect().left))).size === 1));
check('Book this car is thumb-sized on phone', await phone.locator('#fleet .btn').first().evaluate((el) => el.getBoundingClientRect().height >= 44 && el.getBoundingClientRect().width > 300));
check('desktop nav hidden on phone', !(await phone.locator('nav[aria-label=Main]').isVisible()));
const menuButton = phone.locator('.mobile-menu button');
check('menu button starts collapsed', (await menuButton.getAttribute('aria-expanded')) === 'false');
await menuButton.click();
check('menu opens with 5 links', (await menuButton.getAttribute('aria-expanded')) === 'true' && (await phone.locator('#mobile-nav a').count()) === 5);
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
check('credits page lists all fourteen photos with a source link', credits.status() === 200 && (await desktop.locator('.credits li').count()) === 14 && (await desktop.locator('.credits li a[href^="https://commons.wikimedia.org/wiki/File:"]').count()) === 14);
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
