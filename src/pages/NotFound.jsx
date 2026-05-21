import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="page-card">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button button--secondary">Back to home</Link>
    </section>
  );
}

export default NotFound;
