import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const featureItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

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

      {/* Hero Entry Animation */}
      <motion.div 
        className="hero-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* About Us Card Scroll Animation */}
      <motion.div 
        className="about-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="eyebrow" style={{ borderColor: "rgba(56, 189, 248, 0.3)", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>About us</span>
        <h2>Connecting Hearts Over Shared Tables</h2>
        <p>
          QuickPair was founded on a simple belief: the best connections start with a shared meal, a cozy cup of coffee, and real, face-to-face conversations. We help you skip the endless swiping and superficial chats, matching you directly with local food lovers and romantics who are ready to meet in person.
        </p>
        
        <motion.div 
          className="about-features" 
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: "28px" }}
        >
          <motion.div className="feature-item" variants={featureItemVariants} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "18px" }}>
            <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "12px" }}>🍽️</span>
            <h3 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "700", margin: "0 0 8px" }}>Dinner Dates First</h3>
            <p style={{ color: "#b3aecf", fontSize: "0.85rem", margin: 0, lineHeight: "1.5" }}>Connect over shared cuisines and dinner tables. Skip the generic greetings and invite your match directly to your favorite spot.</p>
          </motion.div>
          
          <motion.div className="feature-item" variants={featureItemVariants} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "18px" }}>
            <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "12px" }}>✨</span>
            <h3 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "700", margin: "0 0 8px" }}>Genuine Connections</h3>
            <p style={{ color: "#b3aecf", fontSize: "0.85rem", margin: 0, lineHeight: "1.5" }}>We focus on real profiles and authentic intentions. No endless loops, just honest conversations leading to cozy dinner chats.</p>
          </motion.div>
          
          <motion.div className="feature-item" variants={featureItemVariants} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "18px" }}>
            <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "12px" }}>🔒</span>
            <h3 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "700", margin: "0 0 8px" }}>Safe & Secure</h3>
            <p style={{ color: "#b3aecf", fontSize: "0.85rem", margin: 0, lineHeight: "1.5" }}>With robust verification safety steps and policy safeguards, we keep our community clean, respectful, and safe for everyone.</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Contact Card Scroll Animation */}
      <motion.div 
        className="contact-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
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
      </motion.div>
    </section>
  );
}

export default Home;