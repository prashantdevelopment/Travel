import { business } from './business.js';

// kind 'tour': the client's own priced packages (given on 2026-11-07). Prices are per person in rupees.
// kind 'plan': suggested trip plans with real routes and typical days; the fare is quoted on request.
export const packages = [
  {
    id: 'kasol-3d',
    kind: 'tour',
    name: 'Kasol Tour',
    days: '3 days, 2 nights',
    price: 17000,
    priceNote: 'per person, all included',
    text: 'A short break in the Parvati Valley with everything included. Ask us for the day by day plan.',
    image: '/images/packages/kasol.jpg',
    alt: 'Snowy peaks of the Parvati Valley under a wide sky',
    photo: { author: 'Methemfetamine', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Parvati_Valley_from_Ratocha_Village.jpg' },
  },
  {
    id: 'kasol-4d',
    kind: 'tour',
    name: 'Kasol Tour',
    days: '4 days, 3 nights',
    price: 13900,
    priceNote: 'per person',
    text: 'One more day in the Parvati Valley to slow down and explore. Ask us what the price includes.',
    image: '/images/packages/kasol-milestone.jpg',
    alt: 'A white milestone with Kasol written on it in Hindi, among pine trees',
    photo: { author: 'Pinakpani', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Milestone_of_Kasol,_Himachal_Pradesh.jpg' },
  },
  {
    id: 'manali-4d',
    kind: 'tour',
    name: 'Manali Tour',
    days: '4 days, 3 nights',
    price: 16500,
    priceNote: 'per person',
    text: 'Four days in Manali and around. Ask us what the price includes and for the day by day plan.',
    image: '/images/packages/manali.jpg',
    alt: 'Snow covered mountain above a pine forest near Manali',
    photo: { author: 'Philip Nalangan', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Manali_India_6.jpg' },
  },
  {
    id: 'chardham',
    kind: 'plan',
    name: 'Chardham Yatra',
    days: '10 to 12 days',
    start: 'From Zirakpur or Haridwar',
    route: ['Haridwar', 'Barkot for Yamunotri', 'Uttarkashi for Gangotri', 'Sonprayag for Kedarnath', 'Badrinath', 'Back to Haridwar'],
    car: 'Innova Crysta or Tempo Traveller',
    text: 'All four dhams in one journey. Tell us how many days you have and we plan the drive around your family.',
    image: '/images/destinations/chardham.jpg',
    alt: 'Kedarnath temple with snow covered peaks behind it',
  },
  {
    id: 'do-dham',
    kind: 'plan',
    name: 'Do Dham Yatra',
    days: '5 to 6 days',
    start: 'From Zirakpur or Haridwar',
    route: ['Haridwar', 'Sonprayag for Kedarnath', 'Badrinath', 'Back to Haridwar'],
    car: 'Innova Crysta or Ertiga',
    text: 'Kedarnath and Badrinath only, for families who have a week or less.',
    image: '/images/packages/badrinath.jpg',
    alt: 'The colourful front of Badrinath temple with saffron flags',
    photo: { author: 'Vishwanath Negi', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Badrinath_Temple,_Uttarakhand_(Photo-_Vishwanath_Negi).jpg' },
  },
  {
    id: 'shimla-manali',
    kind: 'plan',
    name: 'Shimla and Manali',
    days: '5 to 6 days',
    start: 'From Zirakpur',
    route: ['Zirakpur', 'Shimla', 'Kufri', 'Manali', 'Solang Valley', 'Back to Zirakpur'],
    car: 'Any car from our fleet',
    text: 'The classic Himachal holiday: Mall Road in Shimla, snow at Solang and the old town of Manali.',
    image: '/images/destinations/himachal.jpg',
    alt: 'Shimla town spread across a green hillside',
  },
];

export const tours = packages.filter((p) => p.kind === 'tour');
export const plans = packages.filter((p) => p.kind === 'plan');

export const formatPrice = (rupees) => `₹${rupees.toLocaleString('en-IN')}`;

export const tourMessage = (tour) => `Hi ${business.name}, I want to book the ${tour.name} (${tour.days}) package.`;

export const fareMessage = (plan) => `Hi ${business.name}, please share the fare for the ${plan.name} package.`;

export const customTripMessage = `Hi ${business.name}, I want to plan a custom trip.`;
