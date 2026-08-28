import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpeg';

export default function Navbar() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>
          <img src={logoImg} alt="Ezone Logo" style={styles.logoImg} />
          <span>Ezone</span>
        </Link>
      </div>

      <ul style={styles.links}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
        <li><Link to="/courses" style={styles.link}>Courses</Link></li>

        {student ? (
          <>
            <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
            <li><Link to="/classroom" style={styles.link}>Classroom</Link></li>
            <li><Link to="/notes" style={styles.link}>Notes</Link></li>
            <li><Link to="/results" style={styles.link}>Results</Link></li>
            <li>
              <span style={styles.greeting}>Hi, {student.name.split(' ')[0]}</span>
            </li>
            <li>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" style={styles.link}>Login</Link></li>
            <li>
              <Link to="/register" style={{ ...styles.link, ...styles.registerBtn }}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 2rem',
    background: '#1a1a2e',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  brand: { fontSize: '1.3rem', fontWeight: 700 },
  brandLink: { color: '#e94560', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  logoImg: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  link: { color: '#ccc', textDecoration: 'none', fontSize: '0.95rem' },
  greeting: { color: '#e94560', fontWeight: 600, fontSize: '0.9rem' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #e94560',
    color: '#e94560',
    padding: '0.3rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  registerBtn: {
    background: '#e94560',
    color: '#fff',
    padding: '0.3rem 0.9rem',
    borderRadius: '6px',
    fontWeight: 600,
  },
};
