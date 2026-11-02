import { test } from 'node:test';
import assert from 'node:assert/strict';
import { business, fleet, telLink, formatPhone, whatsappLink, mapLink } from '../lib/business.js';

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
