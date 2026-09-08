import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminSiteContent() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    instructor: {
      name: '',
      qualification: '',
      photoUrl: '',
      bio: '',
    },
    contact: {
      whatsappGroupUrl: '',
      youtubeUrl: '',
      email: '',
      phone: '',
    },
    freeTrial: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.get('/site-content');
        if (data?.data) {
          setForm({
            instructor: {
              name:          data.data.instructor?.name || '',
              qualification: data.data.instructor?.qualification || '',
              photoUrl:      data.data.instructor?.photoUrl || '',
              bio:           data.data.instructor?.bio || '',
            },
            contact: {
              whatsappGroupUrl: data.data.contact?.whatsappGroupUrl || '',
              youtubeUrl:       data.data.contact?.youtubeUrl || '',
              email:            data.data.contact?.email || '',
              phone:            data.data.contact?.phone || '',
            },
            freeTrial: {
              title:       data.data.freeTrial?.title || '',
              description: data.data.freeTrial?.description || '',
            },
          });
        }
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load site content: ' + err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      await adminApi.put('/site-content', form);
      setMsg({ type: 'success', text: '✓ Site content updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Save failed: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div style={s.page}>
        <AdminHeader title="Manage Site Content" onLogout={handleLogout} />
        <p style={s.loading}>Loading site content…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        .admin-content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .admin-content-main {
            padding: 1.5rem 1rem 4rem !important;
          }
          .admin-content-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-content-card {
            padding: 1.25rem 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .admin-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .admin-top-save-btn {
            width: 100% !important;
          }
        }
      `}</style>

      <AdminHeader title="Manage Site Content" onLogout={handleLogout} />

      <main style={s.main} className="admin-content-main">
        <div style={s.headerRow} className="admin-header-row">
          <div>
            <Link to="/admin" style={s.back}>← Back to Dashboard</Link>
            <h1 style={s.h1}>Manage Site Content</h1>
            <p style={s.sub}>Edit Home page instructor, contact links, and free trial callouts.</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={s.topSaveBtn} className="admin-top-save-btn">
            {saving ? 'Saving…' : '💾 Save All Changes'}
          </button>
        </div>

        {msg.text && (
          <div style={msg.type === 'success' ? s.alertSuccess : s.alertError}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={s.formGrid} className="admin-content-grid">
          {/* Instructor Info */}
          <section style={s.card} className="admin-content-card">
            <h2 style={s.cardTitle}>👨‍🏫 Instructor Details</h2>

            <div style={s.field}>
              <label style={s.label}>Instructor Name</label>
              <input
                type="text"
                value={form.instructor.name}
                onChange={(e) => handleChange('instructor', 'name', e.target.value)}
                style={s.input}
                placeholder="e.g. S. Vithurshan"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Qualification / Role</label>
              <input
                type="text"
                value={form.instructor.qualification}
                onChange={(e) => handleChange('instructor', 'qualification', e.target.value)}
                style={s.input}
                placeholder="e.g. BET (Hons)(R), University of Sri Jayewardenepura"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Photo URL <span style={s.hint}>(optional — leaves default dp.jpeg if empty)</span></label>
              <input
                type="text"
                value={form.instructor.photoUrl}
                onChange={(e) => handleChange('instructor', 'photoUrl', e.target.value)}
                style={s.input}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Instructor Bio</label>
              <textarea
                rows={4}
                value={form.instructor.bio}
                onChange={(e) => handleChange('instructor', 'bio', e.target.value)}
                style={s.textarea}
                placeholder="Short bio describing experience and teaching methodology..."
              />
            </div>
          </section>

          {/* Contact Details */}
          <section style={s.card} className="admin-content-card">
            <h2 style={s.cardTitle}>📞 Contact &amp; Social Links</h2>

            <div style={s.field}>
              <label style={s.label}>WhatsApp Group URL</label>
              <input
                type="url"
                value={form.contact.whatsappGroupUrl}
                onChange={(e) => handleChange('contact', 'whatsappGroupUrl', e.target.value)}
                style={s.input}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>YouTube Channel URL</label>
              <input
                type="url"
                value={form.contact.youtubeUrl}
                onChange={(e) => handleChange('contact', 'youtubeUrl', e.target.value)}
                style={s.input}
                placeholder="https://www.youtube.com/@E-ZONEonlineclasses"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Contact Email</label>
              <input
                type="email"
                value={form.contact.email}
                onChange={(e) => handleChange('contact', 'email', e.target.value)}
                style={s.input}
                placeholder="ezontechclasses@gmail.com"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Contact Phone Number</label>
              <input
                type="text"
                value={form.contact.phone}
                onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                style={s.input}
                placeholder="0770406268"
              />
            </div>
          </section>

          {/* Free Trial Banner */}
          <section style={{ ...s.card, gridColumn: '1 / -1' }} className="admin-content-card">
            <h2 style={s.cardTitle}>🎁 Free Trial Callout</h2>

            <div style={s.field}>
              <label style={s.label}>Section Title</label>
              <input
                type="text"
                value={form.freeTrial.title}
                onChange={(e) => handleChange('freeTrial', 'title', e.target.value)}
                style={s.input}
                placeholder="Free Trial & Demo Class"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Section Description</label>
              <textarea
                rows={3}
                value={form.freeTrial.description}
                onChange={(e) => handleChange('freeTrial', 'description', e.target.value)}
                style={s.textarea}
                placeholder="Description of the free demo class or trial sessions offered..."
              />
            </div>
          </section>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} style={s.saveBtn}>
              {saving ? 'Saving…' : '💾 Save Site Content'}
            </button>
            <Link to="/admin" style={s.cancelBtn}>Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: '#f5f6fa' },
  main:      { maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  loading:   { textAlign: 'center', padding: '4rem', color: '#888' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  back:      { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' },
  h1:        { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e' },
  sub:       { margin: 0, color: '#666', fontSize: '0.9rem' },

  topSaveBtn:{ background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' },

  alertSuccess: { padding: '0.85rem 1.25rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.92rem' },
  alertError:   { padding: '0.85rem 1.25rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.92rem' },

  formGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' },
  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.75rem' },
  cardTitle: { margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' },

  field:    { marginBottom: '1.25rem' },
  label:    { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#333', marginBottom: '0.4rem' },
  hint:     { fontWeight: 400, color: '#888', fontSize: '0.78rem' },
  input:    { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', resize: 'vertical', background: '#fff', fontFamily: 'inherit' },

  saveBtn:   { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  cancelBtn: { display: 'inline-flex', alignItems: 'center', color: '#666', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 },
};
