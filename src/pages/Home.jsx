import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import api from "../api/api";

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
  const [form, setForm] = useState({ name: "", email: "", type: "issue", message: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await api.post("/contact", form);
      setSuccessMsg(res.data.message || "Thank you! Your feedback has been received.");
      setForm({ name: "", email: "", type: "issue", message: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Unable to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="contact-card">
        <div className="contact-card__header">
          <span className="eyebrow" style={{ borderColor: "rgba(255, 79, 123, 0.3)", background: "rgba(255, 79, 123, 0.1)", color: "#ff4f7b" }}>Get in touch</span>
          <h2>Have issues or improvements?</h2>
          <p>Let us know how we can make QuickPair better for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <label>
              Your Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={loading}
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
              />
            </label>
          </div>

          <label>
            Type of feedback
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              disabled={loading}
            >
              <option value="issue">Report an Issue</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="general">General Feedback</option>
            </select>
          </label>

          <label>
            Message
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              disabled={loading}
              rows={5}
              placeholder="Describe your issue or suggestion here..."
            />
          </label>

          {successMsg && <p className="form-success" style={{ color: "#10b981", fontWeight: "600", margin: "10px 0" }}>{successMsg}</p>}
          {errorMsg && <p className="form-error" style={{ margin: "10px 0" }}>{errorMsg}</p>}

          <button type="submit" className="button" disabled={loading}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Sending...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>

        <div className="contact-direct">
          <p>
            For direct inquiries, email us at:{" "}
            <a href="mailto:quickpair.ca@gmail.com">quickpair.ca@gmail.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;