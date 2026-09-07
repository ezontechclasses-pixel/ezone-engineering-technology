import { Link, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin/courses',      icon: '📚', label: 'Manage Courses',       ready: true },
  { to: '/admin/quizzes',      icon: '📝', label: 'Manage Quizzes',       ready: true },
  { to: '/admin/materials',    icon: '📁', label: 'Manage Materials',     ready: true },
  { to: '/admin/classroom',    icon: '🖥️', label: 'Manage Classroom',     ready: true },
  { to: '/admin/students',     icon: '👥', label: 'Manage Students',       ready: true },
  { to: '/admin/testimonials', icon: '💬', label: 'Manage Testimonials',   ready: true },
  { to: '/admin/content',      icon: '✏️', label: 'Manage Site Content',   ready: true },
];

export default function AdminDashboard() {
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  return (
    <div style={s.page}>
      <AdminHeader title="Admin Dashboard" onLogout={handleLogout} />

      <main style={s.main}>
        <p style={s.intro}>Select a section to manage:</p>
        <div style={s.grid}>
          {NAV_ITEMS.map((item) =>
            item.ready ? (
              <Link key={item.to} to={item.to} style={s.card}>
                <span style={s.cardIcon}>{item.icon}</span>
                <span style={s.cardLabel}>{item.label}</span>
              </Link>
            ) : (
              <div key={item.to} style={{ ...s.card, ...s.cardDisabled }}>
                <span style={s.cardIcon}>{item.icon}</span>
                <span style={s.cardLabel}>{item.label}</span>
                <span style={s.soon}>Coming soon</span>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

/* Shared admin header — used across all admin pages */
export function AdminHeader({ title, onLogout }) {
  return (
    <header style={s.header}>
      <div style={s.headerInner}>
        <div style={s.headerLeft}>
          <Link to="/admin" style={s.headerBrand}>⚙️ Ezone Admin</Link>
          {title && <span style={s.headerTitle}>/ {title}</span>}
        </div>
        {onLogout && (
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        )}
      </div>
    </header>
  );
}

const s = {
  page:   { minHeight: '100vh', background: '#f5f6fa' },
  header: { background: '#1a1a2e', padding: '0 1.5rem' },
  headerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  headerBrand: { color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: '1rem' },
  headerTitle: { color: '#aaa', fontSize: '0.9rem' },
  logoutBtn:   { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#ccc', padding: '0.3rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  main:  { maxWidth: 900, margin: '2.5rem auto', padding: '0 1.5rem' },
  intro: { color: '#555', marginBottom: '1.5rem' },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' },
  card:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '2.25rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none', color: '#1a1a2e', cursor: 'pointer' },
  cardDisabled: { opacity: 0.55, cursor: 'not-allowed' },
  cardIcon:  { fontSize: '2.25rem' },
  cardLabel: { fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' },
  soon:      { fontSize: '0.72rem', color: '#aaa', background: '#f3f4f6', padding: '0.15rem 0.5rem', borderRadius: '10px' },
};
