import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function AdminLogin() {
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await adminLogin(form);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin login details.");
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
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type='password'
            required
          />
        </label>

        {error && <p className='form-error'>{error}</p>}

        <button type='submit' className='button'>
          Sign in
        </button>
      </form>
    </section>
  );
}

export default AdminLogin;
