import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileActionBar from '@/components/MobileActionBar';
import PageEffects from '@/components/PageEffects';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="en" className={inter.variable}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <MobileActionBar />
        <PageEffects />
      </body>
    </html>
  );
}
