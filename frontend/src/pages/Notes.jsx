import { useEffect, useState } from 'react';
import api from '../api/api';

const TYPE_CONFIG = {
  'notes':               { label: 'Theory Notes',         icon: '📖', color: '#1d4ed8', bg: '#dbeafe' },
  'short-notes':         { label: 'Short Notes & Summaries', icon: '⚡', color: '#7c3aed', bg: '#ede9fe' },
  'past-paper':          { label: 'Past Papers',          icon: '📝', color: '#b91c1c', bg: '#fee2e2' },
  'model-paper':         { label: 'Model Papers',         icon: '📄', color: '#c2410c', bg: '#ffedd5' },
  'marking-scheme':      { label: 'Marking Schemes',      icon: '✅', color: '#15803d', bg: '#dcfce7' },
  'diagram':             { label: 'Diagrams',             icon: '📊', color: '#0369a1', bg: '#e0f2fe' },
  'drawing':             { label: 'Engineering Drawings', icon: '✏️', color: '#0f766e', bg: '#ccfbf1' },
  'revision-paper':      { label: 'Revision Papers',      icon: '🔁', color: '#9d174d', bg: '#fce7f3' },
  'important-questions': { label: 'Important Questions',  icon: '⭐', color: '#b45309', bg: '#fef3c7' },
};

