// Real customer reviews only, copied with permission from Google, WhatsApp or a written note.
// Never add made up reviews. Shape: { name: 'Ramesh K.', trip: 'Chardham Yatra', text: '...', source: 'Google', date: '2026-10' }
export const reviews = [];

export const isPublishable = (review) =>
  ['name', 'trip', 'text', 'date'].every((field) => typeof review[field] === 'string' && review[field].trim()) &&
  ['Google', 'WhatsApp', 'Written note'].includes(review.source);

// Trip photos shared by customers (provided by the client, 2026-11-07). Alt text says only what is in the photo.
export const customerPhotos = [
  { src: '/images/customers/01.jpg', width: 720, height: 1280, alt: 'A couple standing on a bridge in the hills' },
  { src: '/images/customers/02.jpg', width: 720, height: 1280, alt: 'A boy relaxing on a sun lounger with green hills behind him' },
  { src: '/images/customers/03.jpg', width: 720, height: 1280, alt: 'A small child peeking out of a tent window' },
  { src: '/images/customers/04.jpg', width: 720, height: 1280, alt: 'A child in a life jacket climbing out of a swimming pool' },
  { src: '/images/customers/05.jpg', width: 720, height: 1280, alt: 'A traveller at a hilltop viewpoint with mountains behind' },
  { src: '/images/customers/06.jpg', width: 1280, height: 960, alt: 'Three women on a mountain road during their trip' },
  { src: '/images/customers/07.jpg', width: 960, height: 1280, alt: 'A man sitting at an outdoor cafe in the hills' },
  { src: '/images/customers/08.jpg', width: 1280, height: 960, alt: 'A man sitting in an old open jeep' },
];

export const shareReviewMessage = 'Hi Dhruv Fine Trip, I travelled with you and want to share my trip photos and experience.';
