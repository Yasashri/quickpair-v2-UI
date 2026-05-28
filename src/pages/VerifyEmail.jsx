import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function VerifyEmail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in, redirect them to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.email_verified_at) {
      // If already verified, go directly to profile creation
      navigate("/me");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/email/verify", { code: code.trim() });
      setMessage(response.data.message || "Email verified successfully!");
      // Refresh AuthContext user details (including email_verified_at)
      await refreshUser();
      // Redirect to /me profile page to complete the profile
      setTimeout(() => {
        navigate("/me");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.code?.[0] || 
        "Verification failed. Please check the code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/email/resend");
      setMessage(response.data.message || "A new verification code has been sent!");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Failed to resend code. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="form-card login-card password-reset-card">
      <ScrollToTop />
      <span className="form-eyebrow">Verification required</span>

      <h1>Verify Your Email</h1>

      <p>
        We have sent a 6-digit verification code to <strong>{user?.email}</strong>. 
        Please enter the code below to complete your registration.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Verification OTP Code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            required
            placeholder="Enter 6-digit code"
            disabled={loading || resending}
            maxLength={6}
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button type="submit" className="button" disabled={loading || resending}>
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </button>
      </form>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <button 
          onClick={handleResend} 
          disabled={resending || loading}
          className="link-button"
          style={{ fontSize: "0.85rem", color: "rgba(56, 189, 248, 0.8)", background: "transparent", border: "none", cursor: "pointer", fontWeight: "600", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          {resending ? (
            <>
              <span className="button-spinner" style={{ borderColor: "rgba(56, 189, 248, 0.35)", borderTopColor: "rgba(56, 189, 248, 0.8)" }}></span>
              Resending...
            </>
          ) : (
            "Resend Verification Code"
          )}
        </button>

        <p className="form-note" style={{ margin: 0 }}>
          Ignored verification? You can browse profiles, but you won't be able to edit your profile or communicate. <Link to="/">Go Home</Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmail;
