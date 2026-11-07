import { business } from './business.js';

export const tripTypes = ['One way', 'Round trip', 'Daily pick and drop'];

// Today's date in the visitor's own time zone, as YYYY-MM-DD (the format of <input type="date">).
export const todayISO = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Returns { field: message } for every problem; an empty object means the booking can be sent.
export function validateBooking(fields, today = todayISO()) {
  const errors = {};
  if (!text(fields.pickup)) errors.pickup = 'Tell us where to pick you up.';
  else if (text(fields.pickup).length > 80) errors.pickup = 'Please keep the pickup under 80 characters.';
  if (!text(fields.package) && !text(fields.drop)) errors.drop = 'Tell us where you want to go.';
  else if (text(fields.drop).length > 80) errors.drop = 'Please keep the drop under 80 characters.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text(fields.date))) errors.date = 'Choose your travel date.';
  else if (fields.date < today) errors.date = 'The date has already passed. Choose today or a later date.';
  if (text(fields.people) && !(/^\d+$/.test(text(fields.people)) && +fields.people >= 1 && +fields.people <= 50))
    errors.people = 'Enter a number of people from 1 to 50.';
  return errors;
}

// WhatsApp message with only the details the visitor filled in.
export function bookingMessage(fields) {
  const lines = [
    ['Package', text(fields.package)],
    ['Trip', !text(fields.package) && text(fields.trip)],
    ['From', text(fields.pickup)],
    ['To', text(fields.drop)],
    ['Date', text(fields.date) && formatDate(fields.date)],
    ['Time', text(fields.time)],
    ['Car', text(fields.car)],
    ['People', text(fields.people)],
    ['Name', text(fields.name)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  return [`Hi ${business.name}, I want to book a taxi.`, ...lines].join('\n');
}
