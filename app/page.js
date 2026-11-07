import Hero from '@/components/Hero';
import RouteStrip from '@/components/RouteStrip';
import Destinations from '@/components/Destinations';
import PackagesTeaser from '@/components/PackagesTeaser';
import Fleet from '@/components/Fleet';
import HowItWorks from '@/components/HowItWorks';
import BookSection from '@/components/BookSection';
import WhyUs from '@/components/WhyUs';
import HappyCustomers from '@/components/HappyCustomers';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <RouteStrip />
      <Destinations />
      <PackagesTeaser />
      <Fleet />
      <HowItWorks />
      <BookSection />
      <WhyUs />
      <HappyCustomers />
      <Faq />
      <Contact />
    </main>
  );
}
