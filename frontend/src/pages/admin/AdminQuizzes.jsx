import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get('/quizzes');
      setQuizzes(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (quizId, label) => {
    if (!window.confirm(`Delete quiz for:\n"${label}"?\n\nThis also deletes all student attempts.`)) return;
    try {
      await adminApi.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
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
      <AdminHeader title="Manage Quizzes" onLogout={handleLogout} />

      <main style={s.main}>
        <div style={s.toolbar}>
          <h1 style={s.h1}>Quizzes ({quizzes.length})</h1>
          <Link to="/admin/quizzes/new" style={s.createBtn}>+ Create New Quiz</Link>
        </div>

        {loading && <p style={s.status}>Loading…</p>}
        {error   && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}

        {!loading && !error && quizzes.length === 0 && (
          <div style={s.empty}>
            <p>No quizzes yet.</p>
            <Link to="/admin/quizzes/new" style={s.createBtn}>Create your first quiz →</Link>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Lesson</th>
                <th style={{ ...s.th, width: 100, textAlign: 'center' }}>Questions</th>
                <th style={{ ...s.th, width: 180 }}>Created</th>
                <th style={{ ...s.th, width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.lessonLabel}>{quiz.lessonLabel}</span>
                    {quiz.lessonType && (
                      <span style={s.typeBadge}>{quiz.lessonType}</span>
                    )}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>
                    {quiz.questionCount}
                  </td>
                  <td style={{ ...s.td, color: '#888', fontSize: '0.85rem' }}>
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <Link to={`/admin/quizzes/${quiz._id}/edit`} style={s.editBtn}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz._id, quiz.lessonLabel)}
                        style={s.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', background: '#f5f6fa' },
  main:    { maxWidth: 1000, margin: '2rem auto', padding: '0 1.5rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  h1:      { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' },
  status:  { textAlign: 'center', color: '#888', padding: '3rem 0' },
  empty:   { textAlign: 'center', padding: '3rem 0', color: '#888' },
  createBtn: { display: 'inline-block', background: '#1a1a2e', color: '#fff', padding: '0.55rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' },
  table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th:      { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb' },
  tr:      { borderBottom: '1px solid #f0f0f0' },
  td:      { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },
  lessonLabel: { display: 'block', fontWeight: 600, color: '#1a1a2e', marginBottom: '0.15rem' },
  typeBadge:   { display: 'inline-block', background: '#f0f4ff', color: '#4f46e5', fontSize: '0.72rem', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 600 },
  actions:  { display: 'flex', gap: '0.5rem' },
  editBtn:  { padding: '0.3rem 0.75rem', background: '#e8f4fd', color: '#1d4ed8', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' },
  deleteBtn:{ padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
};
