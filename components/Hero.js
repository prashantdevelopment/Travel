import Image from 'next/image';
import { business, bookingMessage, heroPhoto, telLink, whatsappLink } from '@/lib/business';

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
              Call now
            </a>
            <a className="btn btn-light" href={whatsappLink(bookingMessage)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
