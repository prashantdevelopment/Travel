import { bookingSteps } from '@/lib/business';

export default function HowItWorks() {
  return (
    <section id="how" className="section" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How booking works</span>
          <h2 id="how-title">Three steps and you are on your way</h2>
        </div>
        <ol className="steps">
          {bookingSteps.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-number" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
