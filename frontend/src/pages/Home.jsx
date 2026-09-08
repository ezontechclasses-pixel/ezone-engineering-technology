import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import dpImg from '../assets/dp.jpeg';

const SUBJECTS = [
  { icon: '📖', label: 'Theory Classes',        desc: 'In-depth coverage of all theory units in the A/L syllabus.' },
  { icon: '🔧', label: 'Practical Sessions',    desc: 'Hands-on practical work explained step by step.' },
  { icon: '✏️', label: 'Drawing Classes',       desc: 'Engineering drawing techniques and practice sheets.' },
  { icon: '📝', label: 'Past Paper Discussion', desc: 'Detailed walkthrough of past A/L exam papers.' },
  { icon: '📄', label: 'Model Papers',          desc: 'Exam-focused model papers with full solutions.' },
  { icon: '🔁', label: 'Revision Classes',      desc: 'Targeted revision sessions before exams.' },
];

const DEFAULT_CONTENT = {
  instructor: {
    name: 'S. Vithurshan',
    qualification: 'BET (Hons)(R), University of Sri Jayewardenepura',
    photoUrl: '',
    bio: 'Experienced A/L Engineering Technology instructor dedicated to helping students achieve top results in Grade 12 & Grade 13.',
  },
  contact: {
    whatsappGroupUrl: 'https://chat.whatsapp.com/BD8urlmHPg9GW6LcdJEUvL?s=sh&p=a&ilr=4',
    youtubeUrl: 'https://www.youtube.com/@E-ZONEonlineclasses',
    email: 'ezontechclasses@gmail.com',
    phone: '0770406268',
  },
  freeTrial: {
    title: 'Free Trial & Demo Class',
    description: 'Join our WhatsApp group today to get access to free live trial sessions and model paper discussions.',
  },
};

