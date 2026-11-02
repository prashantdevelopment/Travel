// Single source of business data. Every section, the API and the voice agent read from here.
export const business = {
  name: 'Dhruv Fine Trip',
  phones: ['7310224488', '9621110066'],
  whatsapp: '917310224488',
  address: '65 Phase-1, Ravindra Enclave, Baltana, Zirakpur, Dist. SAS Nagar (Mohali), Punjab',
};

export const navLinks = [
  { href: '#fleet', label: 'Fleet' },
  { href: '#services', label: 'Services' },
  { href: '#book', label: 'Book' },
  { href: '#contact', label: 'Contact' },
];

export const telLink = (phone) => `tel:+91${phone}`;

export const formatPhone = (phone) => `${phone.slice(0, 5)} ${phone.slice(5)}`;

export const whatsappLink = (text = '') =>
  `https://wa.me/${business.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