export default function Notes() {
  const [courses,       setCourses]       = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [selectedCourse,setSelectedCourse]= useState(null);
  const [units,          setUnits]          = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [materials,      setMaterials]      = useState([]);

  const [loadingCourses,   setLoadingCourses]   = useState(true);
  const [loadingUnits,     setLoadingUnits]     = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error,            setError]            = useState('');

  // 1. Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setError('');
      try {
        const { data } = await api.get('/courses');
        setCourses(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // 2. Select default course when grade changes or courses arrive
  useEffect(() => {
    if (!courses.length) return;
    const match = courses.find((c) => String(c.grade) === String(selectedGrade)) || courses[0];
    setSelectedCourse(match);
  }, [courses, selectedGrade]);

  // 3. Fetch units when selectedCourse changes
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchUnits = async () => {
      setLoadingUnits(true);
      setUnits([]);
      setSelectedUnitId('');
      setMaterials([]);
      try {
        const { data } = await api.get(`/units?courseId=${selectedCourse._id}`);
        const unitList = data.data || [];
        setUnits(unitList);
        if (unitList.length > 0) {
          setSelectedUnitId(unitList[0]._id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, [selectedCourse]);

  // 4. Fetch materials when selectedUnitId changes
  useEffect(() => {
    if (!selectedUnitId) {
      setMaterials([]);
      return;
    }
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const { data } = await api.get(`/materials?unitId=${selectedUnitId}`);
        setMaterials(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, [selectedUnitId]);

  // Group materials by type
  const groupedMaterials = Object.keys(TYPE_CONFIG).reduce((acc, typeKey) => {
    const items = materials.filter((m) => m.type === typeKey);
    if (items.length > 0) {
      acc[typeKey] = items;
    }
    return acc;
  }, {});

  // Catch any unexpected material types not in config
  const knownKeys = new Set(Object.keys(TYPE_CONFIG));
  const otherItems = materials.filter((m) => !knownKeys.has(m.type));
  if (otherItems.length > 0) {
    groupedMaterials['other'] = otherItems;
  }

  const hasGroups = Object.keys(groupedMaterials).length > 0;

  return (
    <div style={s.page} className="notes-page">
      <style>{`
        .notes-grade-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.75rem;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .notes-grade-tabs::-webkit-scrollbar {
          display: none;
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .notes-page {
            padding: 1.5rem 1rem 4rem !important;
          }
          .notes-grid {
            grid-template-columns: 1fr !important;
          }
          .notes-selector-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .notes-select {
            min-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      <header style={s.header}>
        <h1 style={s.title}>📚 Notes &amp; Study Materials</h1>
        <p style={s.sub}>
          Access theory notes, short summaries, past papers, drawing sheets, and marking schemes.
        </p>
      </header>

      {/* Grade Selector Tabs */}
      <div style={s.gradeTabs} className="notes-grade-tabs">
        <button
          onClick={() => setSelectedGrade('12')}
          style={selectedGrade === '12' ? s.gradeTabActive : s.gradeTab}
        >
          Grade 12 Materials
        </button>
        <button
          onClick={() => setSelectedGrade('13')}
          style={selectedGrade === '13' ? s.gradeTabActive : s.gradeTab}
        >
          Grade 13 Materials
        </button>
      </div>

      {/* Unit Selector Bar */}
      <div style={s.selectorBar} className="notes-selector-bar">
        <label style={s.selectorLabel} htmlFor="unit-select">Select Unit:</label>
        {loadingUnits ? (
          <span style={s.selectorLoading}>Loading units…</span>
        ) : units.length === 0 ? (
          <span style={s.selectorEmpty}>No units found for Grade {selectedGrade}</span>
        ) : (
          <select
            id="unit-select"
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            style={s.select}
            className="notes-select"
          >
            {units.map((u, idx) => (
              <option key={u._id} value={u._id}>
                Unit {idx + 1}: {u.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content Area */}
      <main style={s.content}>
        {error && <div style={s.errorBox}>Error: {error}</div>}

        {loadingMaterials ? (
          <div style={s.status}>Loading study materials…</div>
        ) : !selectedUnitId ? (
          <div style={s.status}>Please select a unit above to view study materials.</div>
        ) : !hasGroups ? (
          <div style={s.emptyCard}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>📂</span>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a1a2e' }}>No materials uploaded yet</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
              Study materials for this unit will appear here once added by the instructor.
            </p>
          </div>
        ) : (
          Object.entries(groupedMaterials).map(([typeKey, items]) => {
            const conf = TYPE_CONFIG[typeKey] || {
              label: 'Other Resources',
              icon: '📁',
              color: '#444',
              bg: '#f3f4f6',
            };

            return (
              <section key={typeKey} style={s.groupSection}>
                <div style={s.groupHeader}>
                  <span style={s.groupIcon}>{conf.icon}</span>
                  <h2 style={s.groupTitle}>{conf.label}</h2>
                  <span style={{ ...s.countChip, background: conf.bg, color: conf.color }}>
                    {items.length} {items.length === 1 ? 'file' : 'files'}
                  </span>
                </div>

                <div style={s.materialGrid} className="notes-grid">
                  {items.map((m) => (
                    <div key={m._id} style={s.materialCard}>
                      <div style={s.cardTop}>
                        <h3 style={s.mTitle}>{m.title}</h3>
                        <span style={{ ...s.typeBadge, background: conf.bg, color: conf.color }}>
                          {conf.label}
                        </span>
                      </div>

                      {m.description && (
                        <p style={s.mDesc}>{m.description}</p>
                      )}

                      <div style={s.cardBottom}>
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={s.openBtn}
                        >
                          Open Resource ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}

const s = {
  page:            { maxWidth: 1040, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' },
  header:          { marginBottom: '2rem' },
  title:           { fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.5rem' },
  sub:             { color: '#666', fontSize: '1rem', margin: 0 },

  gradeTabs:       { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem' },
  gradeTab:        { padding: '0.6rem 1.4rem', borderRadius: '8px', background: '#f3f4f6', color: '#555', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' },
  gradeTabActive:  { padding: '0.6rem 1.4rem', borderRadius: '8px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },

  selectorBar:     { display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', marginBottom: '2rem', flexWrap: 'wrap' },
  selectorLabel:   { fontWeight: 700, color: '#1a1a2e', fontSize: '0.92rem' },
  selectorLoading: { color: '#888', fontSize: '0.9rem' },
  selectorEmpty:   { color: '#c0392b', fontSize: '0.9rem', fontWeight: 600 },
  select:          { flex: 1, minWidth: 260, padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' },

  content:         { display: 'flex', flexDirection: 'column', gap: '2rem' },
  status:          { textAlign: 'center', padding: '4rem 1rem', color: '#888', fontSize: '1rem' },
  errorBox:        { padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontWeight: 600 },

  emptyCard:       { textAlign: 'center', background: '#fff', border: '1px dashed #ccc', borderRadius: '16px', padding: '3.5rem 1.5rem' },

  groupSection:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem' },
  groupHeader:     { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' },
  groupIcon:       { fontSize: '1.3rem' },
  groupTitle:      { margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', flex: 1 },
  countChip:       { padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 },

  materialGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  materialCard:    { background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '1.1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardTop:         { marginBottom: '0.6rem' },
  mTitle:          { margin: '0 0 0.4rem', fontSize: '0.98rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4 },
  typeBadge:       { display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 },
  mDesc:           { margin: '0 0 1rem', color: '#666', fontSize: '0.85rem', lineHeight: 1.5 },
  cardBottom:      { marginTop: 'auto', paddingTop: '0.5rem' },
  openBtn:         { display: 'inline-block', background: '#1a1a2e', color: '#fff', padding: '0.45rem 1rem', borderRadius: '7px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' },
};