export default function Home() {
  const [content,      setContent]      = useState(DEFAULT_CONTENT);
  const [testimonials, setTestimonials] = useState([]);
  const [stats,        setStats]        = useState({
    studentsEnrolled: 0,
    totalLessons: 0,
    passRate: 0,
    abResults: 0,
  });

  useEffect(() => {
    // Fetch site content
    api.get('/site-content')
      .then((res) => {
        if (res.data?.data) {
          setContent((prev) => ({
            instructor: { ...prev.instructor, ...res.data.data.instructor },
            contact:    { ...prev.contact,    ...res.data.data.contact },
            freeTrial:  { ...prev.freeTrial,  ...res.data.data.freeTrial },
          }));
        }
      })
      .catch(() => {});

    // Fetch live public stats
    api.get('/stats/public')
      .then((res) => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {});

    // Fetch testimonials
    api.get('/testimonials')
      .then((res) => {
        if (res.data?.data) {
          setTestimonials(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const { instructor, contact, freeTrial } = content;
  const waUrl = contact.whatsappGroupUrl || DEFAULT_CONTENT.contact.whatsappGroupUrl;
  const ytUrl = contact.youtubeUrl || DEFAULT_CONTENT.contact.youtubeUrl;

  const STAT_ITEMS = [
    { value: `${stats.studentsEnrolled || 0}+`, label: 'Students Enrolled' },
    { value: `${stats.passRate || 0}%`,          label: 'Pass Rate' },
    { value: `${stats.totalLessons || 0}+`,     label: 'Lessons Available' },
    { value: `${stats.abResults || 0}`,         label: 'A/B Results' },
  ];

  return (
    <div className="home-page">
      <style>{`
        @media (max-width: 768px) {
          .home-hero {
            padding: 3.5rem 1rem !important;
          }
          .home-hero-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 2rem !important;
          }
          .home-hero-sub {
            margin: 0 auto 1.5rem !important;
          }
          .home-hero-card {
            width: 100% !important;
            max-width: 300px !important;
            padding: 1.5rem !important;
          }
          .home-stats-bar {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .home-stat-item {
            padding: 1rem 0.5rem !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.15) !important;
          }
          .home-instructor-card {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 1.75rem 1.25rem !important;
          }
          .home-btn-row {
            justify-content: center !important;
          }
          .home-trial-inner {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
            gap: 1.5rem !important;
          }
          .home-grid3 {
            grid-template-columns: 1fr !important;
          }
          .home-section {
            padding: 2.75rem 1.25rem !important;
          }
        }
        @media (max-width: 480px) {
          .home-hero {
            padding: 2.75rem 0.75rem !important;
          }
          .home-hero-title {
            font-size: 1.85rem !important;
          }
          .home-btn-row {
            flex-direction: column !important;
            width: 100% !important;
          }
          .home-btn-row a {
            width: 100% !important;
            text-align: center !important;
          }
          .home-stat-val {
            font-size: 1.6rem !important;
          }
          .home-section {
            padding: 2.25rem 0.75rem !important;
          }
        }
      `}</style>

      {/* Hero */}
      <section style={s.hero} className="home-hero">
        <div style={s.heroInner} className="home-hero-inner">
          <div style={s.heroText}>
            <span style={s.heroBadge}>🎓 A/L Engineering Technology</span>
            <h1 style={s.heroTitle} className="home-hero-title">E-Zone Engineering<br />Technology</h1>
            <p style={s.heroSub} className="home-hero-sub">
              Online classes for Grade 12 &amp; Grade 13 — Theory, Practical,
              Drawing, Past Papers &amp; more.
            </p>
            <div style={s.row} className="home-btn-row">
              <Link to="/register" style={s.btnPrimary}>Join Now — It's Free</Link>
              <Link to="/courses"  style={s.btnOutline}>Browse Courses</Link>
            </div>
          </div>
          <div style={s.heroCard} className="home-hero-card">
            <span style={{ fontSize: '3.5rem' }}>📐</span>
            <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: '#fff' }}>Grade 12 &amp; 13</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Sri Lanka A/L</p>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <div style={s.statsBar} className="home-stats-bar">
        {STAT_ITEMS.map((st) => (
          <div key={st.label} style={s.statItem} className="home-stat-item">
            <span style={s.statVal} className="home-stat-val">{st.value}</span>
            <span style={s.statLbl}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* Instructor */}
      <section style={s.section} className="home-section">
        <div style={s.wrap} className="home-wrap">
          <p style={s.eyebrow}>Your Instructor</p>
          <div style={s.instructorCard} className="home-instructor-card">
            <div style={s.avatar}>
              <img
                src={instructor.photoUrl || dpImg}
                alt={instructor.name}
                style={s.avatarImg}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={s.h2}>{instructor.name}</h2>
              <p style={s.role}>{instructor.qualification}</p>
              <p style={s.body}>{instructor.bio}</p>
              <div style={s.row} className="home-btn-row">
                <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnGreen}>
                  💬 Join WhatsApp Group
                </a>
                {ytUrl && (
                  <a href={ytUrl} target="_blank" rel="noreferrer" style={s.btnRed}>
                    ▶ YouTube Channel
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section style={{ ...s.section, background: '#f8f9ff' }} className="home-section">
        <div style={s.wrap} className="home-wrap">
          <p style={s.eyebrow}>What We Cover</p>
          <h2 style={s.h2}>Complete A/L ET Programme</h2>
          <p style={{ ...s.body, marginBottom: '2rem' }}>
            Everything you need to excel in your A/L Engineering Technology exam.
          </p>
          <div style={s.grid3} className="home-grid3">
            {SUBJECTS.map((sub) => (
              <div key={sub.label} style={s.subCard}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>{sub.icon}</span>
                <h3 style={{ fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.4rem' }}>{sub.label}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA */}
      <section style={s.darkSection} className="home-section">
        <div style={{ ...s.wrap, ...s.trialInner }} className="home-trial-inner">
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              🎁 {freeTrial.title || 'Free Trial & Demo Class'}
            </h2>
            <p style={{ color: '#aaa', margin: 0 }}>
              {freeTrial.description || 'Join our WhatsApp group today to get access to free trial sessions.'}
            </p>
          </div>
          <div style={s.row} className="home-btn-row">
            <Link to="/register" style={s.btnPrimary}>Start Free Trial</Link>
            <a href={waUrl} target="_blank" rel="noreferrer" style={s.btnGreen}>📲 Join WhatsApp</a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={s.section} className="home-section">
        <div style={s.wrap} className="home-wrap">
          <p style={s.eyebrow}>Student Success</p>
          <h2 style={s.h2}>Results Speak for Themselves</h2>

          {testimonials.length === 0 ? (
            <div style={s.emptyTestimonials}>
              <span style={{ fontSize: '2.5rem' }}>🌟</span>
              <p style={{ color: '#666', margin: '0.75rem 0 0', fontWeight: 600 }}>
                Be one of our first success stories — testimonials will appear here as students share their results.
              </p>
            </div>
          ) : (
            <div style={s.grid3} className="home-grid3">
              {testimonials.map((t) => (
                <div key={t._id || t.name} style={s.testimonialCard}>
                  <p style={{ color: '#333', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    "{t.quote}"
                  </p>
                  <div style={s.row}>
                    <div style={s.tAvatar}>{t.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{t.name}</p>
                      {t.gradeYear && (
                        <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>{t.gradeYear}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ ...s.section, background: '#f8f9ff', textAlign: 'center' }} className="home-section">
        <div style={s.wrap} className="home-wrap">
          <h2 style={s.h2}>Ready to ace your A/L Engineering Technology?</h2>
          <p style={{ ...s.body, marginBottom: '1.75rem' }}>
            Join hundreds of students already learning with E-Zone.
          </p>
          <Link to="/register" style={s.btnPrimary}>Register Now — Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} E-Zone Engineering Technology. All rights reserved.</p>
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {contact.phone && <span style={{ color: '#aaa' }}>📞 {contact.phone}</span>}
          {contact.email && <span style={{ color: '#aaa' }}>✉️ {contact.email}</span>}
          <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>
            💬 WhatsApp Group
          </a>
          {ytUrl && (
            <a href={ytUrl} target="_blank" rel="noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 600 }}>
              ▶ YouTube Channel
            </a>
          )}
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={waUrl} target="_blank" rel="noreferrer" style={s.waFloat} title="Join WhatsApp Group">
        <span style={{ fontSize: '1.5rem' }}>💬</span>
      </a>
    </div>
  );
}

const s = {
  wrap:       { maxWidth: 1060, margin: '0 auto', padding: '0 1.5rem' },
  row:        { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  section:    { padding: '4rem 1.5rem' },
  darkSection:{ padding: '3rem 1.5rem', background: '#1a1a2e' },
  eyebrow:    { color: '#e94560', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' },
  h2:         { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.75rem' },
  body:       { color: '#555', lineHeight: 1.75, margin: '0 0 1rem' },
  role:       { color: '#e94560', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' },
  grid3:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' },

  /* Hero */
  hero:      { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '5rem 1.5rem', display: 'flex', justifyContent: 'center' },
  heroInner: { maxWidth: 1060, width: '100%', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' },
  heroText:  { flex: 1 },
  heroBadge: { display: 'inline-block', background: '#e94560', color: '#fff', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', margin: '0 0 1rem', lineHeight: 1.2 },
  heroSub:   { fontSize: '1.1rem', color: '#aaa', maxWidth: 520, marginBottom: '2rem', lineHeight: 1.7 },
  heroCard:  { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '2rem 2.5rem', textAlign: 'center', flexShrink: 0 },

  /* Stats */
  statsBar: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', background: '#e94560' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 2.5rem', borderRight: '1px solid rgba(255,255,255,0.2)' },
  statVal:  { fontSize: '2rem', fontWeight: 900, color: '#fff' },
  statLbl:  { fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.2rem', textAlign: 'center' },

  /* Instructor */
  instructorCard: { display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2.5rem' },
  avatar:         { width: 110, height: 110, borderRadius: '50%', background: '#f0f4ff', overflow: 'hidden', flexShrink: 0, border: '3px solid #e94560' },
  avatarImg:      { width: '100%', height: '100%', objectFit: 'cover' },

  /* Subjects */
  subCard:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' },

  /* Trial */
  trialInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' },

  /* Testimonials */
  testimonialCard:  { background: '#f8f9ff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.75rem' },
  tAvatar:          { width: 38, height: 38, borderRadius: '50%', background: '#e94560', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  emptyTestimonials:{ background: '#f8f9ff', border: '2px dashed #e5e7eb', borderRadius: '14px', padding: '3rem 1.5rem', textAlign: 'center' },

  /* Footer */
  footer: { background: '#1a1a2e', color: '#888', textAlign: 'center', padding: '2rem 1.5rem', fontSize: '0.9rem' },

  /* Floating WA */
  waFloat: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999, width: 56, height: 56, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,211,102,0.4)', textDecoration: 'none' },

  /* Buttons */
  btnPrimary: { display: 'inline-block', background: '#e94560', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' },
  btnOutline: { display: 'inline-block', border: '2px solid rgba(255,255,255,0.4)', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' },
  btnGreen:   { display: 'inline-block', background: '#25D366', color: '#fff', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' },
  btnRed:     { display: 'inline-block', background: '#ff0000', color: '#fff', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' },
};

