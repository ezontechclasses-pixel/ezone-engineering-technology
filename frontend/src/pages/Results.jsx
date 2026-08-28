import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/results/my');
        setResults(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Compute summary stats
  const totalExams = results.length;
  let avgPercentage = 0;
  let bestPercentage = 0;
  let bestExam = null;

  if (totalExams > 0) {
    let sumPct = 0;
    results.forEach((r) => {
      const pct = (r.marks / (r.maxMarks || 100)) * 100;
      sumPct += pct;
      if (pct > bestPercentage) {
        bestPercentage = pct;
        bestExam = r;
      }
    });
    avgPercentage = (sumPct / totalExams).toFixed(1);
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>🏆 Exam Results &amp; Achievements</h1>
        <p style={s.sub}>Track your term test marks, grades, and academic evaluation</p>
      </header>

      {loading ? (
        <div style={s.status}>Loading your exam results…</div>
      ) : error ? (
        <div style={{ ...s.status, color: '#b91c1c' }}>Error: {error}</div>
      ) : (
        <main>
          {/* Summary Cards */}
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <span style={s.statIcon}>📊</span>
              <div>
                <p style={s.statLabel}>Average Score</p>
                <p style={s.statVal}>{totalExams > 0 ? `${avgPercentage}%` : 'N/A'}</p>
              </div>
            </div>

            <div style={s.statCard}>
              <span style={s.statIcon}>🌟</span>
              <div>
                <p style={s.statLabel}>Best Result</p>
                <p style={s.statVal}>
                  {totalExams > 0 ? `${bestPercentage.toFixed(1)}%` : 'N/A'}
                </p>
                {bestExam && <p style={s.statSub}>{bestExam.examTitle}</p>}
              </div>
            </div>

            <div style={s.statCard}>
              <span style={s.statIcon}>📝</span>
              <div>
                <p style={s.statLabel}>Total Exams</p>
                <p style={s.statVal}>{totalExams}</p>
              </div>
            </div>
          </div>

          {/* Results List */}
          {results.length === 0 ? (
            <div style={s.emptyBox}>
              <span style={{ fontSize: '3rem' }}>📜</span>
              <h3 style={{ margin: '0.75rem 0 0.25rem', color: '#1a1a2e' }}>No Exam Results Recorded</h3>
              <p style={{ color: '#666', margin: 0 }}>Your term tests and exam marks will be published here by your instructor.</p>
            </div>
          ) : (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Academic Performance History</h2>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Exam / Test Title</th>
                      <th style={s.th}>Date</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Marks</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Percentage</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Grade</th>
                      <th style={s.th}>Instructor Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => {
                      const pct = ((res.marks / (res.maxMarks || 100)) * 100).toFixed(1);
                      const isPassed = pct >= 40;
                      return (
                        <tr key={res._id} style={s.tr}>
                          <td style={s.td}>
                            <strong>{res.examTitle}</strong>
                          </td>
                          <td style={{ ...s.td, color: '#666', fontSize: '0.85rem' }}>
                            {new Date(res.date).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>
                            {res.marks} / {res.maxMarks || 100}
                          </td>
                          <td style={{ ...s.td, textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, color: isPassed ? '#15803d' : '#b91c1c' }}>
                              {pct}%
                            </span>
                          </td>
                          <td style={{ ...s.td, textAlign: 'center' }}>
                            <span style={{
                              ...s.gradeBadge,
                              background: isPassed ? '#dcfce7' : '#fee2e2',
                              color: isPassed ? '#15803d' : '#b91c1c',
                            }}>
                              {res.grade || (isPassed ? 'Pass' : 'Fail')}
                            </span>
                          </td>
                          <td style={{ ...s.td, color: '#555', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            {res.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

const s = {
  page:   { maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' },
  header: { marginBottom: '2rem' },
  title:  { fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.4rem' },
  sub:    { color: '#666', fontSize: '0.95rem', margin: 0 },

  status: { textAlign: 'center', padding: '4rem', color: '#888' },

  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
  statCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' },
  statIcon: { fontSize: '2.2rem' },
  statLabel:{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.2rem', textTransform: 'uppercase', fontWeight: 700 },
  statVal:  { fontSize: '1.6rem', fontWeight: 900, color: '#1a1a2e', margin: 0 },
  statSub:  { fontSize: '0.75rem', color: '#888', margin: '0.2rem 0 0' },

  emptyBox: { textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '3.5rem 1.5rem' },

  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem' },
  cardTitle: { margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e' },

  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th:        { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.9rem' },

  gradeBadge: { display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 },
};
