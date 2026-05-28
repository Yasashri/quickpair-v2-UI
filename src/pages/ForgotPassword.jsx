import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import ScrollToTop from "../components/ScrollToTop";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.email?.[0] || 
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card login-card password-reset-card">
      <ScrollToTop />
      <span className="form-eyebrow">Forgot your password?</span>

      <h1>Recover Password</h1>

      {success ? (
        <div className="success-container">
          <div className="form-success">
            An OTP code has been sent to your email. Please check your inbox and spam folder.
          </div>
          <p className="form-note-spaced">
            Ready to reset? Click the button below to verify your OTP code and set a new password.
          </p>
          <Link 
            to={`/reset-password?email=${encodeURIComponent(email)}`} 
            className="button"
            style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          >
            Reset Password
          </Link>
          <p className="form-note">
            Back to <Link to="/login">Login</Link>
          </p>
        </div>
      ) : (
        <>
          <p>Enter your email address and we'll send you an OTP code to reset your password.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Email Address
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Sending...
                </>
              ) : (
                "Send OTP Code"
              )}
            </button>
          </form>

          <p className="form-note">
            Remember your password? <Link to="/login">Login now</Link>
          </p>
        </>
      )}
    </section>
  );
}

export default ForgotPassword;
