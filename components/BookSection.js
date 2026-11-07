import BookingForm from './BookingForm';
import { business, formatPhone, telLink } from '@/lib/business';

export default function BookSection() {
  return (
    <section id="book" className="section" aria-labelledby="book-title">
      <div className="container book-layout">
        <div className="section-head">
          <span className="eyebrow">Book a taxi</span>
          <h2 id="book-title">Tell us your trip in a minute</h2>
          <p className="muted">
            Fill in the form and send it on WhatsApp. We reply with the car and the fare before anything is booked.
          </p>
          <p className="book-call">
            Prefer to talk? Call{' '}
            {business.phones.map((phone, i) => (
              <span key={phone}>
                {i > 0 && ' or '}
                <a href={telLink(phone)}>{formatPhone(phone)}</a>
              </span>
            ))}
            .
          </p>
        </div>
        <BookingForm />
      </div>
    </section>
  );
}
