import { faqs } from '@/lib/business';

// Native details/summary: keyboard and screen reader support with no JavaScript.
export default function Faq() {
  return (
    <section id="faq" className="section section-surface" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <div className="section-head">
          <span className="eyebrow">Questions</span>
          <h2 id="faq-title">Before you book</h2>
          <p className="muted">Short answers to what people ask us most. Anything else, just call or message us.</p>
        </div>
        <div className="faq-list">
          {faqs.map(({ q, a }) => (
            <details key={q} className="faq">
              <summary>{q}</summary>
              <p className="muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
