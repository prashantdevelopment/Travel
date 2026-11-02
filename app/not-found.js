export const metadata = { title: 'Page not found – Dhruv Fine Trip' };

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="container not-found">
        <h1>Page not found</h1>
        <p className="muted">This page does not exist. The booking assistant and our numbers are on the home page.</p>
        <a className="btn btn-primary" href="/">
          Go to home page
        </a>
      </div>
    </main>
  );
}
