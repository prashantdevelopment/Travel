import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileActionBar from '@/components/MobileActionBar';
import PageEffects from '@/components/PageEffects';
import SmoothScroll from '@/components/SmoothScroll';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Runs before first paint. On a reload, start at the top of the page: no restored scroll, no jump
// to an old #section (fresh visits to a link like /#book still land there). On the home page the
// header starts transparent over the hero; PageEffects keeps that in sync while scrolling.
const earlyScript = `if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
var nav = performance.getEntriesByType('navigation')[0];
if (nav && nav.type === 'reload') {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
}
if (location.pathname === '/' && !location.hash) document.documentElement.dataset.header = 'over';`;

export const metadata = {
  title: 'Dhruv Fine Trip | Taxi Service in Zirakpur, Chandigarh and Mohali',
  description:
    'Reliable one way and round trip taxi from Zirakpur to Delhi, Himachal Pradesh and the Chardham Yatra, plus daily pick and drop. Innova Crysta, Ertiga, Etios, Dzire and Tempo Traveller.',
};

export const viewport = {
  themeColor: '#f7f6f3',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <MobileActionBar />
        <PageEffects />
        <SmoothScroll />
      </body>
    </html>
  );
}
