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
          <a className="social-link" href={business.facebook} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" />
            </svg>
            Facebook
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
