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

        <a className="card hero-assistant" href="#book">
          <span className="mic-badge" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
          <span className="hero-assistant-title">Book by voice</span>
          <span className="muted">
            Tap the mic and say where you want to go. The assistant asks a few questions and sends your booking on
            WhatsApp. You can type too.
          </span>
          <span className="hero-assistant-link">Talk to the booking assistant</span>
        </a>
      </div>
    </section>
  );
}
