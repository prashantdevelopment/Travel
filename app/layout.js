import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Dhruv Fine Trip – Taxi Service in Zirakpur, Chandigarh & Mohali',
  description:
    'Reliable one-way and round-trip taxi from Zirakpur: Chandigarh–Delhi, Himachal Pradesh, Chardham Yatra and daily pick & drop. Innova Crysta, Ertiga, Etios, Dzire, Tempo Traveller.',
};

export const viewport = {
  themeColor: '#f7f6f3',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
