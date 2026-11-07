import Hero from '@/components/Hero';
import Destinations from '@/components/Destinations';
import PackagesTeaser from '@/components/PackagesTeaser';
import Fleet from '@/components/Fleet';
import HowItWorks from '@/components/HowItWorks';
import WhyUs from '@/components/WhyUs';
import HappyCustomers from '@/components/HappyCustomers';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Destinations />
      <PackagesTeaser />
      <Fleet />
      <HowItWorks />
      <WhyUs />
      <HappyCustomers />
      <Faq />
      <Contact />
    </main>
  );
}
