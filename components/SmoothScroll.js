'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

// Gentle wheel smoothing on desktop. Touch scrolling stays native (syncTouch off) and
// reduced motion turns smoothing off. Anchor links honour each section's CSS scroll-margin-top.
function ResetOnRouteChange() {
  const lenis = useLenis();
  const pathname = usePathname();
  useEffect(() => {
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true });
  }, [lenis, pathname]);
  return null;
}

export default function SmoothScroll() {
  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: true }}>
      <ResetOnRouteChange />
    </ReactLenis>
  );
}
