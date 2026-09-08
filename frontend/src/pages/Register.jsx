import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', grade: '12' });

  const handleChange = (e) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch {
      // error is set in AuthContext
    }
  };

  return (
    <main style={styles.page}>
      <style>{`
        @media (max-width: 480px) {
          .auth-card {
            padding: 1.75rem 1.25rem !important;
          }
        }
      `}</style>
      <div style={styles.card} className="auth-card">
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.sub}>Join Ezone Engineering Technology 🚀</p>

        {error && <p style={styles.errorMsg}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            id="reg-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Your full name"
          />

          <label style={styles.label}>Email</label>
          <input
            id="reg-email"
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
            id="reg-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={styles.input}
            placeholder="Min 6 characters"
          />

          <label style={styles.label}>Grade</label>
          <select
            id="reg-grade"
            name="grade"
            value={form.grade}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="12">Grade 12</option>
            <option value="13">Grade 13</option>
          </select>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.footerLink}>Login</Link>
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
