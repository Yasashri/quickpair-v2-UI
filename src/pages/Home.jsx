import { Link } from "react-router-dom";
import Card from "../components/Card";

const slides = [
  {
    src: "/images/valentine.jpg",
    alt: "Romantic Valentine dinner setting",
  },
  {
    src: "/images/dinner_one.jpg",
    alt: "Couple enjoying dinner",
  },
  {
    src: "/images/beach.jpg",
    alt: "Beach date scenery",
  },
  {
    src: "/images/dinner_two.jpg",
    alt: "Cozy dinner date table",
  },
];

function Home() {
  return (
    <section className="container home">
      <div className="home__slides" aria-hidden="true">
        {slides.map((slide) => (
          <img key={slide.src} src={slide.src} alt={slide.alt} />
        ))}
      </div>

      <div className="hero-card">
        <div className="hero-card__content">
          <span className="eyebrow">Dating made simple</span>

          <h1>
            Find your next <span>Dinner Date</span> in minutes
          </h1>

          <p>
            QuickPair connects food lovers and hopeless romantics for cozy
            coffee chats, rooftop dinners, and everything in between.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="button">
              Get started
            </Link>

            <Link to="/profiles" className="button button--secondary">
              Browse profiles
            </Link>
          </div>
        </div>

       {/*  <div className="hero-preview">
          <Card title="Featured profile">
            <p>
              Enjoy meaningful connections and a friendly community designed for
              real dating.
            </p>
          </Card>
        </div> */}
      </div>
    </section>
  );
}

export default Home;