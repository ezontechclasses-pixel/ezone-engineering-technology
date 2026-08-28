import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch {
      // error is already set in AuthContext
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <p style={styles.sub}>Welcome back to Ezone 👋</p>

        {error && <p style={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.footerLink}>Register</Link>
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' },
  card: { background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '100%', maxWidth: 420 },
  title: { margin: '0 0 0.25rem', fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e' },
  sub: { color: '#888', marginBottom: '1.5rem' },
  errorMsg: { background: '#fff0f0', color: '#e94560', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontWeight: 600, color: '#333', fontSize: '0.9rem' },
  input: {
    padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: '0.5rem', padding: '0.75rem', background: '#e94560', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
  },
  footer: { marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' },
  footerLink: { color: '#e94560', fontWeight: 700 },
};
