import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/profiles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in.');
    }
  };

  return (
    <section className="page-card form-card">
      <h1>Login</h1>
      <p>Sign in to manage your dating profile and messages.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} type="email" required />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="button">Continue</button>
      </form>
      <p className="form-note">
        Need an account? <Link to="/register">Register now</Link>
      </p>
    </section>
  );
}

export default Login;
