'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// Swipeable, centred carousel (CSS scroll snap). Auto advances until the visitor touches it.
export default function PhotoCarousel({ photos }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  const goTo = (i) => {
    const slide = track.current.children[(i + photos.length) % photos.length];
    track.current.scrollTo({ left: slide.offsetLeft - (track.current.clientWidth - slide.clientWidth) / 2, behavior: 'smooth' });
  };
  const userGo = (i) => {
    setAuto(false);
    goTo(i);
  };

  // The slide nearest the centre of the track is the active one.
  useEffect(() => {
    const el = track.current;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const centre = el.scrollLeft + el.clientWidth / 2;
        const slides = [...el.children];
        const nearest = slides.reduce((best, s, i) => (Math.abs(s.offsetLeft + s.clientWidth / 2 - centre) < Math.abs(slides[best].offsetLeft + slides[best].clientWidth / 2 - centre) ? i : best), 0);
        setActive(nearest);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => goTo(active + 1), 4500);
    return () => clearInterval(timer);
  });

  return (
    <div className="carousel" aria-roledescription="carousel" aria-label="Customer trip photos" data-auto={auto ? 'on' : 'off'}>
      <ul ref={track} className="carousel-track" onPointerDown={() => setAuto(false)} onFocus={() => setAuto(false)}>
        {photos.map((p, i) => (
          <li key={p.src} className="carousel-slide" data-active={i === active} aria-roledescription="slide" aria-label={`${i + 1} of ${photos.length}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 420px, 80vw" />
          </li>
        ))}
      </ul>
      <div className="carousel-controls">
        <button type="button" className="carousel-arrow" onClick={() => userGo(active - 1)} aria-label="Previous photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="carousel-dots">
          {photos.map((p, i) => (
            <button key={p.src} type="button" className="carousel-dot" aria-label={`Show photo ${i + 1}`} aria-current={i === active} onClick={() => userGo(i)} />
          ))}
        </div>
        <button type="button" className="carousel-arrow" onClick={() => userGo(active + 1)} aria-label="Next photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Photo {active + 1} of {photos.length}
      </p>
    </div>
  );
}
