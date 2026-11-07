import { business } from './business.js';

// Popular drives from Zirakpur. Distances and times are approximate road figures for planning,
// not quotes; traffic, weather and stops change them. The client should check them once.
// A route with `circuit` is a multi stop trip drawn as a path from stop to stop.
export const routes = [
  {
    id: 'chardham',
    name: 'Chardham Yatra',
    circuit: ['Haridwar', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'],
    km: 1600,
    days: '10 to 12 days',
    car: 'Innova Crysta or Tempo Traveller',
    note: 'From Haridwar to all four dhams and back. Yamunotri and Kedarnath end in a walk from the roadhead.',
    book: { package: 'Chardham Yatra' },
  },
  { id: 'delhi', name: 'Delhi', km: 250, hours: 5, car: 'Swift Dzire or Toyota Etios', note: 'One way drop or a same day round trip.' },
  { id: 'shimla', name: 'Shimla', km: 105, hours: 3, car: 'Any car from our fleet', note: 'The closest hill station, good for a weekend.' },
  { id: 'kasauli', name: 'Kasauli', km: 55, hours: 1.5, car: 'Any car from our fleet', note: 'A short, easy drive into the hills.' },
  { id: 'manali', name: 'Manali', km: 300, hours: 8, car: 'Innova Crysta or Ertiga', note: 'A long hill drive, best started early in the morning.' },
  { id: 'kasol', name: 'Kasol', km: 270, hours: 7, car: 'Innova Crysta or Ertiga', note: 'Through the Kullu valley into the Parvati valley.' },
  { id: 'dharamshala', name: 'Dharamshala', km: 245, hours: 6, car: 'Innova Crysta or Ertiga', note: 'McLeod Ganj is a short drive further up.' },
  { id: 'haridwar', name: 'Haridwar', km: 200, hours: 5, car: 'Any car from our fleet', note: 'The usual starting point for the Chardham Yatra.' },
];

export const formatKm = (km) => `about ${km.toLocaleString('en-IN')} km`;

export const formatDrive = (route) => route.days ?? `about ${route.hours} hours`;

export const routeFareMessage = (route) =>
  route.circuit
    ? `Hi ${business.name}, please share the fare for the ${route.name} (${route.circuit.join(', ')}).`
    : `Hi ${business.name}, please share the fare from Zirakpur to ${route.name}.`;
