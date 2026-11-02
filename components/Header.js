import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { business, navLinks, telLink } from '@/lib/business';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          <a className="btn btn-primary" href={telLink(business.phones[0])}>
            <span>
              Call<span className="hide-phone"> now</span>
            </span>
          </a>
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
