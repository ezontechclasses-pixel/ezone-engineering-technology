import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    grade: '12',
    description: '',
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get('/courses');
      setCourses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openNewForm = () => {
    setEditId(null);
    setForm({ title: '', grade: '12', description: '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditForm = (course) => {
    setEditId(course._id);
    setForm({
      title: course.title || '',
      grade: course.grade || '12',
      description: course.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Course title is required.');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/courses/${editId}`, form);
      } else {
        await adminApi.post('/courses', form);
      }
      setShowForm(false);
      loadCourses();
    } catch (err) {
      alert('Failed to save course: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    const unitCount = course.units?.length || 0;
    const confirmMsg = unitCount > 0
      ? `Delete course "${course.title}" (Grade ${course.grade})?\n\nWarning: This will also delete ${unitCount} unit(s) and their lessons under this course. This cannot be undone.`
      : `Delete course "${course.title}" (Grade ${course.grade})?\n\nThis cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminApi.delete(`/courses/${course._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  const filteredCourses = gradeFilter
    ? courses.filter((c) => String(c.grade) === String(gradeFilter))
    : courses;

  return (
    <div style={s.page}>
      <AdminHeader title="Manage Courses" onLogout={handleLogout} />

      <main style={s.main}>
        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarLeft}>
            <h1 style={s.h1}>
              Courses {courses.length > 0 && <span style={s.countBadge}>{filteredCourses.length}</span>}
            </h1>
            <p style={s.sub}>Create, edit, and organize A/L Engineering Technology courses</p>
          </div>
          <button onClick={openNewForm} style={s.createBtn} id="add-course-btn">
            + Add Course
          </button>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Filter by Grade:</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              style={s.select}
              id="grade-filter"
            >
              <option value="">All Grades ({courses.length})</option>
              <option value="12">Grade 12 ({courses.filter((c) => c.grade === '12').length})</option>
              <option value="13">Grade 13 ({courses.filter((c) => c.grade === '13').length})</option>
            </select>
          </div>
        </div>

        {/* Inline Create / Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={s.formBox} id="course-form">
            <div style={s.formHeader}>
              <h3 style={s.formTitle}>{editId ? 'Edit Course' : 'Create New Course'}</h3>
              <span style={s.formHint}>All fields marked with * are required</span>
            </div>

            <div style={s.grid2}>
              <div>
                <label style={s.label}>Course Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Civil Technology & Construction"
                  style={s.input}
                  required
                  id="course-title-input"
                />
              </div>

              <div>
                <label style={s.label}>Grade Level *</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  style={s.input}
                  id="course-grade-select"
                >
                  <option value="12">Grade 12</option>
                  <option value="13">Grade 13</option>
                </select>
              </div>
            </div>

            <div>
              <label style={s.label}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Overview of this course curriculum, syllabus modules, or exam targets..."
                rows={3}
                style={{ ...s.input, resize: 'vertical' }}
                id="course-desc-input"
              />
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={saving} style={s.saveBtn} id="save-course-btn">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={s.cancelBtn}
                id="cancel-course-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* States */}
        {loading && <p style={s.status}>Loading courses…</p>}
        {!loading && error && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}

        {!loading && !error && filteredCourses.length === 0 && (
          <div style={s.emptyBox}>
            <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '1.05rem' }}>
              No courses found{gradeFilter ? ` for Grade ${gradeFilter}` : ''}.
            </p>
            <button onClick={openNewForm} style={s.createBtn}>
              + Create your first course
            </button>
          </div>
        )}

        {/* Courses Table */}
        {!loading && filteredCourses.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Course Title</th>
                  <th style={{ ...s.th, width: 110, textAlign: 'center' }}>Grade</th>
                  <th style={{ ...s.th, width: 120, textAlign: 'center' }}>Units</th>
                  <th style={{ ...s.th, width: 280 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => {
                  const unitCount = c.units ? c.units.length : 0;
                  return (
                    <tr key={c._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.title}>{c.title}</div>
                        {c.description && <div style={s.desc}>{c.description}</div>}
                      </td>

                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={c.grade === '12' ? s.grade12Badge : s.grade13Badge}>
                          Grade {c.grade}
                        </span>
                      </td>

                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={s.unitBadge}>
                          {unitCount} {unitCount === 1 ? 'unit' : 'units'}
                        </span>
                      </td>

                      <td style={s.td}>
                        <div style={s.actions}>
                          <Link
                            to={`/admin/courses/${c._id}/units`}
                            style={s.unitsBtn}
                            title={`Manage units for ${c.title}`}
                          >
                            Manage Units →
                          </Link>
                          <button
                            onClick={() => openEditForm(c)}
                            style={s.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
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

  toolbar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  toolbarLeft: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  h1: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sub: { margin: 0, color: '#666', fontSize: '0.88rem' },
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
    transition: 'background 0.2s',
  },

  filters: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  filterLabel: { fontSize: '0.85rem', fontWeight: 600, color: '#555' },
  select: {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.88rem',
    background: '#fff',
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
  grid2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: '#444',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
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
  desc: { color: '#666', fontSize: '0.82rem', marginTop: '0.2rem', lineHeight: '1.3' },

  grade12Badge: {
    display: 'inline-block',
    background: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 700,
    fontSize: '0.78rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '14px',
  },
  grade13Badge: {
    display: 'inline-block',
    background: '#fef3c7',
    color: '#92400e',
    fontWeight: 700,
    fontSize: '0.78rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '14px',
  },
  unitBadge: {
    display: 'inline-block',
    background: '#f3f4f6',
    color: '#374151',
    fontWeight: 700,
    fontSize: '0.78rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '14px',
  },

  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  unitsBtn: {
    padding: '0.4rem 0.85rem',
    background: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.83rem',
    whiteSpace: 'nowrap',
  },
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
