import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminUnits() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRes, unitsRes] = await Promise.all([
        adminApi.get(`/courses/${courseId}`),
        adminApi.get(`/units?courseId=${courseId}`),
      ]);
      setCourse(courseRes.data.data);
      setUnits(unitsRes.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNewForm = () => {
    setEditId(null);
    setForm({
      title: '',
      description: '',
      order: units.length + 1,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditForm = (unit) => {
    setEditId(unit._id);
    setForm({
      title: unit.title || '',
      description: unit.description || '',
      order: unit.order ?? 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Unit title is required.');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/units/${editId}`, {
          ...form,
          courseId,
        });
      } else {
        await adminApi.post('/units', {
          ...form,
          courseId,
        });
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      alert('Failed to save unit: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit) => {
    const lessonCount = unit.lessons?.length || 0;
    const confirmMsg = lessonCount > 0
      ? `Delete unit "${unit.title}"?\n\nWarning: This will also delete ${lessonCount} lesson(s) inside this unit. This cannot be undone.`
      : `Delete unit "${unit.title}"?\n\nThis cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminApi.delete(`/units/${unit._id}`);
      setUnits((prev) => prev.filter((u) => u._id !== unit._id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

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
        title={course ? `${course.title} — Units` : 'Manage Units'}
        onLogout={handleLogout}
      />

      <main style={s.main} className="admin-main">
        {/* Navigation Breadcrumb */}
        <div style={s.breadcrumb}>
          <Link to="/admin/courses" style={s.backLink}>
            ← Back to Courses
          </Link>
          <span style={s.crumbDivider}>/</span>
          {course && (
            <span style={s.crumbCurrent}>
              Grade {course.grade} › {course.title}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar} className="admin-toolbar">
          <div>
            <h1 style={s.h1}>
              Units for {course ? `"${course.title}"` : 'Course'}{' '}
              {units.length > 0 && <span style={s.countBadge}>{units.length}</span>}
            </h1>
            {course && (
              <p style={s.sub}>
                Grade {course.grade} &bull; {units.length} unit{units.length === 1 ? '' : 's'} registered
              </p>
            )}
          </div>
          <button onClick={openNewForm} style={s.createBtn} id="add-unit-btn">
            + Add Unit
          </button>
        </div>

        {/* Inline Create / Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={s.formBox} id="unit-form">
            <div style={s.formHeader}>
              <h3 style={s.formTitle}>{editId ? 'Edit Unit' : 'Create New Unit'}</h3>
              <span style={s.formHint}>Fields marked with * are required</span>
            </div>

            <div style={s.grid2} className="admin-form-grid2">
              <div>
                <label style={s.label}>Unit Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Unit 01: Introduction to Materials Science"
                  style={s.input}
                  required
                  id="unit-title-input"
                />
              </div>

              <div style={{ maxWidth: 200 }}>
                <label style={s.label}>Sort Order #</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  style={s.input}
                  id="unit-order-input"
                />
              </div>
            </div>

            <div>
              <label style={s.label}>Unit Description (Optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Key concepts, syllabus topics covered, learning outcomes..."
                rows={3}
                style={{ ...s.input, resize: 'vertical' }}
                id="unit-desc-input"
              />
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={saving} style={s.saveBtn} id="save-unit-btn">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Unit'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={s.cancelBtn}
                id="cancel-unit-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* States */}
        {loading && <p style={s.status}>Loading course units…</p>}
        {!loading && error && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}

        {!loading && !error && units.length === 0 && (
          <div style={s.emptyBox}>
            <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '1.05rem' }}>
              No units have been added to this course yet.
            </p>
            <button onClick={openNewForm} style={s.createBtn}>
              + Add first unit
            </button>
          </div>
        )}

        {/* Units Table */}
        {!loading && units.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, width: 80, textAlign: 'center' }}>Order</th>
                  <th style={s.th}>Unit Title</th>
                  <th style={{ ...s.th, width: 130, textAlign: 'center' }}>Lessons</th>
                  <th style={{ ...s.th, width: 280 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => {
                  const lessonCount = unit.lessons ? unit.lessons.length : 0;
                  return (
                    <tr key={unit._id} style={s.tr}>
                      <td style={{ ...s.td, textAlign: 'center', fontWeight: 700, color: '#666' }}>
                        #{unit.order ?? 0}
                      </td>

                      <td style={s.td}>
                        <div style={s.title}>{unit.title}</div>
                        {unit.description && <div style={s.desc}>{unit.description}</div>}
                      </td>

                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={s.lessonBadge}>
                          {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </td>

                      <td style={s.td}>
                        <div style={s.actions}>
                          <Link
                            to={`/admin/units/${unit._id}/lessons`}
                            style={s.lessonsBtn}
                            title={`Manage lessons for ${unit.title}`}
                          >
                            Manage Lessons →
                          </Link>
                          <button
                            onClick={() => openEditForm(unit)}
                            style={s.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(unit)}
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
    fontSize: '0.9rem',
  },
  backLink: {
    color: '#4338ca',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.88rem',
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
  grid2: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' },
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

  lessonBadge: {
    display: 'inline-block',
    background: '#ecfdf5',
    color: '#065f46',
    fontWeight: 700,
    fontSize: '0.78rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '14px',
  },

  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  lessonsBtn: {
    padding: '0.4rem 0.85rem',
    background: '#dcfce7',
    color: '#166534',
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
