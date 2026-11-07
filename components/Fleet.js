import Image from 'next/image';
import FleetFilter from './FleetFilter';
import { fleet } from '@/lib/business';

const counts = fleet.reduce((acc, car) => ({ ...acc, [car.group]: (acc[car.group] ?? 0) + 1 }), { all: fleet.length });

export default function Fleet() {
  return (
    <section id="fleet" className="section" aria-labelledby="fleet-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Our fleet</span>
          <h2 id="fleet-title">Reliable and comfortable cars for every trip</h2>
          <p className="muted">
            Pick the car that fits your group. If you are not sure, tell us how many people are travelling and we will
            suggest one.
          </p>
        </div>
        <FleetFilter counts={counts}>
          {fleet.map((car) => (
            <li key={car.id} className="card fleet-card" data-group={car.group}>
              <div className="fleet-photo">
                <Image
                  src={`/images/fleet/${car.id}.jpg`}
                  alt={car.name}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="fleet-body">
                <div className="fleet-info">
                  <h3>{car.name}</h3>
                  <span className="seats">{car.seats === 'Group' ? 'Group travel' : `${car.seats} seats`}</span>
                  <p className="muted">{car.note}</p>
                </div>
                <a className="btn btn-outline" href="#book" data-book-car={car.name}>
                  Book this car
                </a>
              </div>
            </li>
          ))}
        </FleetFilter>
      </div>
    </section>
  );
}
