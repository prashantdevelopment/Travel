import Logo from './Logo';
import { business, formatPhone, mapLink, telLink, whatsappLink } from '@/lib/business';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo />
          <p className="muted">Taxi service for all routes, including the Chardham Yatra.</p>
        </div>
        <address className="footer-contact">
          <a href={mapLink} target="_blank" rel="noopener noreferrer">
            {business.address}
          </a>
          <span>
            {business.phones.map((phone, i) => (
              <span key={phone}>
                {i > 0 && ' · '}
                <a href={telLink(phone)}>{formatPhone(phone)}</a>
              </span>
            ))}
          </span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </address>
      </div>
      <div className="container footer-bottom muted">
        <span>
          © {new Date().getFullYear()} {business.name}
        </span>
        <a href="/credits">Photo credits</a>
      </div>
    </footer>
  );
}
