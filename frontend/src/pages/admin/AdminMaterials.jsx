import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

const TYPE_CONFIG = {
  'notes':               { label: 'Theory Notes',         bg: '#dbeafe', color: '#1d4ed8' },
  'short-notes':         { label: 'Short Notes',          bg: '#ede9fe', color: '#7c3aed' },
  'past-paper':          { label: 'Past Paper',           bg: '#fee2e2', color: '#b91c1c' },
  'model-paper':         { label: 'Model Paper',          bg: '#ffedd5', color: '#c2410c' },
  'marking-scheme':      { label: 'Marking Scheme',       bg: '#dcfce7', color: '#15803d' },
  'diagram':             { label: 'Diagram',              bg: '#e0f2fe', color: '#0369a1' },
  'drawing':             { label: 'Drawing',              bg: '#ccfbf1', color: '#0f766e' },
  'revision-paper':      { label: 'Revision Paper',       bg: '#fce7f3', color: '#9d174d' },
  'important-questions': { label: 'Important Questions', bg: '#fef3c7', color: '#b45309' },
};

export default function AdminMaterials() {
  const navigate = useNavigate();

  const [materials,  setMaterials]  = useState([]);
  const [units,      setUnits]      = useState([]);
  const [unitFilter, setUnitFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Fetch materials and unit list for filter
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [matRes, unitRes] = await Promise.all([
        adminApi.get('/materials/all-flat'),
        adminApi.get('/units/all-flat'),
      ]);
      setMaterials(matRes.data.data || []);
      setUnits(unitRes.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (mat) => {
    if (!window.confirm(`Delete material "${mat.title}"?\n\nThis cannot be undone.`)) return;

    try {
      await adminApi.delete(`/materials/${mat._id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== mat._id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  // Filtered materials
  const filtered = unitFilter
    ? materials.filter((m) => String(m.unitId) === String(unitFilter))
    : materials;

  return (
    <div style={s.page}>
      <AdminHeader title="Manage Materials" onLogout={handleLogout} />

      <main style={s.main}>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarLeft}>
            <h1 style={s.h1}>Study Materials {filtered.length > 0 && <span style={s.countBadge}>{filtered.length}</span>}</h1>
          </div>
          <Link to="/admin/materials/new" style={s.createBtn}>
            + Create Material
          </Link>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <select
            id="unit-filter"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            style={s.select}
          >
            <option value="">All Units ({units.length} units)</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* States */}
        {loading && <p style={s.status}>Loading study materials…</p>}
        {!loading && error && <p style={{ ...s.status, color: '#c0392b' }}>Error: {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p style={s.status}>No materials found{unitFilter ? ' for this unit' : ''}.</p>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={{ ...s.th, width: 140 }}>Type</th>
                  <th style={s.th}>Unit</th>
                  <th style={{ ...s.th, width: 70, textAlign: 'center' }}>Order</th>
                  <th style={{ ...s.th, width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mat) => {
                  const conf = TYPE_CONFIG[mat.type] || { label: mat.type, bg: '#f3f4f6', color: '#444' };
                  return (
                    <tr key={mat._id} style={s.tr}>
                      <td style={s.td}>
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={s.titleLink}
                          title="Open link"
                        >
                          {mat.title} ↗
                        </a>
                        {mat.description && <p style={s.mDesc}>{mat.description}</p>}
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.typeBadge, background: conf.bg, color: conf.color }}>
                          {conf.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#555', fontSize: '0.88rem' }}>
                        {mat.unitLabel}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center', fontWeight: 600 }}>
                        {mat.order}
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <Link to={`/admin/materials/${mat._id}/edit`} style={s.editBtn}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(mat)}
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
  page:    { minHeight: '100vh', background: '#f5f6fa' },
  main:    { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  h1:          { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  countBadge:  { background: '#e5e7eb', color: '#444', fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: '10px', fontWeight: 700 },
  createBtn:   { background: '#1a1a2e', color: '#fff', padding: '0.55rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' },

  filters:     { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' },
  select:      { width: '100%', maxWidth: 400, padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', background: '#fff', cursor: 'pointer' },

  status:  { textAlign: 'center', color: '#888', padding: '3rem 0' },

  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th:        { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },

  titleLink: { color: '#1d4ed8', fontWeight: 700, textDecoration: 'none', fontSize: '0.92rem' },
  mDesc:     { margin: '0.2rem 0 0', color: '#888', fontSize: '0.8rem' },
  typeBadge: { display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },

  actions:   { display: 'flex', gap: '0.5rem' },
  editBtn:   { padding: '0.3rem 0.75rem', background: '#e8f4fd', color: '#1d4ed8', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.83rem' },
  deleteBtn: { padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem' },
};
