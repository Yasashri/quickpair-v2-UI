import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";
import Card from "../components/Card";
import { formatLastSeen } from "../utils/date";

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
  const [newestProfiles, setNewestProfiles] = useState([]);
  const [loadingNewest, setLoadingNewest] = useState(true);

  useEffect(() => {
    setLoadingNewest(true);
    api.get("/profiles?sort=recent")
      .then((response) => {
        const list = response.data.data || [];
        setNewestProfiles(list.slice(0, 5));
        setLoadingNewest(false);
      })
      .catch(() => {
        setLoadingNewest(false);
      });
  }, []);

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
          {/* <span className="eyebrow">Dating made simple</span> */}

          <h1>
            Find your next <span>Dinner Date</span> in minutes
          </h1>

       {/*    <p>
            QuickPair connects food lovers and hopeless romantics for cozy
            coffee chats, rooftop dinners, and everything in between.
          </p> */}

          <div className="hero-actions">
            <Link to="/register" className="button">
              Get started
            </Link>

            <Link to="/profiles" className="button button--secondary">
              See all members
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Newest Members Section */}
      <motion.div 
        className="newest-members-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="newest-members-section__header">
          <span className="eyebrow" style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>New members</span>
          <h2>Our Newest Members</h2>
          <p>Say hello to the latest people who joined QuickPair.</p>
        </div>

        {loadingNewest ? (
          <div className='grid-list grid-list--newest'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card skeleton-card" style={{ pointerEvents: "none", opacity: 0.7 }}>
                <div className="card__image skeleton"></div>
                <div className="card__body">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-meta"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid-list grid-list--newest'>
            {newestProfiles.map((profile) => {
              const profileImage = profile.profile_image_url || `/avatar.jpg`;
              return (
                <Link
                  key={profile.id}
                  to={`/profiles/${profile.id}`}
                  className="card-link"
                >
                  <Card
                    title={
                      <div className="profile-card-title">
                        <span>{`${profile.display_name || "New member"}${profile.age ? `, ${profile.age}` : ""}`}</span>
                        {profile.user?.email_verified_at && (
                          <span className="verified-badge-tick" title="Email Verified" style={{ color: "#10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                            &nbsp;✓
                          </span>
                        )}
                      </div>
                    }
                    image={profileImage}
                    imageAlt={profile.display_name || "Profile image"}
                  >
                    <p className='profile-meta'>
                      {profile.city
                        ? `${profile.city}, ${profile.country}`
                        : "Location hidden"}
                    </p>

                    <div className="profile-status-inline">
                      <span 
                        className={`status-indicator-badge-inline ${
                          profile.user?.is_online ? 'online' : 'offline'
                        }`}
                      >
                        {profile.user?.is_online ? (
                          <span className="status-badge-dot" />
                        ) : (
                          <span className="status-badge-dot-offline" />
                        )}
                        <span>
                          {profile.user?.is_online 
                            ? 'Online' 
                            : profile.user?.last_seen_at 
                              ? `Active ${formatLastSeen(profile.user.last_seen_at)}` 
                              : 'Offline'
                          }
                        </span>
                      </span>
                    </div>

                    <div className="profile-tags">
                      {profile.gender && (
                        <span className="profile-tag profile-tag--gender">
                          {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                        </span>
                      )}
                      <span className="profile-tag profile-tag--looking">
                        Looking: <strong>{profile.looking_for || "anyone"}</strong>
                      </span>
                    </div>

                    <div className='button button--small'>
                      View profile
                    </div>
                  </Card>
                </Link>
              );
            })}

            {newestProfiles.length === 0 && (
              <p className='empty-state'>No new members found.</p>
            )}
          </div>
        )}
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