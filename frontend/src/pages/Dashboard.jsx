import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { student } = useAuth();

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Student Dashboard</h1>
      <p style={styles.sub}>Welcome back, <strong>{student?.name}</strong>! (Grade {student?.grade})</p>

      <div style={styles.grid}>
        <Link to="/classroom" style={styles.card}>
          <span style={styles.icon}>🖥️</span>
          <span style={styles.cardLabel}>Online Classroom</span>
        </Link>
        <Link to="/notes" style={styles.card}>
          <span style={styles.icon}>📚</span>
          <span style={styles.cardLabel}>Notes &amp; Materials</span>
        </Link>
        <Link to="/courses" style={styles.card}>
          <span style={styles.icon}>🎓</span>
          <span style={styles.cardLabel}>My Courses</span>
        </Link>
        <Link to="/results" style={styles.card}>
          <span style={styles.icon}>🏆</span>
          <span style={styles.cardLabel}>Results &amp; Achievements</span>
        </Link>
      </div>
    </main>
  );
}

const styles = {
  page: { maxWidth: 900, margin: '2.5rem auto', padding: '0 1.5rem' },
  title: { fontSize: '2rem', fontWeight: 800, color: '#1a1a2e' },
  sub: { color: '#555', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', padding: '2rem 1rem', borderRadius: '14px',
    background: '#fff', border: '1px solid #e5e7eb', textDecoration: 'none', color: '#1a1a2e',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s',
  },
  icon: { fontSize: '2.5rem' },
  cardLabel: { fontWeight: 700, fontSize: '1rem', textAlign: 'center' },
};
