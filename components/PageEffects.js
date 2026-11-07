'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const REVEAL = '.section-head, .destination-grid > li, .teaser-grid > li, .fleet-grid > li, .steps > li, .reasons > li, .package, .contact-list > li, .faq-list';

// Scroll reveal and the active nav link. Content stays visible if this never runs.
export default function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const items = [...document.querySelectorAll(REVEAL)];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.effects = 'ready';
    if (reduced || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('reveal-ready');
    items.forEach((el) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${([...el.parentElement.children].indexOf(el) % 4) * 80}ms`);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const links = [...document.querySelectorAll('nav[aria-label=Main] a')];
    const mark = (href) => links.forEach((a) => (a.getAttribute('href') === href ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));

    if (pathname !== '/') {
      mark(pathname);
      return;
    }
    mark(null);
    // Watch every section; ones without a nav link (hero, packages, reviews, faq) clear the highlight.
    const sections = [...document.querySelectorAll('main > section')];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) mark(`/#${visible[0].target.id}`);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
