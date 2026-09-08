import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpeg';

export default function Navbar() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <style>{`
        .navbar-desktop-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .navbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.6rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          line-height: 1;
          border-radius: 4px;
        }
        .navbar-hamburger:hover {
          color: #e94560;
        }
        .navbar-mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .navbar-desktop-links {
            display: none !important;
          }
          .navbar-hamburger {
            display: block !important;
          }
          .navbar-mobile-menu.open {
            display: flex !important;
            flex-direction: column;
            gap: 0.85rem;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #16213e;
            padding: 1.25rem 1.75rem;
            list-style: none;
            margin: 0;
            box-shadow: 0 8px 20px rgba(0,0,0,0.5);
            border-top: 1px solid rgba(233, 69, 96, 0.2);
            z-index: 99;
          }
        }
      `}</style>

      <nav style={styles.nav}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink} onClick={closeMenu}>
            <img src={logoImg} alt="Ezone Logo" style={styles.logoImg} />
            <span style={styles.brandText}>Ezone</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="navbar-desktop-links">
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

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar-hamburger"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Slide-down Dropdown Menu */}
        <ul className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/courses" style={styles.mobileLink} onClick={closeMenu}>Courses</Link></li>

          {student ? (
            <>
              <li><Link to="/dashboard" style={styles.mobileLink} onClick={closeMenu}>Dashboard</Link></li>
              <li><Link to="/classroom" style={styles.mobileLink} onClick={closeMenu}>Classroom</Link></li>
              <li><Link to="/notes" style={styles.mobileLink} onClick={closeMenu}>Notes</Link></li>
              <li><Link to="/results" style={styles.mobileLink} onClick={closeMenu}>Results</Link></li>
              <li style={{ paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={styles.greeting}>Hi, {student.name.split(' ')[0]}</span>
              </li>
              <li>
                <button onClick={handleLogout} style={{ ...styles.logoutBtn, width: '100%', textAlign: 'center', marginTop: '0.25rem' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" style={styles.mobileLink} onClick={closeMenu}>Login</Link></li>
              <li style={{ marginTop: '0.25rem' }}>
                <Link
                  to="/register"
                  style={{ ...styles.mobileLink, ...styles.registerBtn, display: 'inline-block', textAlign: 'center' }}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: '#1a1a2e',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  brand: {
    flexShrink: 0,
  },
  brandLink: {
    color: '#e94560',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  brandText: {
    fontSize: '1.3rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  logoImg: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s ease',
  },
  mobileLink: {
    color: '#eee',
    textDecoration: 'none',
    fontSize: '1rem',
    display: 'block',
    padding: '0.35rem 0',
  },
  greeting: {
    color: '#e94560',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #e94560',
    color: '#e94560',
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  registerBtn: {
    background: '#e94560',
    color: '#fff',
    padding: '0.35rem 1rem',
    borderRadius: '6px',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
