import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
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
          />
        </label>
        {error && <p className='form-error'>{error}</p>}
        <button type='submit' className='button'>
          Create account
        </button>
      </form>
      <p className='form-note'>
        Already have an account? <Link to='/login'>Login here</Link>
      </p>
    </section>
  );
}

export default Register;
