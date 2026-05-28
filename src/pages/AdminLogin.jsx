import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function AdminLogin() {
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await adminLogin(form);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin login details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='form-card admin-login-card'>
      <ScrollToTop />
      <span className='form-eyebrow'>Admin access</span>

      <h1>Admin login</h1>

      <p>Secure dashboard access for administrators.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
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
            required
            disabled={loading}
          />
        </label>

        {error && <p className='form-error'>{error}</p>}

        <button type='submit' className='button' disabled={loading}>
          {loading ? (
            <>
              <span className='button-spinner'></span>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </section>
  );
}

export default AdminLogin;
