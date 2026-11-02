// Single source of business data. Every section, the API and the voice agent read from here.
export const business = {
  name: 'Dhruv Fine Trip',
  phones: ['7310224488', '9621110066'],
  whatsapp: '917310224488',
  address: '65 Phase-1, Ravindra Enclave, Baltana, Zirakpur, Dist. SAS Nagar (Mohali), Punjab',
};

// Photos are from Wikimedia Commons; licences and authors are listed on /credits.
export const fleet = [
  { id: 'innova', name: 'Toyota Innova Crysta', seats: '7 + 1', note: 'Roomy and steady on long hill drives. Our first choice for families and the Chardham Yatra.', photo: { author: 'Premnath Kudva', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Toyota_Innova_Crysta_2.4_Z_front_right.jpg' } },
  { id: 'ertiga', name: 'Maruti Ertiga', seats: '6 + 1', note: 'Comfortable for a small family travelling with luggage.', photo: { author: 'Ramakrishna Mission Vidyapith', license: 'Public domain', source: 'https://commons.wikimedia.org/wiki/File:2022_Maruti_Suzuki_Ertiga_LXi.jpg' } },
  { id: 'etios', name: 'Toyota Etios', seats: '4 + 1', note: 'A spacious sedan with a big boot, good for Delhi trips.', photo: { author: 'Lingeswaran Marimuthukumar', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Toyota_Etios_top_left_front.jpg' } },
  { id: 'dzire', name: 'Swift Dzire', seats: '4 + 1', note: 'Easy on the budget for city rides and daily pick and drop.', photo: { author: 'Biswarup Ganguly', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Maruti_Suzuki_Dzire_VXi_VVT_(front).JPG' } },
  { id: 'tempo', name: 'Tempo Traveller', seats: 'Group', note: 'For bigger groups, yatra batches and family functions.', photo: { author: 'Yann Forget', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Force_Traveller,_Leh-Manali_Highway.jpg' } },
];

export const bookingMessage = `Hi ${business.name}, I want to book a taxi.`;

export const navLinks = [
  { href: '/#fleet', label: 'Fleet' },
  { href: '/#services', label: 'Services' },
  { href: '/#book', label: 'Book' },
  { href: '/#contact', label: 'Contact' },
];

export const telLink = (phone) => `tel:+91${phone}`;

export const formatPhone = (phone) => `${phone.slice(0, 5)} ${phone.slice(5)}`;

export const whatsappLink = (text = '') =>
  `https://wa.me/${business.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
