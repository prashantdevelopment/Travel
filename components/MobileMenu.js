'use client';

import { useState } from 'react';

export default function MobileMenu({ links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-menu" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button
        type="button"
        className="btn btn-outline"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
