import { Link } from 'react-router-dom';
import Card from '../components/Card';

function Home() {
  return (
    <section className="page-card">
      <div className="hero-card">
        <div>
          <span className="eyebrow">Dating made simple</span>
          <h1>Find your next match with QuickPair</h1>
          <p>Browse curated profiles, message safely, and manage your account from a modern mobile-first experience.</p>
          <div className="hero-actions">
            <Link to="/register" className="button">Get started</Link>
            <Link to="/profiles" className="button button--secondary">Browse profiles</Link>
          </div>
        </div>
        <div className="hero-preview">
          <Card title="Featured profile">
            <p>Enjoy meaningful connections and a friendly community designed for real dating.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Home;
