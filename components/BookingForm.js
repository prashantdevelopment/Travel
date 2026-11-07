'use client';

import { useEffect, useRef, useState } from 'react';
import { fleet, whatsappLink } from '@/lib/business';
import { bookingMessage, todayISO, tripTypes, validateBooking } from '@/lib/booking';

const empty = { trip: tripTypes[0], pickup: '', drop: '', date: '', time: '', car: '', people: '', name: '', package: '' };
const order = ['pickup', 'drop', 'date', 'people'];

// Prefill comes from Book buttons on this page (data-book-* attributes) or from other pages (?car=, ?package=).
const prefillFrom = (source) => {
  const next = {};
  if (source.car) next.car = source.car;
  if (source.drop) next.drop = source.drop;
  if (source.trip) next.trip = source.trip;
  if (source.package) next.package = source.package;
  return next;
};

export default function BookingForm() {
  const form = useRef(null);
  const [fields, setFields] = useState(empty);
  const [errors, setErrors] = useState({});
  const [minDate, setMinDate] = useState('');
  const [sentUrl, setSentUrl] = useState('');

  useEffect(() => {
    setMinDate(todayISO());
    const fromQuery = prefillFrom(Object.fromEntries(new URLSearchParams(window.location.search)));
    if (Object.keys(fromQuery).length) setFields((f) => ({ ...f, ...fromQuery }));

    const onClick = (e) => {
      const link = e.target.closest('a[data-book-car], a[data-book-drop], a[data-book-trip], a[data-book-package]');
      if (!link) return;
      setSentUrl('');
      setErrors({});
      setFields({ ...empty, ...prefillFrom({ car: link.dataset.bookCar, drop: link.dataset.bookDrop, trip: link.dataset.bookTrip, package: link.dataset.bookPackage }) });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const set = (name) => (e) => {
    setFields((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateBooking(fields);
    setErrors(found);
    const first = order.find((name) => found[name]);
    if (first) {
      form.current.elements[first].focus();
      return;
    }
    const url = whatsappLink(bookingMessage(fields));
    window.open(url, '_blank', 'noopener');
    setSentUrl(url);
  };

  const field = (name) => ({
    id: `book-${name}`,
    name,
    value: fields[name],
    onChange: set(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `book-${name}-error` : undefined,
  });
  const error = (name) =>
    errors[name] && (
      <p id={`book-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    );

  if (sentUrl) {
    return (
      <div className="card booking-form booking-sent" role="status">
        <h3>Almost done</h3>
        <p className="muted">WhatsApp is opening with your booking details. Press send there and we will confirm the car and the fare.</p>
        <a className="btn btn-primary" href={sentUrl} target="_blank" rel="noopener noreferrer">
          Open WhatsApp again
        </a>
        <button type="button" className="btn btn-outline" onClick={() => { setFields(empty); setSentUrl(''); }}>
          Book another trip
        </button>
      </div>
    );
  }

  return (
    <form ref={form} className="card booking-form" onSubmit={submit} noValidate aria-label="Booking form">
      {fields.package ? (
        <p className="booking-package">
          <span>
            Package: <strong>{fields.package}</strong>
          </span>
          <button type="button" className="link-button" onClick={() => setFields((f) => ({ ...f, package: '' }))}>
            Remove
          </button>
        </p>
      ) : (
        <fieldset className="trip-type">
          <legend>Trip</legend>
          {tripTypes.map((type) => (
            <label key={type} className="trip-option">
              <input type="radio" name="trip" value={type} checked={fields.trip === type} onChange={set('trip')} />
              <span>{type}</span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="book-pickup">Pickup</label>
        <input {...field('pickup')} type="text" autoComplete="street-address" placeholder="Zirakpur, Chandigarh, Mohali..." maxLength={80} />
        {error('pickup')}
      </div>
      {!fields.package && (
        <div className="field">
          <label htmlFor="book-drop">Drop</label>
          <input {...field('drop')} type="text" placeholder="Delhi, Manali, Kedarnath..." maxLength={80} />
          {error('drop')}
        </div>
      )}
      <div className="field-row">
        <div className="field">
          <label htmlFor="book-date">Date</label>
          <input {...field('date')} type="date" min={minDate} />
          {error('date')}
        </div>
        <div className="field">
          <label htmlFor="book-time">
            Time <span className="optional">optional</span>
          </label>
          <input {...field('time')} type="time" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="book-car">Car</label>
          <select {...field('car')}>
            <option value="">Any car</option>
            {fleet.map((car) => (
              <option key={car.id} value={car.name}>
                {car.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="book-people">
            People <span className="optional">optional</span>
          </label>
          <input {...field('people')} type="number" inputMode="numeric" min={1} max={50} />
          {error('people')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="book-name">
          Your name <span className="optional">optional</span>
        </label>
        <input {...field('name')} type="text" autoComplete="name" maxLength={60} />
      </div>
      <button type="submit" className="btn btn-primary booking-submit">
        Send booking on WhatsApp
      </button>
      <p className="muted booking-note">Nothing is booked until we confirm the car and the fare with you.</p>
    </form>
  );
}
