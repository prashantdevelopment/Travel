import { fleet } from '@/lib/business';

export const metadata = { title: 'Photo credits | Dhruv Fine Trip' };

export default function Credits() {
  return (
    <main id="main" className="section">
      <div className="container credits">
        <h1>Photo credits</h1>
        <p className="muted">The vehicle photos on this site come from Wikimedia Commons and are used under these licences.</p>
        <ul>
          {fleet.map((car) => (
            <li key={car.id}>
              <strong>{car.name}</strong>: photo by {car.photo.author}, {car.photo.license}.{' '}
              <a href={car.photo.source} target="_blank" rel="noopener noreferrer">
                Source
              </a>
            </li>
          ))}
        </ul>
        <a className="btn btn-outline" href="/">
          Back to home page
        </a>
      </div>
    </main>
  );
}
