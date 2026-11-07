import { destinations, fleet, heroPhoto } from './business.js';
import { packages } from './packages.js';

// Every photo on the site, for the /credits page.
export const photoCredits = () => [
  { label: 'Mountain road (top of the home page)', ...heroPhoto },
  ...destinations.map((d) => ({ label: d.name, ...d.photo })),
  ...packages.filter((p) => p.photo).map((p) => ({ label: p.kind === 'tour' ? `${p.name}, ${p.days}` : `${p.name} package`, ...p.photo })),
  ...fleet.map((car) => ({ label: car.name, ...car.photo })),
];
