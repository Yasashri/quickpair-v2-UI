import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function VerifyPhone() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // If user is not logged in, redirect them to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.phone_verified_at) {
      // If already verified, go directly to profile creation
      navigate("/me");
    }
  }, [isAuthenticated, user, navigate]);

  // Lock resend button if coming from the banner resend trigger
  useEffect(() => {
    if (location.state?.justResent) {
      setCountdown(30);
      // Clear navigation state so it doesn't trigger on subsequent reloads
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/phone/verify", { code: code.trim() });
      setMessage(response.data.message || "Phone verified successfully!");
      // Refresh AuthContext user details (including phone_verified_at)
      await refreshUser();
      // Redirect to /me profile page to complete the profile
      setTimeout(() => {
        navigate("/me");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.code?.[0] ||
          "Verification failed. Please check the code.",
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
      const response = await api.post("/phone/resend");
      setMessage(
        response.data.message || "A new verification code has been sent!",
      );
      setCountdown(30);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend code. Please try again later.",
      );
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <section className='form-card login-card password-reset-card'>
      <ScrollToTop />
      <span className='form-eyebrow'>Verification required</span>

      <h1>Verify Your Phone Number</h1>

      <p>
        We have sent a 6-digit verification code to{" "}
        <strong>{user?.phone}</strong>. Please enter the code below to complete
        your registration.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Verification OTP Code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type='text'
            required
            placeholder='Enter 6-digit code'
            disabled={loading || resending}
            maxLength={6}
          />
        </label>

        {error && <p className='form-error'>{error}</p>}
        {message && <p className='form-success'>{message}</p>}

        <button
          type='submit'
          className='button'
          disabled={loading || resending}
        >
          {loading ? (
            <>
              <span className='button-spinner'></span>
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleResend}
          disabled={resending || loading || countdown > 0}
          className='link-button'
          style={{
            fontSize: "0.85rem",
            color: (resending || loading || countdown > 0) ? "rgba(255, 255, 255, 0.3)" : "rgba(56, 189, 248, 0.8)",
            background: "transparent",
            border: "none",
            cursor: (resending || loading || countdown > 0) ? "not-allowed" : "pointer",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {resending ? (
            <>
              <span
                className='button-spinner'
                style={{
                  borderColor: "rgba(56, 189, 248, 0.35)",
                  borderTopColor: "rgba(56, 189, 248, 0.8)",
                }}
              ></span>
              Resending...
            </>
          ) : countdown > 0 ? (
            `Resend code in ${countdown}s`
          ) : (
            "Resend Verification Code"
          )}
        </button>

        <p className='form-note' style={{ margin: 0 }}>
          Ignored verification? You can browse profiles, but you won't be able
          to edit your profile or communicate. <Link to='/'>Go Home</Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyPhone;
