import { test } from 'node:test';
import { photoCredits } from '../lib/credits.js';
import { packages, plans, tours, formatPrice, tourMessage, fareMessage, customTripMessage } from '../lib/packages.js';
import { customerPhotos, isPublishable, reviews } from '../lib/reviews.js';
import assert from 'node:assert/strict';
import { bookingSteps, business, faqs, groupSizes, destinations, fleet, reasons, telLink, formatPhone, whatsappLink, mapEmbed, mapLink } from '../lib/business.js';

test('phone numbers are 10-digit Indian mobiles', () => {
  for (const phone of business.phones) assert.match(phone, /^[6-9]\d{9}$/);
});

test('telLink adds the +91 country code', () => {
  assert.equal(telLink('7310224488'), 'tel:+917310224488');
});

test('formatPhone splits the number for reading', () => {
  assert.equal(formatPhone('7310224488'), '73102 24488');
});

test('whatsappLink without text opens the chat', () => {
  assert.equal(whatsappLink(), 'https://wa.me/917310224488');
});

test('whatsappLink encodes the message', () => {
  assert.equal(whatsappLink('Taxi to Delhi & back?'), 'https://wa.me/917310224488?text=Taxi%20to%20Delhi%20%26%20back%3F');
});

test('mapLink searches the full address', () => {
  assert.ok(mapLink.includes(encodeURIComponent('Zirakpur')));
});

test('fleet lists the five vehicles from the business card', () => {
  assert.deepEqual(
    fleet.map((car) => car.name),
    ['Toyota Innova Crysta', 'Maruti Ertiga', 'Toyota Etios', 'Swift Dzire', 'Tempo Traveller'],
  );
  assert.equal(new Set(fleet.map((car) => car.id)).size, fleet.length);
});

test('every photo credit has an author, a licence and a Commons source', () => {
  const credits = photoCredits();
  assert.equal(credits.length, 1 + destinations.length + packages.filter((p) => p.photo).length + fleet.length);
  for (const photo of credits) {
    assert.ok(photo.label && photo.author && photo.license, photo.label);
    assert.match(photo.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
});

test('destination copy has no dashes or hyphens', () => {
  for (const d of destinations) assert.doesNotMatch(`${d.name} ${d.places} ${d.text}`, /[-–—]/, d.id);
});

test('booking steps and reasons read cleanly (no dashes, no hyphens)', () => {
  assert.equal(bookingSteps.length, 3);
  assert.equal(reasons.length, 4);
  for (const item of [...bookingSteps, ...reasons]) assert.doesNotMatch(`${item.title} ${item.text}`, /[-–—]/, item.title);
});

test('mapEmbed is a keyless Google Maps embed of the address', () => {
  assert.ok(mapEmbed.startsWith('https://www.google.com/maps?q='));
  assert.ok(mapEmbed.endsWith('&output=embed'));
  assert.ok(mapEmbed.includes(encodeURIComponent('Baltana')));
});

test('client tours carry the client prices, per person', () => {
  assert.deepEqual(tours.map((t) => [t.name, t.days, t.price, t.priceNote]), [
    ['Kasol Tour', '3 days, 2 nights', 17000, 'per person, all included'],
    ['Kasol Tour', '4 days, 3 nights', 13900, 'per person'],
    ['Manali Tour', '4 days, 3 nights', 16500, 'per person'],
  ]);
});

test('suggested plans have real routes and never a price', () => {
  assert.deepEqual(plans.map((p) => p.id), ['chardham', 'do-dham', 'shimla-manali']);
  for (const p of plans) {
    assert.ok(p.route.length >= 4, p.id);
    assert.match(p.days, /^\d+ to \d+ days$/);
    assert.equal(p.price, undefined, p.id);
  }
});

test('package copy has no dashes or hyphens, and ids are unique', () => {
  for (const p of packages) assert.doesNotMatch(`${p.name} ${p.days} ${p.text} ${(p.route ?? []).join(' ')} ${p.car ?? ''}`, /[-–—]/, p.id);
  assert.equal(new Set(packages.map((p) => p.id)).size, packages.length);
});

test('prices are shown the Indian way', () => {
  assert.equal(formatPrice(17000), '₹17,000');
  assert.equal(formatPrice(13900), '₹13,900');
  assert.equal(formatPrice(150000), '₹1,50,000');
});

test('tour booking message names the package and its length', () => {
  assert.equal(tourMessage(tours[0]), 'Hi Dhruv Fine Trip, I want to book the Kasol Tour (3 days, 2 nights) package.');
});

test('fare and custom trip messages name the business and the package', () => {
  assert.equal(fareMessage(plans[2]), 'Hi Dhruv Fine Trip, please share the fare for the Shimla and Manali package.');
  assert.ok(customTripMessage.startsWith('Hi Dhruv Fine Trip'));
});

test('only complete reviews with a known source are published', () => {
  const good = { name: 'Test Customer', trip: 'Delhi', text: 'Sample text for the test only.', source: 'Google', date: '2026-10' };
  assert.equal(isPublishable(good), true);
  assert.equal(isPublishable({ ...good, source: 'Made up' }), false);
  assert.equal(isPublishable({ ...good, name: ' ' }), false);
  assert.equal(isPublishable({ ...good, date: undefined }), false);
  for (const review of reviews) assert.ok(isPublishable(review), review.name);
});

test('FAQ answers come from business data and contain no dashes', () => {
  assert.equal(faqs.length, 7);
  assert.ok(faqs[0].a.includes('73102 24488') && faqs[0].a.includes('96211 10066'));
  assert.equal(faqs.at(-1).a, business.address);
  for (const { q, a } of faqs) assert.doesNotMatch(`${q} ${a}`.replace(business.address, ''), /[-–—]/, q);
});

test('every car belongs to a group size filter and every filter has a car', () => {
  const ids = groupSizes.map((g) => g.id);
  for (const car of fleet) assert.ok(ids.includes(car.group), car.id);
  for (const id of ids.filter((i) => i !== 'all')) assert.ok(fleet.some((car) => car.group === id), id);
});

test('customer photos exist on disk with alt text and matching sizes', async () => {
  const { existsSync } = await import('node:fs');
  const sharp = (await import('sharp')).default;
  assert.equal(customerPhotos.length, 8);
  for (const p of customerPhotos) {
    assert.ok(existsSync(`public${p.src}`), p.src);
    assert.ok(p.alt.length > 10 && !/[-–—]/.test(p.alt), p.src);
    const meta = await sharp(`public${p.src}`).metadata();
    assert.deepEqual([meta.width, meta.height], [p.width, p.height], p.src);
  }
});
