import Hero from '@/components/Hero';
import Destinations from '@/components/Destinations';
import Fleet from '@/components/Fleet';
import HowItWorks from '@/components/HowItWorks';
import WhyUs from '@/components/WhyUs';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Destinations />
      <Fleet />
      <HowItWorks />
      <WhyUs />
    </main>
  );
}
