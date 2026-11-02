import { reasons } from '@/lib/business';

// One simple line icon per reason, drawn for this site.
const icons = [
  <path key="oneway" d="M4 12h14M13 6l6 6-6 6" />,
  <path key="routes" d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  <path key="group" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.7" />,
  <path key="office" d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4" />,
];

export default function WhyUs() {
  return (
    <section id="why" className="section section-surface" aria-labelledby="why-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why ride with us</span>
          <h2 id="why-title">Simple, honest taxi service</h2>
        </div>
        <ul className="reasons">
          {reasons.map((reason, i) => (
            <li key={reason.title} className="card reason">
              <span className="reason-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {icons[i]}
                </svg>
              </span>
              <h3>{reason.title}</h3>
              <p className="muted">{reason.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
