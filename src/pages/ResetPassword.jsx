import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import ScrollToTop from "../components/ScrollToTop";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pre-fill email and OTP if they exist in the URL query params
  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const otpParam = searchParams.get("otp") || "";
    setForm((prev) => ({
      ...prev,
      email: emailParam,
      otp: otpParam,
    }));
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/reset-password", form);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.otp?.[0] || 
        err.response?.data?.errors?.password?.[0] || 
        "Failed to reset password. Please check your OTP and details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card login-card password-reset-card">
      <ScrollToTop />
      <span className="form-eyebrow">Set new credentials</span>

      <h1>Reset Password</h1>

      {success ? (
        <div className="success-container">
          <div className="form-success">
            Password reset successful! You can now log in with your new password.
          </div>
          <p className="form-note-spaced">
            Click the button below to navigate to the login screen.
          </p>
          <Link 
            to="/login" 
            className="button"
            style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          >
            Login Now
          </Link>
        </div>
      ) : (
        <>
          <p>Please enter your email, the OTP code sent to you, and choose a new password.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Email Address
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>

            <label>
              OTP Code
              <input
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                type="text"
                required
                placeholder="Enter 6-digit code"
                disabled={loading}
              />
            </label>

            <label>
              New Password
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type="password"
                required
                placeholder="Min 8 characters"
                disabled={loading}
              />
            </label>

            <label>
              Confirm Password
              <input
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                type="password"
                required
                placeholder="Repeat new password"
                disabled={loading}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="form-note">
            Back to <Link to="/login">Login</Link>
          </p>
        </>
      )}
    </section>
  );
}

export default ResetPassword;
