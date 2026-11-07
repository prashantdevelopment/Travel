import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingMessage, formatDate, todayISO, validateBooking } from '../lib/booking.js';

const today = '2026-11-07';
const valid = { pickup: 'Zirakpur', drop: 'Delhi', date: '2026-11-10' };

test('a complete booking has no errors', () => {
  assert.deepEqual(validateBooking(valid, today), {});
});

test('pickup, drop and date are required', () => {
  assert.deepEqual(Object.keys(validateBooking({}, today)).sort(), ['date', 'drop', 'pickup']);
  assert.ok(validateBooking({ ...valid, pickup: '   ' }, today).pickup);
});

test('a package booking does not need a drop', () => {
  assert.deepEqual(validateBooking({ pickup: 'Mohali', date: today, package: 'Kasol Tour (3 days, 2 nights)' }, today), {});
});

test('past dates are refused, today is fine', () => {
  assert.match(validateBooking({ ...valid, date: '2026-11-06' }, today).date, /already passed/);
  assert.deepEqual(validateBooking({ ...valid, date: today }, today), {});
  assert.ok(validateBooking({ ...valid, date: '10/11/2026' }, today).date);
});

test('people must be a whole number from 1 to 50 when given', () => {
  for (const bad of ['0', '51', '2.5', 'four', '-3']) assert.ok(validateBooking({ ...valid, people: bad }, today).people, bad);
  for (const ok of ['', '1', '7', '50']) assert.equal(validateBooking({ ...valid, people: ok }, today).people, undefined, ok);
});

test('very long places are refused', () => {
  assert.ok(validateBooking({ ...valid, pickup: 'x'.repeat(81) }, today).pickup);
  assert.ok(validateBooking({ ...valid, drop: 'x'.repeat(81) }, today).drop);
});

test('the message lists only the filled details, in a fixed order', () => {
  assert.equal(
    bookingMessage({ ...valid, trip: 'One way', time: '06:30', car: 'Toyota Innova Crysta', people: '4', name: ' Ravi ', notes: 'ignored' }),
    'Hi Dhruv Fine Trip, I want to book a taxi.\nTrip: One way\nFrom: Zirakpur\nTo: Delhi\nDate: 10 Nov 2026\nTime: 06:30\nCar: Toyota Innova Crysta\nPeople: 4\nName: Ravi',
  );
  assert.equal(bookingMessage({ pickup: 'Zirakpur', date: '2026-11-10' }), 'Hi Dhruv Fine Trip, I want to book a taxi.\nFrom: Zirakpur\nDate: 10 Nov 2026');
});

test('a package booking names the package first and leaves out the trip type', () => {
  assert.ok(bookingMessage({ trip: 'One way', pickup: 'Mohali', date: today, package: 'Manali Tour (4 days, 3 nights)' }).startsWith('Hi Dhruv Fine Trip, I want to book a taxi.\nPackage: Manali Tour (4 days, 3 nights)\nFrom: Mohali'));
});

test('dates use the local calendar day and read naturally', () => {
  assert.equal(todayISO(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(formatDate('2026-01-05'), '5 Jan 2026');
});
