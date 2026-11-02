import Image from 'next/image';
import { destinations } from '@/lib/business';

export default function Destinations() {
  return (
    <section id="services" className="section destinations" aria-labelledby="destinations-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Where we go</span>
          <h2 id="destinations-title">From daily rides to the Char Dham</h2>
          <p className="muted">
            One way taxi, round trips and daily pick and drop. These are the trips people book with us most.
          </p>
        </div>
        <ul className="destination-grid">
          {destinations.map((place) => (
            <li key={place.id}>
              <a className="destination-card" href="#book">
                <span className="destination-photo">
                  <Image
                    src={`/images/destinations/${place.id}.jpg`}
                    alt={place.photo.alt}
                    fill
                    sizes="(min-width: 1120px) 540px, (min-width: 640px) 50vw, 100vw"
                  />
                </span>
                <span className="destination-text">
                  <span className="destination-places">{place.places}</span>
                  <span className="destination-name">{place.name}</span>
                  <span className="destination-desc">{place.text}</span>
                  <span className="destination-cta">Book this trip</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
