import { Link } from "react-router-dom";
import Card from "../components/Card";

function Home() {
  return (
    <section className='container home'>
      <div className='home__slides'>
        <img src='images/valentine.jpg' alt='image one' />
        <img src='images/dinner_one.jpg' alt='image two' />
        <img src='images/beach.jpg' alt='image three' />
        <img src='images/dinner_two.jpg' alt='image four' />
      </div>
      <div className='hero-card'>
        <div>
          <span className='eyebrow'>Dating made simple</span>
          <h1>Find your next Dinner Date in minutes</h1>
          <p>
            QuickPair connects food lovers and hopeless romantics for cozy
            coffee chats, rooftop dinners, and everything in between.
          </p>
          <div className='hero-actions'>
            <Link to='/register' className='button'>
              Get started
            </Link>
            <Link to='/profiles' className='button button--secondary'>
              Browse profiles
            </Link>
          </div>
        </div>
        <div className='hero-preview'>
          <Card title='Featured profile'>
            <p>
              Enjoy meaningful connections and a friendly community designed for
              real dating.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Home;
