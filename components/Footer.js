import Logo from './Logo';
import { business, formatPhone, mapLink, telLink, whatsappLink } from '@/lib/business';
import { packages } from '@/lib/packages';

const quickLinks = [
  { href: '/packages', label: 'Packages' },
  { href: '/#fleet', label: 'Our fleet' },
  { href: '/#services', label: 'Destinations' },
  { href: '/#book', label: 'Book a taxi' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

const popularTrips = ['kasol-3d', 'manali-4d', 'chardham', 'do-dham'].map((id) => packages.find((p) => p.id === id));

const icon = {
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  chat: 'M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
};

const Icon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Reliable taxi from Zirakpur for every route, from daily pick and drop to the Chardham Yatra.</p>
          <div className="footer-social">
            <a href={business.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" />
              </svg>
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Icon d={icon.chat} />
            </a>
          </div>
        </div>

        <nav className="footer-col" aria-label="Quick links">
          <h2>Quick links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Popular trips">
          <h2>Popular trips</h2>
          <ul>
            {popularTrips.map((trip) => (
              <li key={trip.id}>
                <a href={`/packages#${trip.id}`}>{trip.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <h2>Contact</h2>
          <address>
            <ul>
              {business.phones.map((phone) => (
                <li key={phone}>
                  <Icon d={icon.phone} />
                  <a href={telLink(phone)}>{formatPhone(phone)}</a>
                </li>
              ))}
              <li>
                <Icon d={icon.chat} />
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <Icon d={icon.pin} />
                <a href={mapLink} target="_blank" rel="noopener noreferrer">
                  {business.address}
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </span>
        <a href="/credits">Photo credits</a>
      </div>
    </footer>
  );
}
