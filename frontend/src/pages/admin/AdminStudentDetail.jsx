import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate  = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [student,  setStudent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // ── Edit Student state ──────────────────────────────────────────────────────
  const [name,    setName]    = useState('');
  const [grade,   setGrade]   = useState('12');
  const [active,  setActive]  = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Exam Results state ──────────────────────────────────────────────────────
  const [results,        setResults]        = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [showResultForm, setShowResultForm] = useState(false);
  const [editResultId,   setEditResultId]   = useState(null);
  const [savingResult,   setSavingResult]   = useState(false);
  const [resultForm,     setResultForm]     = useState({
    examTitle: '',
    date: new Date().toISOString().slice(0, 10),
    marks: '',
    maxMarks: 100,
    grade: '',
    remarks: '',
  });

  // ── Load Student Info ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await adminApi.get(`/students/${id}`);
        const s = data.data;
        setStudent(s);
        setName(s.name);
        setGrade(s.grade);
        setActive(s.active !== false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Load Student Exam Results ───────────────────────────────────────────────
  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const { data } = await adminApi.get(`/results/student/${id}`);
      setResults(data.data || []);
    } catch (err) {
      console.error('Failed to load student results:', err);
    } finally {
      setLoadingResults(false);
    }
  }, [id]);

  useEffect(() => { loadResults(); }, [loadResults]);

  // ── Save Student Info ───────────────────────────────────────────────────────
  const handleSaveStudent = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const { data } = await adminApi.put(`/students/${id}`, { name, grade, active });
      setStudent((prev) => ({ ...prev, ...data.data }));
      setSaveMsg('✓ Saved successfully');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('✗ Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Exam Result Form Handlers ──────────────────────────────────────────────
  const openNewResultForm = () => {
    setEditResultId(null);
    setResultForm({
      examTitle: '',
      date: new Date().toISOString().slice(0, 10),
      marks: '',
      maxMarks: 100,
      grade: '',
      remarks: '',
    });
    setShowResultForm(true);
  };

  const openEditResultForm = (res) => {
    setEditResultId(res._id);
    const dateStr = res.date ? new Date(res.date).toISOString().slice(0, 10) : '';
    setResultForm({
      examTitle: res.examTitle || '',
      date:      dateStr,
      marks:     res.marks ?? '',
      maxMarks:  res.maxMarks ?? 100,
      grade:     res.grade || '',
      remarks:   res.remarks || '',
    });
    setShowResultForm(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!resultForm.examTitle.trim() || resultForm.marks === '') {
      alert('Please provide exam title and marks.');
      return;
    }

    setSavingResult(true);
    try {
      const payload = {
        ...resultForm,
        studentId: id,
        marks: Number(resultForm.marks),
        maxMarks: Number(resultForm.maxMarks) || 100,
      };

      if (editResultId) {
        await adminApi.put(`/results/${editResultId}`, payload);
      } else {
        await adminApi.post('/results', payload);
      }

      setShowResultForm(false);
      loadResults();
    } catch (err) {
      alert('Failed to save result: ' + err.message);
    } finally {
      setSavingResult(false);
    }
  };

  const handleDeleteResult = async (res) => {
    if (!window.confirm(`Delete result "${res.examTitle}"?`)) return;
    try {
      await adminApi.delete(`/results/${res._id}`);
      loadResults();
    } catch (err) {
      alert('Failed to delete result: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <AdminHeader title="Student Detail" onLogout={handleLogout} />
        <p style={s.status}>Loading…</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={s.page}>
        <AdminHeader title="Student Detail" onLogout={handleLogout} />
        <p style={{ ...s.status, color: '#c0392b' }}>{error || 'Student not found'}</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 768px) {
          .admin-detail-main {
            padding: 1.5rem 1rem !important;
          }
          .admin-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-form-grid2,
          .admin-form-grid3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <AdminHeader title="Student Detail" onLogout={handleLogout} />

      <main style={s.main} className="admin-detail-main">
        <Link to="/admin/students" style={s.back}>← Back to Students</Link>

        <div style={s.grid} className="admin-detail-grid">

          {/* ── Left col: editable fields ─────────────────────────────────── */}
          <div>
            <section style={s.card}>
              <h2 style={s.cardTitle}>Student Info</h2>

              {/* Read-only email */}
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <p style={s.readOnly}>{student.email}</p>
              </div>

              {/* Registered */}
              <div style={s.field}>
                <label style={s.label}>Registered</label>
                <p style={s.readOnly}>
                  {new Date(student.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>

              <hr style={s.divider} />

              {/* Editable: name */}
              <div style={s.field}>
                <label style={s.label} htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={s.input}
                />
              </div>

              {/* Editable: grade */}
              <div style={s.field}>
                <label style={s.label} htmlFor="edit-grade">Grade</label>
                <select
                  id="edit-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={s.input}
                >
                  <option value="12">Grade 12</option>
                  <option value="13">Grade 13</option>
                </select>
              </div>

              {/* Editable: active toggle */}
              <div style={s.field}>
                <label style={s.label}>Account Status</label>
                <div style={s.toggleRow}>
                  <button
                    onClick={() => setActive(true)}
                    style={active ? s.toggleActive : s.toggleInactive}
                  >
                    ✓ Active
                  </button>
                  <button
                    onClick={() => setActive(false)}
                    style={!active ? s.toggleSuspended : s.toggleInactive}
                  >
                    ✗ Suspended
                  </button>
                </div>
                <p style={s.toggleHint}>
                  {active
                    ? 'Student can log in and access content.'
                    : 'Student is suspended — cannot log in.'}
                </p>
              </div>

              {/* Save */}
              <div style={s.saveRow}>
                <button onClick={handleSaveStudent} disabled={saving} style={s.saveBtn}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
                {saveMsg && (
                  <span style={{
                    fontSize: '0.88rem',
                    color: saveMsg.startsWith('✓') ? '#15803d' : '#c0392b',
                    fontWeight: 600,
                  }}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </section>
          </div>

          {/* ── Right col: activity & exam results ──────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Enrolled Courses */}
            <section style={s.card}>
              <h2 style={s.cardTitle}>Enrolled Courses ({student.enrolledCourses?.length ?? 0})</h2>
              {!student.enrolledCourses?.length ? (
                <p style={s.emptyNote}>No courses enrolled yet.</p>
              ) : (
                <ul style={s.courseList}>
                  {student.enrolledCourses.map((c) => (
                    <li key={c._id} style={s.courseItem}>
                      <span style={c.grade === '12' ? s.badge12 : s.badge13}>
                        Grade {c.grade}
                      </span>
                      <span style={{ fontWeight: 600 }}>{c.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Quiz Attempts */}
            <section style={s.card}>
              <h2 style={s.cardTitle}>
                Quiz Attempts ({student.quizAttempts?.length ?? 0})
              </h2>
              {!student.quizAttempts?.length ? (
                <p style={s.emptyNote}>No quiz attempts yet.</p>
              ) : (
                <div style={s.attemptsWrap}>
                  <table style={s.attTable}>
                    <thead>
                      <tr>
                        <th style={s.aTh}>Lesson</th>
                        <th style={{ ...s.aTh, width: 80,  textAlign: 'center' }}>Score</th>
                        <th style={{ ...s.aTh, width: 80,  textAlign: 'center' }}>%</th>
                        <th style={{ ...s.aTh, width: 130 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.quizAttempts.map((a) => (
                        <tr key={a._id} style={s.aTr}>
                          <td style={s.aTd}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                              {a.lessonTitle}
                            </span>
                            {a.lessonType && (
                              <span style={s.typeChip}>{a.lessonType}</span>
                            )}
                          </td>
                          <td style={{ ...s.aTd, textAlign: 'center', fontWeight: 700 }}>
                            {a.score}/{a.total}
                          </td>
                          <td style={{ ...s.aTd, textAlign: 'center' }}>
                            <span style={{
                              fontWeight: 700,
                              color: a.percentage >= 50 ? '#15803d' : '#b91c1c',
                            }}>
                              {a.percentage}%
                            </span>
                          </td>
                          <td style={{ ...s.aTd, color: '#888', fontSize: '0.82rem' }}>
                            {new Date(a.attemptedAt).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Exam Results Section ──────────────────────────────────── */}
            <section style={s.card}>
              <div style={s.resHeader}>
                <h2 style={s.cardTitle}>Exam Results &amp; Reports ({results.length})</h2>
                <button onClick={openNewResultForm} style={s.addResBtn}>+ Add Result</button>
              </div>

              {/* Result Form (Add / Edit) */}
              {showResultForm && (
                <form onSubmit={handleSaveResult} style={s.resultFormBox}>
                  <h3 style={s.formSubH3}>{editResultId ? 'Edit Exam Result' : 'Add New Exam Result'}</h3>
                  <div style={s.formGrid2} className="admin-form-grid2">
                    <div>
                      <label style={s.label}>Exam Title *</label>
                      <input
                        type="text"
                        value={resultForm.examTitle}
                        onChange={(e) => setResultForm({ ...resultForm, examTitle: e.target.value })}
                        placeholder="e.g. Term Test 1 - 2026"
                        style={s.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={s.label}>Date *</label>
                      <input
                        type="date"
                        value={resultForm.date}
                        onChange={(e) => setResultForm({ ...resultForm, date: e.target.value })}
                        style={s.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={s.formGrid3} className="admin-form-grid3">
                    <div>
                      <label style={s.label}>Marks *</label>
                      <input
                        type="number"
                        value={resultForm.marks}
                        onChange={(e) => setResultForm({ ...resultForm, marks: e.target.value })}
                        placeholder="85"
                        style={s.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={s.label}>Max Marks</label>
                      <input
                        type="number"
                        value={resultForm.maxMarks}
                        onChange={(e) => setResultForm({ ...resultForm, maxMarks: e.target.value })}
                        style={s.input}
                      />
                    </div>
                    <div>
                      <label style={s.label}>Grade (optional)</label>
                      <input
                        type="text"
                        value={resultForm.grade}
                        onChange={(e) => setResultForm({ ...resultForm, grade: e.target.value })}
                        placeholder="A, B, C, S, F"
                        style={s.input}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={s.label}>Remarks / Comment <span style={s.toggleHint}>(optional)</span></label>
                    <input
                      type="text"
                      value={resultForm.remarks}
                      onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                      placeholder="e.g. Excellent performance in practical section"
                      style={s.input}
                    />
                  </div>

                  <div style={s.resFormBtnRow}>
                    <button type="submit" disabled={savingResult} style={s.saveBtn}>
                      {savingResult ? 'Saving…' : editResultId ? 'Save Changes' : 'Add Result'}
                    </button>
                    <button type="button" onClick={() => setShowResultForm(false)} style={s.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loadingResults ? (
                <p style={s.emptyNote}>Loading exam results…</p>
              ) : results.length === 0 ? (
                <p style={s.emptyNote}>No exam results recorded for this student yet.</p>
              ) : (
                <div style={s.attemptsWrap}>
                  <table style={s.attTable}>
                    <thead>
                      <tr>
                        <th style={s.aTh}>Exam Title</th>
                        <th style={{ ...s.aTh, width: 80, textAlign: 'center' }}>Marks</th>
                        <th style={{ ...s.aTh, width: 65, textAlign: 'center' }}>%</th>
                        <th style={{ ...s.aTh, width: 60, textAlign: 'center' }}>Grade</th>
                        <th style={{ ...s.aTh, width: 100 }}>Date</th>
                        <th style={{ ...s.aTh, width: 110 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => {
                        const pct = ((r.marks / (r.maxMarks || 100)) * 100).toFixed(1);
                        const isPass = pct >= 40;
                        return (
                          <tr key={r._id} style={s.aTr}>
                            <td style={s.aTd}>
                              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                                {r.examTitle}
                              </span>
                              {r.remarks && (
                                <p style={{ margin: '0.15rem 0 0', color: '#777', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                  "{r.remarks}"
                                </p>
                              )}
                            </td>
                            <td style={{ ...s.aTd, textAlign: 'center', fontWeight: 700 }}>
                              {r.marks}/{r.maxMarks || 100}
                            </td>
                            <td style={{ ...s.aTd, textAlign: 'center', fontWeight: 700, color: isPass ? '#15803d' : '#b91c1c' }}>
                              {pct}%
                            </td>
                            <td style={{ ...s.aTd, textAlign: 'center' }}>
                              <span style={{
                                ...s.gBadge,
                                background: isPass ? '#dcfce7' : '#fee2e2',
                                color: isPass ? '#15803d' : '#b91c1c',
                              }}>
                                {r.grade || (isPass ? 'P' : 'F')}
                              </span>
                            </td>
                            <td style={{ ...s.aTd, color: '#888', fontSize: '0.82rem' }}>
                              {new Date(r.date).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td style={s.aTd}>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button onClick={() => openEditResultForm(r)} style={s.miniEditBtn}>Edit</button>
                                <button onClick={() => handleDeleteResult(r)} style={s.miniDelBtn}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:   { minHeight: '100vh', background: '#f5f6fa' },
  main:   { maxWidth: 1060, margin: '0 auto', padding: '1.5rem' },
  status: { textAlign: 'center', padding: '4rem', color: '#888' },
  back:   { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '1.25rem' },

  grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' },

  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' },
  cardTitle: { margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1a1a2e' },

  field:    { marginBottom: '1rem' },
  label:    { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  readOnly: { margin: 0, color: '#333', fontSize: '0.95rem', fontWeight: 500 },
  input:    { width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' },
  divider:  { border: 'none', borderTop: '1px solid #f0f0f0', margin: '1rem 0' },

  toggleRow:     { display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' },
  toggleActive:  { flex: 1, padding: '0.45rem', background: '#dcfce7', color: '#15803d', border: '2px solid #86efac', borderRadius: '7px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },
  toggleSuspended: { flex: 1, padding: '0.45rem', background: '#fee2e2', color: '#b91c1c', border: '2px solid #fca5a5', borderRadius: '7px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },
  toggleInactive:{ flex: 1, padding: '0.45rem', background: '#f3f4f6', color: '#999', border: '2px solid #e5e7eb', borderRadius: '7px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' },
  toggleHint:    { margin: 0, fontSize: '0.78rem', color: '#888' },

  saveRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' },
  saveBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' },

  emptyNote:  { color: '#aaa', fontSize: '0.88rem', margin: 0 },
  courseList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  courseItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' },

  badge12: { display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 },
  badge13: { display: 'inline-block', background: '#fce7f3', color: '#9d174d', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 },

  attemptsWrap: { overflowX: 'auto' },
  attTable: { width: '100%', borderCollapse: 'collapse' },
  aTh: { padding: '0.5rem 0.75rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb' },
  aTr: { borderBottom: '1px solid #f3f4f6' },
  aTd: { padding: '0.6rem 0.75rem', verticalAlign: 'middle', fontSize: '0.88rem' },
  typeChip: { display: 'inline-block', marginLeft: '0.4rem', background: '#f0f4ff', color: '#4f46e5', fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 600 },

  /* Exam Results styling */
  resHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  addResBtn:    { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  resultFormBox:{ background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  formSubH3:    { margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#1a1a2e' },
  formGrid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  formGrid3:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' },
  resFormBtnRow:{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' },
  cancelBtn:    { background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' },

  gBadge:      { display: 'inline-block', padding: '0.15rem 0.45rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 },
  miniEditBtn: { padding: '0.25rem 0.5rem', background: '#e8f4fd', color: '#1d4ed8', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' },
  miniDelBtn:  { padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' },
};
