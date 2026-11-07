import Image from 'next/image';
import { whatsappLink } from '@/lib/business';
import { customTripMessage, fareMessage, formatPrice, plans, tourMessage, tours } from '@/lib/packages';

export const metadata = {
  title: 'Tour packages | Dhruv Fine Trip',
  description:
    'Kasol and Manali tour packages from Zirakpur with per person prices, plus Chardham Yatra, Do Dham and Shimla Manali trip plans. Book on WhatsApp.',
};

// Opens the home booking form with this package filled in.
const bookLink = (name) => `/?package=${encodeURIComponent(name)}#book`;

function PackagePhoto({ pkg }) {
  return (
    <div className="package-photo">
      <Image src={pkg.image} alt={pkg.alt} fill sizes="(min-width: 960px) 480px, 100vw" />
    </div>
  );
}

export default function PackagesPage() {
  return (
    <main id="main">
      <section className="page-head">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our packages</span>
            <h1>Tour packages and trip plans</h1>
            <p className="muted">
              Our tour packages come with a fixed price per person. For the yatras and longer trips we share the fare for
              your dates on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="section packages-section" aria-labelledby="tours-title">
        <div className="container">
          <h2 id="tours-title" className="list-title">
            Tour packages
          </h2>
          <div className="package-list">
            {tours.map((tour) => (
              <article key={tour.id} id={tour.id} className="card package">
                <PackagePhoto pkg={tour} />
                <div className="package-body">
                  <h3 className="package-name">{tour.name}</h3>
                  <ul className="package-facts">
                    <li>{tour.days}</li>
                  </ul>
                  <p className="price">
                    <strong>{formatPrice(tour.price)}</strong> <span className="muted">{tour.priceNote}</span>
                  </p>
                  <p className="muted">{tour.text}</p>
                  <div className="package-actions">
                    <a className="btn btn-primary" href={whatsappLink(tourMessage(tour))} target="_blank" rel="noopener noreferrer">
                      Book on WhatsApp
                    </a>
                    <a className="btn btn-outline" href={bookLink(`${tour.name} (${tour.days})`)}>
                      Use the booking form
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section packages-section section-surface" aria-labelledby="plans-title">
        <div className="container">
          <h2 id="plans-title" className="list-title">
            Yatra and trip plans
          </h2>
          <p className="muted list-intro">Usual routes and days. Every plan can change to suit your family, and we share the fare for your dates.</p>
          <div className="package-list">
            {plans.map((plan) => (
              <article key={plan.id} id={plan.id} className="card package">
                <PackagePhoto pkg={plan} />
                <div className="package-body">
                  <h3 className="package-name">{plan.name}</h3>
                  <ul className="package-facts">
                    <li>{plan.days}</li>
                    <li>{plan.start}</li>
                    <li>{plan.car}</li>
                  </ul>
                  <p className="muted">{plan.text}</p>
                  <h4 className="route-title">Usual route</h4>
                  <ol className="route">
                    {plan.route.map((stop) => (
                      <li key={stop}>{stop}</li>
                    ))}
                  </ol>
                  <div className="package-actions">
                    <a className="btn btn-primary" href={whatsappLink(fareMessage(plan))} target="_blank" rel="noopener noreferrer">
                      Ask fare on WhatsApp
                    </a>
                    <a className="btn btn-outline" href={bookLink(plan.name)}>
                      Book this trip
                    </a>
                  </div>
                </div>
              </article>
            ))}

            <article id="custom" className="card package package-custom">
              <div className="package-body">
                <h3 className="package-name">Plan your own trip</h3>
                <p className="muted">
                  Going somewhere else? We cover all routes. Tell us where, when and how many people, and we will suggest a
                  car and a plan.
                </p>
                <div className="package-actions">
                  <a className="btn btn-primary" href={whatsappLink(customTripMessage)} target="_blank" rel="noopener noreferrer">
                    Plan on WhatsApp
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
