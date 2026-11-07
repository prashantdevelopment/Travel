import { routes } from '@/lib/business';

// The list is drawn twice so the CSS loop is seamless; the copy is hidden from screen readers.
export default function RouteStrip() {
  const list = (hidden) => (
    <ul className="route-strip-list" aria-hidden={hidden || undefined}>
      {routes.map((place) => (
        <li key={place}>{place}</li>
      ))}
    </ul>
  );
  return (
    <section className="route-strip" aria-label="Places we drive to">
      <div className="route-strip-track">
        {list(false)}
        {list(true)}
      </div>
    </section>
  );
}
