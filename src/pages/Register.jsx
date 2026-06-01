import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";
import Modal from "../components/Modal";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    terms: false,
    privacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.terms || !form.privacy) {
      setShowValidationModal(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/verify-email");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})
            .flat()
            .join(" ") ||
          "Unable to register.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-card form-card'>
      <ScrollToTop />
      <h1>Create account</h1>
      <p>Sign up and submit your profile for review.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type='email'
            required
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type='password'
            minLength={8}
            required
            disabled={loading}
          />
        </label>
        <label>
          Confirm password
          <input
            value={form.password_confirmation}
            onChange={(e) =>
              setForm({ ...form, password_confirmation: e.target.value })
            }
            type='password'
            minLength={8}
            required
            disabled={loading}
          />
        </label>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#9ca3af" }}>
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })}
              disabled={loading}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>
              I agree to the <Link to="/terms" target="_blank" style={{ color: "#ff4f7b", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Terms of Service</Link>
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#9ca3af" }}>
            <input
              type="checkbox"
              checked={form.privacy}
              onChange={(e) => setForm({ ...form, privacy: e.target.checked })}
              disabled={loading}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>
              I agree to the <Link to="/privacy" target="_blank" style={{ color: "#ff4f7b", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
            </span>
          </label>
        </div>

        {error && <p className='form-error'>{error}</p>}
        <button type='submit' className='button' disabled={loading}>
          {loading ? (
            <>
              <span className='button-spinner'></span>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <p className='form-note'>
        Already have an account? <Link to='/login'>Login here</Link>
      </p>
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        type='warning'
        title='Agreement Required'
        message='You must agree to both the Terms of Service and Privacy Policy to create an account.'
        confirmText='OK'
      />
    </section>
  );
}

export default Register;
