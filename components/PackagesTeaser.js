import Image from 'next/image';
import { formatPrice, tours } from '@/lib/packages';

export default function PackagesTeaser() {
  return (
    <section id="packages" className="section section-surface" aria-labelledby="packages-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Our packages</span>
          <h2 id="packages-title">Tour packages</h2>
          <p className="muted">Fixed price per person. Yatra plans and custom trips are on the packages page.</p>
        </div>
        <ul className="teaser-grid">
          {tours.map((tour) => (
            <li key={tour.id}>
              <a className="card teaser" href={`/packages#${tour.id}`}>
                <span className="teaser-photo">
                  <Image src={tour.image} alt={tour.alt} fill sizes="(min-width: 960px) 360px, 100vw" />
                </span>
                <span className="teaser-body">
                  <span className="teaser-days">{tour.days}</span>
                  <span className="teaser-name">{tour.name}</span>
                  <span className="teaser-price">
                    <strong>{formatPrice(tour.price)}</strong> <span className="muted">{tour.priceNote}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <a className="btn btn-outline teaser-all" href="/packages">
          See all packages and yatra plans
        </a>
      </div>
    </section>
  );
}
