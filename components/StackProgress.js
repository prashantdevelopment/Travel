'use client';

import { useEffect } from 'react';

// Scroll driven stacking: each destination card sticks, and as the next card slides over it,
// this sets --p (0 to 1) on the card underneath so CSS can shrink and dim it. Off with reduced motion.
export default function StackProgress() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = [...document.querySelectorAll('.destination-grid > li')];
    let frame = 0;
    const update = () => {
      items.forEach((item, i) => {
        const next = items[i + 1];
        if (!next) return;
        const stick = parseFloat(getComputedStyle(item).top) || 0;
        const height = item.offsetHeight;
        const p = Math.min(1, Math.max(0, (stick + height - next.getBoundingClientRect().top) / height));
        item.style.setProperty('--p', p.toFixed(3));
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return null;
}
