import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const GRADES = [
  { value: '',   label: 'All Grades' },
  { value: '12', label: 'Grade 12'   },
  { value: '13', label: 'Grade 13'   },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [grade, setGrade]     = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = grade ? { grade } : {};
        const { data } = await api.get('/courses', { params });
        if (!cancelled) setCourses(data.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [grade]);

  return (
    <div style={s.page}>

      {/* Page header */}
      <div style={s.pageHeader}>
        <div style={s.wrap}>
          <h1 style={s.pageTitle}>Courses</h1>
          <p style={s.pageSub}>A/L Engineering Technology — Grade 12 &amp; Grade 13</p>

          {/* Grade filter tabs */}
          <div style={s.tabs} role="tablist">
            {GRADES.map((g) => (
              <button
                key={g.value}
                role="tab"
                aria-selected={grade === g.value}
                onClick={() => setGrade(g.value)}
                style={grade === g.value ? s.tabActive : s.tab}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        <div style={s.wrap}>

          {/* Loading */}
          {loading && (
            <div style={s.stateBox}>
              <span style={s.stateIcon}>⏳</span>
              <p>Loading courses…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ ...s.stateBox, color: '#e94560' }}>
              <span style={s.stateIcon}>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && courses.length === 0 && (
            <div style={s.stateBox}>
              <span style={s.stateIcon}>📭</span>
              <p>No courses found. Check back soon!</p>
            </div>
          )}

          {/* Course grid */}
          {!loading && !error && courses.length > 0 && (
            <div style={s.grid}>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Course Card ────────────────────────────────────────────────────────── */
function CourseCard({ course }) {
  const unitCount   = course.units?.length ?? 0;
  const lessonCount = course.units?.reduce((acc, u) => acc + (u.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div style={s.card}>
      {/* Grade badge */}
      <div style={s.cardTop}>
        <span style={course.grade === '12' ? s.badge12 : s.badge13}>
          Grade {course.grade}
        </span>
      </div>

      {/* Content */}
      <div style={s.cardBody}>
        <h2 style={s.cardTitle}>{course.title}</h2>
        <p style={s.cardDesc}>
          {course.description || 'Full Engineering Technology course covering the national A/L syllabus.'}
        </p>

        {/* Meta */}
        <div style={s.cardMeta}>
          <span style={s.metaItem}>📦 {unitCount} {unitCount === 1 ? 'Unit' : 'Units'}</span>
          {lessonCount > 0 && (
            <span style={s.metaItem}>🎬 {lessonCount} Lessons</span>
          )}
        </div>
      </div>

      {/* Action */}
      <div style={s.cardFooter}>
        <Link to={`/courses/${course._id}`} style={s.viewBtn}>
          View Units →
        </Link>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  page:       { minHeight: '80vh', background: '#f8f9ff' },
  wrap:       { maxWidth: 1060, margin: '0 auto', padding: '0 1.5rem' },

  /* Page header */
  pageHeader: { background: '#1a1a2e', padding: '2.5rem 1.5rem 0', color: '#fff' },
  pageTitle:  { fontSize: '2rem', fontWeight: 900, margin: '0 0 0.3rem', color: '#fff' },
  pageSub:    { color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' },

  /* Tabs */
  tabs: { display: 'flex', gap: '0.25rem', paddingTop: '0.25rem' },
  tab: {
    padding: '0.6rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    borderBottom: '3px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
  },
  tabActive: {
    padding: '0.6rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
    borderBottom: '3px solid #e94560',
    transition: 'color 0.2s, border-color 0.2s',
  },

  /* Body */
  body: { padding: '2.5rem 1.5rem' },

  /* State boxes */
  stateBox:  { textAlign: 'center', padding: '4rem 1rem', color: '#888' },
  stateIcon: { display: 'block', fontSize: '3rem', marginBottom: '1rem' },

  /* Grid */
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },

  /* Card */
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTop:   { padding: '1.25rem 1.5rem 0' },
  cardBody:  { padding: '1rem 1.5rem', flex: 1 },
  cardFooter:{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0' },
  cardTitle: { fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', margin: '0.5rem 0 0.5rem' },
  cardDesc:  { color: '#666', fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 1rem' },

  /* Meta chips */
  cardMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  metaItem: { fontSize: '0.82rem', color: '#888', fontWeight: 600 },

  /* Badges */
  badge12: { display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 },
  badge13: { display: 'inline-block', background: '#fce7f3', color: '#9d174d', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 },

  /* View button */
  viewBtn: {
    display: 'inline-block',
    background: '#1a1a2e',
    color: '#fff',
    padding: '0.55rem 1.25rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.9rem',
    transition: 'background 0.2s',
  },
};
