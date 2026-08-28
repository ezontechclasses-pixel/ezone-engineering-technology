import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ADMIN_TOKEN_KEY = 'adminToken';
const OLD_SECRET_KEY  = 'ezone_admin_secret';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/admin/login`, { email, password });
      if (data.success && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        localStorage.removeItem(OLD_SECRET_KEY);
        navigate(from, { replace: true });
      } else {
        setError('Login failed: Invalid server response.');
      }
    } catch (err) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setError(err.response?.data?.message || 'Invalid admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>🔐 Admin Portal</h1>
        <p style={s.sub}>Enter administrator credentials to access the control panel.</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div>
            <label style={s.label} htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              autoComplete="email"
              style={s.input}
              placeholder="admin@ezone.lk"
            />
          </div>

          <div>
            <label style={s.label} htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              autoComplete="current-password"
              style={s.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading || !email || !password} style={s.btn}>
            {loading ? 'Authenticating…' : 'Login to Admin Panel →'}
          </button>
        </form>
      </div>
    </main>
  );
}

const s = {
  page:  { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '1rem' },
  card:  { background: '#fff', borderRadius: '14px', padding: '2.5rem', maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e' },
  sub:   { color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' },
  error: { background: '#fff0f0', color: '#c0392b', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 },
  form:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#333', marginBottom: '0.3rem' },
  input: { padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn:   { marginTop: '0.35rem', padding: '0.75rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
};
