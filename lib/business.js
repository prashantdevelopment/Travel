// Single source of business data. Every section, the API and the voice agent read from here.
export const business = {
  name: 'Dhruv Fine Trip',
  phones: ['7310224488', '9621110066'],
  whatsapp: '917310224488',
  facebook: 'https://www.facebook.com/share/18bo2AcbGZ/',
  address: '65 Phase-1, Ravindra Enclave, Baltana, Zirakpur, Dist. SAS Nagar (Mohali), Punjab',
};

// Photos are from Wikimedia Commons; licences and authors are listed on /credits.
export const heroPhoto = {
  alt: 'A road winding through green mountains in Lahaul, Himachal Pradesh',
  author: 'Lianguanlun',
  license: 'CC BY 4.0',
  source: 'https://commons.wikimedia.org/wiki/File:Varaha_River_bend_Lahaul_Leh%E2%80%93Manali_Highway.jpg',
};

export const fleet = [
  { id: 'innova', name: 'Toyota Innova Crysta', seats: '7 + 1', group: '7', note: 'Roomy and steady on long hill drives. Our first choice for families and the Chardham Yatra.', photo: { author: 'Premnath Kudva', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Toyota_Innova_Crysta_2.4_Z_front_right.jpg' } },
  { id: 'ertiga', name: 'Maruti Ertiga', seats: '6 + 1', group: '5to6', note: 'Comfortable for a small family travelling with luggage.', photo: { author: 'Ramakrishna Mission Vidyapith', license: 'Public domain', source: 'https://commons.wikimedia.org/wiki/File:2022_Maruti_Suzuki_Ertiga_LXi.jpg' } },
  { id: 'etios', name: 'Toyota Etios', seats: '4 + 1', group: '1to4', note: 'A spacious sedan with a big boot, good for Delhi trips.', photo: { author: 'Lingeswaran Marimuthukumar', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Toyota_Etios_top_left_front.jpg' } },
  { id: 'dzire', name: 'Swift Dzire', seats: '4 + 1', group: '1to4', note: 'Easy on the budget for city rides and daily pick and drop.', photo: { author: 'Biswarup Ganguly', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Maruti_Suzuki_Dzire_VXi_VVT_(front).JPG' } },
  { id: 'tempo', name: 'Tempo Traveller', seats: 'Group', group: '8plus', note: 'For bigger groups, yatra batches and family functions.', photo: { author: 'Yann Forget', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Force_Traveller,_Leh-Manali_Highway.jpg' } },
];

// Places we drive to, shown in the moving strip under the hero.
export const routes = ['Chandigarh', 'Delhi', 'Shimla', 'Manali', 'Kasol', 'Kasauli', 'Dharamshala', 'Haridwar', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'];

export const groupSizes = [
  { id: 'all', label: 'Any size' },
  { id: '1to4', label: '1 to 4 people' },
  { id: '5to6', label: '5 to 6 people' },
  { id: '7', label: '7 people' },
  { id: '8plus', label: '8 or more' },
];

export const destinations = [
  {
    id: 'chardham',
    name: 'Chardham Yatra',
    book: { drop: 'Chardham Yatra' },
    places: 'Yamunotri, Gangotri, Kedarnath, Badrinath',
    text: 'All four dhams in one trip, or only the one you plan to visit, in a car built for long mountain drives.',
    photo: { alt: 'Kedarnath temple with snow covered peaks behind it', author: 'Photos Worldwide', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:Majestic_and_Serene_Kedarnath_temple.jpg' },
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    book: { drop: 'Himachal Pradesh' },
    places: 'Shimla, Manali, Dharamshala, Kasauli',
    text: 'Weekend getaways or longer hill holidays across Himachal, at a pace that suits your family.',
    photo: { alt: 'Shimla town spread across a green hillside', author: 'Ryan from Toronto, Canada', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Shimla_town_(5726333362).jpg' },
  },
  {
    id: 'delhi',
    name: 'Delhi',
    book: { drop: 'Delhi' },
    places: 'One way or round trip',
    text: 'A one way drop to Delhi or a round trip from Chandigarh, on the day that suits you.',
    photo: { alt: 'India Gate in New Delhi at the end of a wide road', author: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Delhi,_India,_India_Gate.jpg' },
  },
  {
    id: 'tricity',
    name: 'Chandigarh tricity',
    book: { trip: 'Daily pick and drop' },
    places: 'Chandigarh, Mohali, Zirakpur',
    text: 'Daily pick and drop for office, college or any regular trip around the tricity.',
    photo: { alt: 'Boats on Sukhna Lake in Chandigarh with hills in the distance', author: 'Biswarup Ganguly', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Pedalos_-_Sukhna_Lake_-_Chandigarh_2016-08-07_9003.JPG' },
  },
];

export const bookingSteps = [
  { title: 'Tell us your trip', text: 'Fill the booking form, call us or send a WhatsApp message with your pickup, drop and date.' },
  { title: 'We confirm car and fare', text: 'Our team confirms the car and the fare with you on call or WhatsApp before the trip.' },
  { title: 'Your car comes to you', text: 'The driver picks you up from your door at the time you chose.' },
];

export const reasons = [
  { title: 'One way taxi', text: 'Going only one way? Book a one way taxi and skip paying for an empty return.' },
  { title: 'Every route', text: 'Delhi, Himachal, the Char Dham or a ride across the tricity. Tell us where and we will take you.' },
  { title: 'A car for every group', text: 'Sedans for two, MUVs for families and a Tempo Traveller for bigger groups.' },
  { title: 'A local office you can visit', text: 'We are in Ravindra Enclave, Baltana, Zirakpur. You always know who you are booking with.' },
];

export const bookingMessage = `Hi ${business.name}, I want to book a taxi.`;

export const navLinks = [
  { href: '/packages', label: 'Packages' },
  { href: '/#fleet', label: 'Fleet' },
  { href: '/#services', label: 'Services' },
  { href: '/#book', label: 'Book' },
  { href: '/#contact', label: 'Contact' },
];

export const telLink = (phone) => `tel:+91${phone}`;

export const formatPhone = (phone) => `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

export const whatsappLink = (text = '') =>
  `https://wa.me/${business.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(business.address)}&output=embed`;

export const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

export const faqs = [
  {
    q: 'How do I book a taxi?',
    a: `Call ${formatPhone(business.phones[0])} or ${formatPhone(business.phones[1])}, send us a WhatsApp message, or fill the booking form on this page.`,
  },
  { q: 'Do you offer a one way taxi?', a: 'Yes. One way taxi is one of our main services, including Chandigarh to Delhi and back.' },
  {
    q: 'Which cars can I book?',
    a: 'Toyota Innova Crysta (7 + 1), Maruti Ertiga (6 + 1), Toyota Etios (4 + 1), Swift Dzire (4 + 1) and a Tempo Traveller for groups.',
  },
  { q: 'Do you go on the Chardham Yatra?', a: 'Yes. We drive the full Chardham Yatra and the shorter Do Dham Yatra. See our packages for the usual routes.' },
  {
    q: 'How is the fare decided?',
    a: 'It depends on the route, the car and the number of days. Our team tells you the fare on call or WhatsApp before you confirm.',
  },
  { q: 'Do you have daily pick and drop?', a: 'Yes, for office, college or any regular trip across Chandigarh, Mohali and Zirakpur.' },
  { q: 'Where is your office?', a: business.address },
];
