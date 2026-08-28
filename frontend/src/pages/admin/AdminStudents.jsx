import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

const LIMIT = 20;

const GRADE_OPTIONS = [
  { value: '',   label: 'All Grades' },
  { value: '12', label: 'Grade 12'   },
  { value: '13', label: 'Grade 13'   },
];

export default function AdminStudents() {
  const navigate = useNavigate();

  // ── List state ──────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  // Debounce search input (500 ms)
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 500);
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (gradeFilter)     params.grade  = gradeFilter;

      const { data } = await adminApi.get('/students', { params });
      setStudents(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, gradeFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (student) => {
    if (!window.confirm(
      `Delete student "${student.name}" (${student.email})?\n\nThis also deletes all their quiz attempts. This cannot be undone.`
    )) return;

    try {
      await adminApi.delete(`/students/${student._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      setTotal((t) => t - 1);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <AdminHeader title="Manage Students" onLogout={handleLogout} />

      <main style={s.main}>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarLeft}>
            <h1 style={s.h1}>Students {total > 0 && <span style={s.countBadge}>{total}</span>}</h1>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <input
            id="student-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email…"
            style={s.searchInput}
          />
          <select
            id="grade-filter"
            value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
            style={s.select}
          >
            {GRADE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* States */}
        {loading && <p style={s.status}>Loading…</p>}
        {!loading && error && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}
        {!loading && !error && students.length === 0 && (
          <p style={s.status}>No students found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.</p>
        )}

        {/* Table */}
        {!loading && students.length > 0 && (
          <>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={{ ...s.th, width: 90,  textAlign: 'center' }}>Grade</th>
                    <th style={{ ...s.th, width: 130, textAlign: 'center' }}>Status</th>
                    <th style={{ ...s.th, width: 140 }}>Registered</th>
                    <th style={{ ...s.th, width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} style={s.tr}>
                      <td style={s.td}>
                        <span style={s.studentName}>{student.name}</span>
                      </td>
                      <td style={{ ...s.td, color: '#555', fontSize: '0.88rem' }}>
                        {student.email}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={student.grade === '12' ? s.badge12 : s.badge13}>
                          Grade {student.grade}
                        </span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={student.active !== false ? s.badgeActive : s.badgeInactive}>
                          {student.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#888', fontSize: '0.85rem' }}>
                        {new Date(student.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <Link to={`/admin/students/${student._id}`} style={s.viewBtn}>
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(student)}
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
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={s.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={page === 1 ? s.pagesBtnDisabled : s.pagesBtn}
                >
                  ← Prev
                </button>
                <span style={s.pageInfo}>
                  Page {page} of {pages} &nbsp;·&nbsp; {total} students
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  style={page === pages ? s.pagesBtnDisabled : s.pagesBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:    { minHeight: '100vh', background: '#f5f6fa' },
  main:    { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  h1:          { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  countBadge:  { background: '#e5e7eb', color: '#444', fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: '10px', fontWeight: 700 },

  filters:     { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  searchInput: { flex: '1 1 260px', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', outline: 'none' },
  select:      { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', background: '#fff', cursor: 'pointer' },

  status:  { textAlign: 'center', color: '#888', padding: '3rem 0' },

  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th:        { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },
  studentName: { fontWeight: 600, color: '#1a1a2e' },

  badge12:      { display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },
  badge13:      { display: 'inline-block', background: '#fce7f3', color: '#9d174d', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },
  badgeActive:  { display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },
  badgeInactive:{ display: 'inline-block', background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },

  actions:   { display: 'flex', gap: '0.5rem' },
  viewBtn:   { padding: '0.3rem 0.75rem', background: '#e8f4fd', color: '#1d4ed8', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.83rem', whiteSpace: 'nowrap' },
  deleteBtn: { padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem' },

  pagination:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginTop: '1.5rem' },
  pagesBtn:         { padding: '0.45rem 1.1rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  pagesBtnDisabled: { padding: '0.45rem 1.1rem', background: '#e5e7eb', color: '#aaa', border: 'none', borderRadius: '7px', cursor: 'not-allowed', fontWeight: 600, fontSize: '0.88rem' },
  pageInfo:         { color: '#666', fontSize: '0.88rem' },
};
