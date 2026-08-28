import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

const MATERIAL_TYPE_OPTIONS = [
  { value: 'notes',               label: 'Theory Notes' },
  { value: 'short-notes',         label: 'Short Notes & Summaries' },
  { value: 'past-paper',          label: 'Past Paper' },
  { value: 'model-paper',         label: 'Model Paper' },
  { value: 'marking-scheme',      label: 'Marking Scheme' },
  { value: 'diagram',             label: 'Diagram' },
  { value: 'drawing',             label: 'Engineering Drawing' },
  { value: 'revision-paper',      label: 'Revision Paper' },
  { value: 'important-questions', label: 'Important Questions' },
];

export default function MaterialForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [units,       setUnits]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});

  const [form, setForm] = useState({
    title:       '',
    type:        'notes',
    unitId:      '',
    fileUrl:     '',
    description: '',
    order:       0,
  });

  // Fetch unit options & existing material if in edit mode
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [unitRes, matRes] = await Promise.all([
          adminApi.get('/units/all-flat'),
          isEdit ? adminApi.get(`/materials/${id}`) : Promise.resolve(null),
        ]);

        const unitList = unitRes.data.data || [];
        setUnits(unitList);

        if (matRes?.data?.data) {
          const m = matRes.data.data;
          setForm({
            title:       m.title || '',
            type:        m.type || 'notes',
            unitId:      m.unitId?._id || m.unitId || '',
            fileUrl:     m.fileUrl || '',
            description: m.description || '',
            order:       m.order ?? 0,
          });
        } else if (unitList.length > 0) {
          setForm((prev) => ({ ...prev, unitId: prev.unitId || unitList[0]._id }));
        }
      } catch (err) {
        alert('Failed to load form data: ' + err.message);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title  = 'Title is required.';
    if (!form.unitId)         e.unitId = 'Please select a unit.';
    if (!form.fileUrl.trim()) e.fileUrl = 'File link URL is required.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.put(`/materials/${id}`, form);
      } else {
        await adminApi.post('/materials', form);
      }
      navigate('/admin/materials');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  if (loadingData) {
    return (
      <div style={s.page}>
        <AdminHeader title={isEdit ? 'Edit Material' : 'Create Material'} onLogout={handleLogout} />
        <p style={s.loading}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <AdminHeader title={isEdit ? 'Edit Material' : 'Create Material'} onLogout={handleLogout} />

      <main style={s.main}>
        <Link to="/admin/materials" style={s.back}>← Back to Materials</Link>
        <h1 style={s.h1}>{isEdit ? 'Edit Study Material' : 'Create Study Material'}</h1>

        <form onSubmit={handleSave} style={s.card}>

          {/* Title */}
          <div style={s.field}>
            <label style={s.label} htmlFor="mat-title">Title *</label>
            <input
              id="mat-title"
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              style={{ ...s.input, ...(errors.title ? s.inputError : {}) }}
              placeholder="e.g. Unit 1 Theory Notes Part 1"
            />
            {errors.title && <p style={s.errMsg}>{errors.title}</p>}
          </div>

          {/* Type & Unit grid */}
          <div style={s.grid2}>
            {/* Type */}
            <div style={s.field}>
              <label style={s.label} htmlFor="mat-type">Material Type *</label>
              <select
                id="mat-type"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                style={s.input}
              >
                {MATERIAL_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div style={s.field}>
              <label style={s.label} htmlFor="mat-unit">Unit *</label>
              <select
                id="mat-unit"
                value={form.unitId}
                onChange={(e) => handleChange('unitId', e.target.value)}
                style={{ ...s.input, ...(errors.unitId ? s.inputError : {}) }}
              >
                <option value="">— Select a unit —</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>{u.label}</option>
                ))}
              </select>
              {errors.unitId && <p style={s.errMsg}>{errors.unitId}</p>}
            </div>
          </div>

          {/* File URL */}
          <div style={s.field}>
            <label style={s.label} htmlFor="mat-url">File Link (Google Drive / OneDrive URL) *</label>
            <input
              id="mat-url"
              type="url"
              value={form.fileUrl}
              onChange={(e) => handleChange('fileUrl', e.target.value)}
              style={{ ...s.input, ...(errors.fileUrl ? s.inputError : {}) }}
              placeholder="https://drive.google.com/file/d/..."
            />
            {errors.fileUrl && <p style={s.errMsg}>{errors.fileUrl}</p>}
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label} htmlFor="mat-desc">Description / Note <span style={s.hint}>(optional)</span></label>
            <textarea
              id="mat-desc"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              style={s.textarea}
              placeholder="e.g. 2023 model paper with full answers and explanations"
            />
          </div>

          {/* Order */}
          <div style={s.field}>
            <label style={s.label} htmlFor="mat-order">Sort Order <span style={s.hint}>(lower numbers appear first)</span></label>
            <input
              id="mat-order"
              type="number"
              value={form.order}
              onChange={(e) => handleChange('order', Number(e.target.value))}
              style={{ ...s.input, width: 160 }}
            />
          </div>

          {/* Save buttons */}
          <div style={s.saveRow}>
            <button type="submit" disabled={saving} style={s.saveBtn}>
              {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '✓ Create Material'}
            </button>
            <Link to="/admin/materials" style={s.cancelBtn}>Cancel</Link>
          </div>

        </form>
      </main>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#f5f6fa' },
  main:       { maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' },
  loading:    { textAlign: 'center', padding: '4rem', color: '#888' },
  back:       { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '1rem' },
  h1:         { fontSize: '1.5rem', fontWeight: 900, color: '#1a1a2e', marginBottom: '1.5rem' },

  card:       { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.75rem' },

  field:      { marginBottom: '1.25rem' },
  grid2:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' },
  label:      { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#333', marginBottom: '0.35rem' },
  hint:       { fontWeight: 400, color: '#888', fontSize: '0.78rem' },
  input:      { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fff' },
  textarea:   { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', background: '#fff', fontFamily: 'inherit' },
  inputError: { borderColor: '#e94560', background: '#fff8f8' },
  errMsg:     { color: '#c0392b', fontSize: '0.8rem', margin: '0.25rem 0 0' },

  saveRow:    { display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' },
  saveBtn:    { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' },
  cancelBtn:  { color: '#666', textDecoration: 'none', fontSize: '0.9rem' },
};
