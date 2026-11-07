import { business, bookingMessage, formatPhone, mapEmbed, mapLink, telLink, whatsappLink } from '@/lib/business';

export default function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Contact</span>
          <h2 id="contact-title">Call, message or visit us</h2>
          <p className="muted">For bookings, call either number or send a WhatsApp message. You can also walk into our office.</p>
        </div>
        <div className="contact-grid">
          <ul className="contact-list">
            <li className="card contact-item">
              <h3>Call</h3>
              {business.phones.map((phone) => (
                <a key={phone} className="contact-big" href={telLink(phone)}>
                  {formatPhone(phone)}
                </a>
              ))}
            </li>
            <li className="card contact-item">
              <h3>WhatsApp</h3>
              <p className="muted">Send your pickup, drop and date. We reply on the same chat.</p>
              <a className="btn btn-primary" href={whatsappLink(bookingMessage)} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </li>
            <li className="card contact-item">
              <h3>Visit</h3>
              <address>{business.address}</address>
              <a className="btn btn-outline" href={mapLink} target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
            </li>
            <li className="card contact-item">
              <h3>Facebook</h3>
              <p className="muted">See our latest trips and updates.</p>
              <a className="btn btn-outline" href={business.facebook} target="_blank" rel="noopener noreferrer">
                Follow us on Facebook
              </a>
            </li>
          </ul>
          <div className="contact-map">
            <iframe
              title={`Map showing ${business.name} in Baltana, Zirakpur`}
              src={mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
