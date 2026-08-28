import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    name: '',
    gradeYear: '',
    quote: '',
    order: 0,
  });

  const navigate = useNavigate();

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get('/testimonials');
      setTestimonials(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTestimonials(); }, [loadTestimonials]);

  const openNewForm = () => {
    setEditId(null);
    setForm({ name: '', gradeYear: '', quote: '', order: 0 });
    setShowForm(true);
  };

  const openEditForm = (t) => {
    setEditId(t._id);
    setForm({
      name: t.name || '',
      gradeYear: t.gradeYear || '',
      quote: t.quote || '',
      order: t.order ?? 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) {
      alert('Student name and quote are required.');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/testimonials/${editId}`, form);
      } else {
        await adminApi.post('/testimonials', form);
      }
      setShowForm(false);
      loadTestimonials();
    } catch (err) {
      alert('Failed to save testimonial: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    try {
      await adminApi.delete(`/testimonials/${t._id}`);
      loadTestimonials();
    } catch (err) {
      alert('Failed to delete testimonial: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  return (
    <div style={s.page}>
      <AdminHeader title="Manage Testimonials" onLogout={handleLogout} />

      <main style={s.main}>
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>Student Testimonials</h1>
            <p style={s.sub}>Add and manage student reviews shown on the Home page</p>
          </div>
          <button onClick={openNewForm} style={s.addBtn}>+ Add Testimonial</button>
        </div>

        {/* Form Modal / Box */}
        {showForm && (
          <form onSubmit={handleSubmit} style={s.formBox}>
            <h3 style={s.formTitle}>{editId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
            <div style={s.grid2}>
              <div>
                <label style={s.label}>Student Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Kavindi P."
                  style={s.input}
                  required
                />
              </div>
              <div>
                <label style={s.label}>Grade / Year <span style={s.hint}>(e.g. Grade 13 — 2026)</span></label>
                <input
                  type="text"
                  value={form.gradeYear}
                  onChange={(e) => setForm({ ...form, gradeYear: e.target.value })}
                  placeholder="Grade 13 — 2026"
                  style={s.input}
                />
              </div>
            </div>

            <div>
              <label style={s.label}>Quote / Review *</label>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="The structured lessons and past paper discussions were exactly what I needed..."
                rows={3}
                style={{ ...s.input, resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ maxWidth: 200 }}>
              <label style={s.label}>Sort Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                style={s.input}
              />
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={saving} style={s.saveBtn}>
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Testimonial'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        {loading ? (
          <div style={s.status}>Loading testimonials…</div>
        ) : error ? (
          <div style={{ ...s.status, color: '#c0392b' }}>Error: {error}</div>
        ) : testimonials.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ margin: 0, color: '#888' }}>No testimonials added yet. Click "+ Add Testimonial" to create one.</p>
          </div>
        ) : (
          <div style={s.card}>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: 60 }}>Order</th>
                    <th style={{ ...s.th, width: 160 }}>Student Name</th>
                    <th style={{ ...s.th, width: 140 }}>Grade / Year</th>
                    <th style={s.th}>Quote</th>
                    <th style={{ ...s.th, width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t._id} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: 700, color: '#666' }}>#{t.order}</td>
                      <td style={{ ...s.td, fontWeight: 700 }}>{t.name}</td>
                      <td style={{ ...s.td, color: '#666', fontSize: '0.85rem' }}>{t.gradeYear || '—'}</td>
                      <td style={{ ...s.td, fontStyle: 'italic', color: '#444' }}>"{t.quote}"</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openEditForm(t)} style={s.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(t)} style={s.delBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page:     { minHeight: '100vh', background: '#f5f6fa' },
  main:     { maxWidth: 1060, margin: '0 auto', padding: '2rem 1.5rem 5rem' },
  status:   { textAlign: 'center', padding: '4rem', color: '#888' },

  headerRow:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title:    { fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.2rem' },
  sub:      { color: '#666', margin: 0, fontSize: '0.9rem' },
  addBtn:   { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },

  formBox:  { background: '#fff', border: '1px solid #e0e7ff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  formTitle:{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e' },
  grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label:    { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  hint:     { textTransform: 'none', fontWeight: 400, color: '#888' },
  input:    { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', fontFamily: 'inherit' },
  btnRow:   { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' },
  saveBtn:  { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
  cancelBtn:{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' },

  card:     { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' },
  emptyBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '3rem', textAlign: 'center' },
  tableWrap:{ overflowX: 'auto' },
  table:    { width: '100%', borderCollapse: 'collapse' },
  th:       { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb' },
  tr:       { borderBottom: '1px solid #f0f0f0' },
  td:       { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },

  editBtn:  { padding: '0.3rem 0.65rem', background: '#e8f4fd', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
  delBtn:   { padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
};
