import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function Login() {
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/profiles");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card login-card">
      <ScrollToTop />
      <span className="form-eyebrow">Welcome back</span>

      <h1>Login</h1>

      <p>Sign in to manage your dating profile and messages.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            type="email"
            required
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            required
            disabled={loading}
          />
        </label>

        <div className="form-helper">
          <Link to="/forgot-password" style={{ color: "rgba(56, 189, 248, 0.8)", fontSize: "0.85rem", fontWeight: "600", alignSelf: "flex-end" }}>
            Forgot password?
          </Link>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Logging in...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>

      <p className="form-note">
        Need an account? <Link to="/register">Register now</Link>
      </p>

      <p className="form-note" style={{ marginTop: "16px", fontSize: "0.8rem", color: "#6b7280" }}>
        By logging in, you agree to our{" "}
        <Link to="/terms" style={{ textDecoration: "underline", color: "inherit" }}>Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>Privacy Policy</Link>.
      </p>
    </section>
  );
}

export default Login;