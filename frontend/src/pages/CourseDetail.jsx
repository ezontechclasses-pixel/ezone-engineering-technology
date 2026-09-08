import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <p style={styles.status}>Loading course…</p>;
  if (error) return <p style={{ ...styles.status, color: '#e94560' }}>Error: {error}</p>;
  if (!course) return <p style={styles.status}>Course not found.</p>;

  return (
    <main style={styles.page} className="course-detail-page">
      <style>{`
        @media (max-width: 768px) {
          .course-detail-page {
            padding: 0 1rem !important;
            margin: 1.5rem auto !important;
          }
          .course-detail-title {
            font-size: 1.5rem !important;
          }
          .course-lesson-item {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>

      <Link to="/courses" style={styles.back}>← Back to Courses</Link>

      <div style={styles.header}>
        <span style={styles.badge}>Grade {course.grade}</span>
        <h1 style={styles.title} className="course-detail-title">{course.title}</h1>
        <p style={styles.desc}>{course.description}</p>
      </div>

      <h2 style={styles.sectionTitle}>Units</h2>

      {course.units && course.units.length === 0 && (
        <p style={styles.empty}>No units available yet.</p>
      )}

      {course.units?.map((unit, idx) => (
        <div key={unit._id} style={styles.unit}>
          <h3 style={styles.unitTitle}>Unit {idx + 1}: {unit.title}</h3>

          {unit.lessons && unit.lessons.length > 0 ? (
            <ul style={styles.lessons}>
              {unit.lessons.map((lesson) => (
                <li key={lesson._id} style={styles.lessonItem} className="course-lesson-item">
                  <span style={{ ...styles.typeTag, ...typeColor(lesson.type) }}>
                    {lesson.type}
                  </span>
                  <span>{lesson.title}</span>
                  {lesson.videoUrl && (
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={styles.lessonLink}>
                      ▶ Watch
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.empty}>No lessons added yet.</p>
          )}
        </div>
      ))}
    </main>
  );
}

const typeColor = (type) => {
  const map = {
    theory:     { background: '#dbeafe', color: '#1d4ed8' },
    practical:  { background: '#dcfce7', color: '#15803d' },
    drawing:    { background: '#fef9c3', color: '#854d0e' },
    pastpaper:  { background: '#fce7f3', color: '#9d174d' },
    modelpaper: { background: '#ede9fe', color: '#6d28d9' },
    revision:   { background: '#ffedd5', color: '#c2410c' },
  };
  return map[type] || { background: '#f3f4f6', color: '#374151' };
};

const styles = {
  page: { maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' },
  status: { textAlign: 'center', marginTop: '4rem', color: '#888' },
  back: { color: '#e94560', textDecoration: 'none', fontWeight: 600 },
  header: { margin: '1.5rem 0 2rem' },
  badge: {
    background: '#1a1a2e', color: '#fff', fontSize: '0.75rem',
    padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600,
  },
  title: { fontSize: '1.9rem', fontWeight: 800, color: '#1a1a2e', margin: '0.5rem 0' },
  desc: { color: '#555', fontSize: '1rem' },
  sectionTitle: { borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem', color: '#1a1a2e' },
  unit: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '1.25rem', marginBottom: '1rem',
  },
  unitTitle: { margin: '0 0 0.75rem', color: '#1a1a2e', fontWeight: 700 },
  lessons: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  lessonItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' },
  typeTag: { padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' },
  lessonLink: { color: '#e94560', textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' },
  empty: { color: '#aaa', fontSize: '0.9rem', margin: '0.5rem 0' },
};
