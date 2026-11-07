import PhotoCarousel from './PhotoCarousel';
import { whatsappLink } from '@/lib/business';
import { customerPhotos, isPublishable, reviews, shareReviewMessage } from '@/lib/reviews';

// Real trip photos and real reviews only. With neither, it just invites past customers to share.
export default function HappyCustomers() {
  const shown = reviews.filter(isPublishable);
  const hasContent = shown.length > 0 || customerPhotos.length > 0;

  return (
    <section id="reviews" className="section" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{hasContent ? 'Happy customers' : 'Your experience'}</span>
          <h2 id="reviews-title">{hasContent ? 'Moments from our trips' : 'Travelled with us?'}</h2>
          <p className="muted">
            {hasContent
              ? 'Photos shared by families who travelled with us. Swipe or use the arrows to see them all.'
              : 'Tell us how your trip went. With your permission we will share your words here to help other families choose.'}
          </p>
        </div>

        {customerPhotos.length > 0 && <PhotoCarousel photos={customerPhotos} />}

        {shown.length > 0 && (
          <ul className="review-grid">
            {shown.map((review) => (
              <li key={`${review.name}-${review.date}`} className="card review">
                <blockquote>{review.text}</blockquote>
                <p className="review-by">
                  <strong>{review.name}</strong>
                  <span className="muted">
                    {review.trip} · via {review.source}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <a className="btn btn-outline review-share" href={whatsappLink(shareReviewMessage)} target="_blank" rel="noopener noreferrer">
          Share your trip photos on WhatsApp
        </a>
      </div>
    </section>
  );
}
