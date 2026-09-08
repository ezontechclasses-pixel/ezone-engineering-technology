import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

const LESSON_TYPES = [
  { value: 'theory',     label: 'Theory',              bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'practical',  label: 'Practical',           bg: '#dcfce7', color: '#15803d' },
  { value: 'drawing',    label: 'Engineering Drawing', bg: '#fef9c3', color: '#854d0e' },
  { value: 'pastpaper',  label: 'Past Paper',          bg: '#fee2e2', color: '#b91c1c' },
  { value: 'modelpaper', label: 'Model Paper',         bg: '#ede9fe', color: '#6d28d9' },
  { value: 'revision',   label: 'Revision',            bg: '#ffedd5', color: '#c2410c' },
];

export default function AdminLessons() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'theory',
    videoUrl: '',
    notesUrl: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [unitRes, lessonsRes] = await Promise.all([
        adminApi.get(`/units/${unitId}`),
        adminApi.get(`/lessons?unitId=${unitId}`),
      ]);
      const unitData = unitRes.data.data;
      setUnit(unitData);
      setLessons(lessonsRes.data.data || []);

      // If unit has courseId populated or string, fetch course details for breadcrumbs
      const cId = unitData?.courseId?._id || unitData?.courseId;
      if (cId) {
        try {
          const courseRes = await adminApi.get(`/courses/${cId}`);
          setCourse(courseRes.data.data);
        } catch {
          // Non-blocking if course fetch fails
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNewForm = () => {
    setEditId(null);
    setForm({
      title: '',
      type: 'theory',
      videoUrl: '',
      notesUrl: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditForm = (lesson) => {
    setEditId(lesson._id);
    setForm({
      title: lesson.title || '',
      type: lesson.type || 'theory',
      videoUrl: lesson.videoUrl || '',
      notesUrl: lesson.notesUrl || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Lesson title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        videoUrl: form.videoUrl.trim() || null,
        notesUrl: form.notesUrl.trim() || null,
        unitId,
      };

      if (editId) {
        await adminApi.put(`/lessons/${editId}`, payload);
      } else {
        await adminApi.post('/lessons', payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      alert('Failed to save lesson: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm(`Delete lesson "${lesson.title}"?\n\nThis cannot be undone.`)) return;

    try {
      await adminApi.delete(`/lessons/${lesson._id}`);
      setLessons((prev) => prev.filter((l) => l._id !== lesson._id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  const courseId = course?._id || unit?.courseId?._id || unit?.courseId;

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 768px) {
          .admin-main {
            padding: 1.5rem 1rem !important;
          }
          .admin-form-grid2 {
            grid-template-columns: 1fr !important;
          }
          .admin-toolbar {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <AdminHeader
        title={unit ? `${unit.title} — Lessons` : 'Manage Lessons'}
        onLogout={handleLogout}
      />

      <main style={s.main} className="admin-main">
        {/* Navigation Breadcrumbs */}
        <div style={s.breadcrumb}>
          <Link to="/admin/courses" style={s.crumbLink}>
            Courses
          </Link>
          <span style={s.crumbDivider}>/</span>
          {courseId && (
            <>
              <Link to={`/admin/courses/${courseId}/units`} style={s.crumbLink}>
                {course?.title || 'Units'}
              </Link>
              <span style={s.crumbDivider}>/</span>
            </>
          )}
          <span style={s.crumbCurrent}>{unit?.title || 'Unit Lessons'}</span>
        </div>

        {/* Toolbar */}
        <div style={s.toolbar} className="admin-toolbar">
          <div>
            <h1 style={s.h1}>
              Lessons for {unit ? `"${unit.title}"` : 'Unit'}{' '}
              {lessons.length > 0 && <span style={s.countBadge}>{lessons.length}</span>}
            </h1>
            <p style={s.sub}>
              {course ? `${course.title} (Grade ${course.grade}) &bull; ` : ''}
              {lessons.length} lesson{lessons.length === 1 ? '' : 's'} total
            </p>
          </div>
          <button onClick={openNewForm} style={s.createBtn} id="add-lesson-btn">
            + Add Lesson
          </button>
        </div>

        {/* Inline Create / Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={s.formBox} id="lesson-form">
            <div style={s.formHeader}>
              <h3 style={s.formTitle}>{editId ? 'Edit Lesson' : 'Create New Lesson'}</h3>
              <span style={s.formHint}>Fields marked with * are required</span>
            </div>

            <div style={s.grid2} className="admin-form-grid2">
              <div>
                <label style={s.label}>Lesson Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Lesson 01: Stress, Strain & Elastic Modulus"
                  style={s.input}
                  required
                  id="lesson-title-input"
                />
              </div>

              <div>
                <label style={s.label}>Lesson Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={s.input}
                  id="lesson-type-select"
                >
                  {LESSON_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={s.grid2} className="admin-form-grid2">
              <div>
                <label style={s.label}>
                  Video URL <span style={s.hint}>(YouTube or Google Drive link)</span>
                </label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or Drive link"
                  style={s.input}
                  id="lesson-video-input"
                />
              </div>

              <div>
                <label style={s.label}>
                  Notes / Materials URL <span style={s.hint}>(Drive PDF or shared doc)</span>
                </label>
                <input
                  type="url"
                  value={form.notesUrl}
                  onChange={(e) => setForm({ ...form, notesUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/... or PDF link"
                  style={s.input}
                  id="lesson-notes-input"
                />
              </div>
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={saving} style={s.saveBtn} id="save-lesson-btn">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Lesson'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={s.cancelBtn}
                id="cancel-lesson-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* States */}
        {loading && <p style={s.status}>Loading unit lessons…</p>}
        {!loading && error && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}

        {!loading && !error && lessons.length === 0 && (
          <div style={s.emptyBox}>
            <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '1.05rem' }}>
              No lessons have been added to this unit yet.
            </p>
            <button onClick={openNewForm} style={s.createBtn}>
              + Add first lesson
            </button>
          </div>
        )}

        {/* Lessons Table */}
        {!loading && lessons.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Lesson Title</th>
                  <th style={{ ...s.th, width: 140 }}>Type</th>
                  <th style={{ ...s.th, width: 140, textAlign: 'center' }}>Has Video?</th>
                  <th style={{ ...s.th, width: 140, textAlign: 'center' }}>Has Notes?</th>
                  <th style={{ ...s.th, width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const typeMeta =
                    LESSON_TYPES.find((t) => t.value === lesson.type) || {
                      label: lesson.type,
                      bg: '#f3f4f6',
                      color: '#374151',
                    };

                  return (
                    <tr key={lesson._id} style={s.tr}>
                      <td style={s.td}>
                        <span style={s.title}>{lesson.title}</span>
                      </td>

                      <td style={s.td}>
                        <span
                          style={{
                            ...s.typeBadge,
                            background: typeMeta.bg,
                            color: typeMeta.color,
                          }}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {lesson.videoUrl ? (
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={s.hasLink}
                            title="Open video link"
                          >
                            ▶ Watch ↗
                          </a>
                        ) : (
                          <span style={s.noneText}>—</span>
                        )}
                      </td>

                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {lesson.notesUrl ? (
                          <a
                            href={lesson.notesUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={s.hasLink}
                            title="Open notes link"
                          >
                            📄 View ↗
                          </a>
                        ) : (
                          <span style={s.noneText}>—</span>
                        )}
                      </td>

                      <td style={s.td}>
                        <div style={s.actions}>
                          <button
                            onClick={() => openEditForm(lesson)}
                            style={s.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lesson)}
                            style={s.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f5f6fa' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 5rem' },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    flexWrap: 'wrap',
  },
  crumbLink: {
    color: '#4338ca',
    textDecoration: 'none',
    fontWeight: 700,
  },
  crumbDivider: { color: '#bbb' },
  crumbCurrent: { color: '#666', fontWeight: 500 },

  toolbar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  h1: {
    margin: 0,
    fontSize: '1.45rem',
    fontWeight: 800,
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  sub: { margin: '0.3rem 0 0', color: '#666', fontSize: '0.88rem' },
  countBadge: {
    background: '#e0e7ff',
    color: '#4338ca',
    fontSize: '0.82rem',
    padding: '0.15rem 0.6rem',
    borderRadius: '12px',
    fontWeight: 700,
  },
  createBtn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },

  formBox: {
    background: '#fff',
    border: '1px solid #e0e7ff',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  formTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e' },
  formHint: { fontSize: '0.78rem', color: '#888' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: '#444',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  hint: { textTransform: 'none', fontWeight: 400, color: '#888' },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.92rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#fafbfc',
  },
  btnRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' },
  saveBtn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.6rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #ddd',
    color: '#555',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 600,
  },

  status: { textAlign: 'center', color: '#888', padding: '3rem 0' },
  emptyBox: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '3.5rem 1.5rem',
    textAlign: 'center',
  },

  tableWrap: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '0.85rem 1rem',
    background: '#f8f9ff',
    textAlign: 'left',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#666',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '0.9rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },

  title: { fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' },
  typeBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.65rem',
    borderRadius: '14px',
    fontSize: '0.76rem',
    fontWeight: 700,
  },

  hasLink: {
    display: 'inline-block',
    color: '#2563eb',
    fontWeight: 600,
    fontSize: '0.84rem',
    textDecoration: 'none',
    background: '#eff6ff',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  noneText: { color: '#bbb', fontSize: '0.9rem' },

  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  editBtn: {
    padding: '0.4rem 0.75rem',
    background: '#f0f4ff',
    color: '#1d4ed8',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.83rem',
  },
  deleteBtn: {
    padding: '0.4rem 0.75rem',
    background: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.83rem',
  },
};
