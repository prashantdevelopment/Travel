import Image from 'next/image';
import { business, bookingMessage, formatPhone, heroPhoto, telLink, whatsappLink } from '@/lib/business';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <Image src="/images/hero.jpg" alt={heroPhoto.alt} fill loading="eager" fetchPriority="high" sizes="100vw" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Taxi &amp; Tours · Zirakpur</span>
          <h1 id="hero-title">Reliable taxi for every route, including the Chardham Yatra.</h1>
          <p className="hero-lead">
            One way and round trips from Zirakpur, Chandigarh and Mohali to Delhi, Himachal Pradesh and the Char Dham.
            Daily pick and drop too.
          </p>
          <div className="hero-actions">
            <a className="btn btn-accent" href="#book">
              Book a ride
            </a>
            <a className="btn btn-light" href={telLink(business.phones[0])}>
              Call {formatPhone(business.phones[0])}
            </a>
            <a className="btn btn-light" href={whatsappLink(bookingMessage)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <a className="card hero-card" href="#book">
          <span className="hero-card-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4M8 15h3" />
            </svg>
          </span>
          <span className="hero-card-title">Book in a minute</span>
          <span className="muted">
            Tell us your pickup, drop and date in a short form. It opens WhatsApp with everything filled in, and we confirm
            the car and fare.
          </span>
          <span className="hero-card-link">Open the booking form</span>
        </a>
      </div>
    </section>
  );
}
