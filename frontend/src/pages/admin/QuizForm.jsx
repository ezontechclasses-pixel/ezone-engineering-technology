import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

// ─── Blank question template ──────────────────────────────────────────────────
const blankQuestion = () => ({
  _tempId:       Date.now() + Math.random(), // React key only, stripped before save
  question:      '',
  options:       ['', '', '', ''],
  correctAnswer: '',
  explanation:   '',
});

export default function QuizForm() {
  const { quizId } = useParams();          // present on edit, absent on new
  const isEdit     = Boolean(quizId);
  const navigate   = useNavigate();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [lessonId,   setLessonId]   = useState('');
  const [questions,  setQuestions]  = useState([blankQuestion()]);
  const [lessons,    setLessons]    = useState([]);   // dropdown options
  const [saving,     setSaving]     = useState(false);
  const [loadingData,setLoadingData]= useState(true);
  const [errors,     setErrors]     = useState({});   // field-level validation msgs

  // ── Load lessons dropdown + existing quiz (edit mode) ─────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [lessonsRes, quizRes] = await Promise.all([
          adminApi.get('/lessons/all-flat'),
          isEdit ? adminApi.get(`/quizzes/${quizId}/full`) : Promise.resolve(null),
        ]);

        setLessons(lessonsRes.data.data);

        if (quizRes) {
          const q = quizRes.data.data;
          setLessonId(String(q.lessonId?._id || q.lessonId || ''));
          setQuestions(
            q.questions.map((qq) => ({
              _tempId:       qq._id,
              _id:           qq._id,     // keep real _id for updates
              question:      qq.question,
              options:       qq.options.length >= 4 ? qq.options : [...qq.options, ...Array(4 - qq.options.length).fill('')],
              correctAnswer: qq.correctAnswer,
              explanation:   qq.explanation || '',
            }))
          );
        }
      } catch (err) {
        alert('Failed to load data: ' + err.message);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [quizId, isEdit]);

  // ── Question helpers ────────────────────────────────────────────────────────
  const addQuestion = () =>
    setQuestions((prev) => [...prev, blankQuestion()]);

  const removeQuestion = (tempId) =>
    setQuestions((prev) => prev.filter((q) => q._tempId !== tempId));

  const updateQuestion = useCallback((tempId, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => q._tempId === tempId ? { ...q, [field]: value } : q)
    );
  }, []);

  const updateOption = useCallback((tempId, idx, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._tempId !== tempId) return q;
        const opts = [...q.options];
        opts[idx] = value;
        return { ...q, options: opts };
      })
    );
  }, []);

  const setCorrect = useCallback((tempId, option) => {
    setQuestions((prev) =>
      prev.map((q) => q._tempId === tempId ? { ...q, correctAnswer: option } : q)
    );
  }, []);

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!lessonId) e.lessonId = 'Please select a lesson.';

    questions.forEach((q, i) => {
      const prefix = `q${i}`;
      if (!q.question.trim())              e[`${prefix}_question`]  = 'Question text required.';
      const filledOpts = q.options.filter((o) => o.trim());
      if (filledOpts.length < 2)           e[`${prefix}_options`]   = 'At least 2 options required.';
      if (!q.correctAnswer)                e[`${prefix}_correct`]   = 'Mark the correct answer.';
      if (q.correctAnswer && !q.options.includes(q.correctAnswer))
                                           e[`${prefix}_correct`]   = 'Correct answer must match one of the options.';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    // Strip _tempId before sending; keep _id if it exists (Mongoose needs it for sub-docs)
    const payload = {
      lessonId,
      questions: questions.map(({ _tempId, ...rest }) => rest),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.put(`/quizzes/${quizId}`, payload);
      } else {
        await adminApi.post('/quizzes', payload);
      }
      navigate('/admin/quizzes');
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

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div style={s.page}>
        <AdminHeader title={isEdit ? 'Edit Quiz' : 'New Quiz'} onLogout={handleLogout} />
        <p style={s.loading}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <AdminHeader title={isEdit ? 'Edit Quiz' : 'Create New Quiz'} onLogout={handleLogout} />

      <main style={s.main}>
        {/* Back link */}
        <Link to="/admin/quizzes" style={s.back}>← Back to Quizzes</Link>
        <h1 style={s.h1}>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>

        {/* Lesson picker */}
        <section style={s.section}>
          <label style={s.label}>Lesson *</label>
          <select
            id="quiz-lesson"
            value={lessonId}
            onChange={(e) => { setLessonId(e.target.value); setErrors((p) => ({ ...p, lessonId: '' })); }}
            style={{ ...s.input, ...(errors.lessonId ? s.inputError : {}) }}
          >
            <option value="">— Select a lesson —</option>
            {lessons.map((l) => (
              <option key={l._id} value={l._id}>{l.label}</option>
            ))}
          </select>
          {errors.lessonId && <p style={s.errMsg}>{errors.lessonId}</p>}
        </section>

        {/* Questions */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.h2}>Questions ({questions.length})</h2>
            <button onClick={addQuestion} style={s.addQBtn}>+ Add Question</button>
          </div>

          {questions.map((q, idx) => (
            <QuestionBlock
              key={q._tempId}
              q={q}
              idx={idx}
              errors={errors}
              onUpdate={updateQuestion}
              onOptionChange={updateOption}
              onSetCorrect={setCorrect}
              onRemove={() => removeQuestion(q._tempId)}
              canRemove={questions.length > 1}
            />
          ))}
        </section>

        {/* Save */}
        <div style={s.saveRow}>
          <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
            {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '✓ Create Quiz'}
          </button>
          <Link to="/admin/quizzes" style={s.cancelBtn}>Cancel</Link>
        </div>
      </main>
    </div>
  );
}

// ─── Question block component ─────────────────────────────────────────────────
function QuestionBlock({ q, idx, errors, onUpdate, onOptionChange, onSetCorrect, onRemove, canRemove }) {
  const p = `q${idx}`;
  return (
    <div style={s.qBlock}>
      {/* Header */}
      <div style={s.qHeader}>
        <span style={s.qNum}>Q{idx + 1}</span>
        {canRemove && (
          <button onClick={onRemove} style={s.removeBtn} title="Remove question">✕ Remove</button>
        )}
      </div>

      {/* Question text */}
      <div style={s.field}>
        <label style={s.label}>Question *</label>
        <textarea
          value={q.question}
          onChange={(e) => onUpdate(q._tempId, 'question', e.target.value)}
          rows={2}
          style={{ ...s.textarea, ...(errors[`${p}_question`] ? s.inputError : {}) }}
          placeholder="Enter the question…"
        />
        {errors[`${p}_question`] && <p style={s.errMsg}>{errors[`${p}_question`]}</p>}
      </div>

      {/* Options */}
      <div style={s.field}>
        <label style={s.label}>Options * <span style={s.hint}>(select the radio button for the correct answer)</span></label>
        {errors[`${p}_options`]  && <p style={s.errMsg}>{errors[`${p}_options`]}</p>}
        {errors[`${p}_correct`]  && <p style={s.errMsg}>{errors[`${p}_correct`]}</p>}

        <div style={s.optionsGrid}>
          {q.options.map((opt, oi) => {
            const isCorrect = q.correctAnswer === opt && opt.trim() !== '';
            return (
              <div key={oi} style={{ ...s.optionRow, ...(isCorrect ? s.optionRowCorrect : {}) }}>
                <input
                  type="radio"
                  name={`correct-${q._tempId}`}
                  id={`opt-${q._tempId}-${oi}`}
                  checked={isCorrect}
                  onChange={() => opt.trim() && onSetCorrect(q._tempId, opt)}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    // If this was the correct answer and the text changes, clear correctAnswer
                    if (q.correctAnswer === opt) onSetCorrect(q._tempId, '');
                    onOptionChange(q._tempId, oi, e.target.value);
                  }}
                  style={s.optionInput}
                  placeholder={`Option ${oi + 1}`}
                />
                <label htmlFor={`opt-${q._tempId}-${oi}`} style={s.correctLabel}>
                  {isCorrect ? '✓ Correct' : ''}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div style={s.field}>
        <label style={s.label}>Explanation <span style={s.hint}>(optional — shown to students after submission)</span></label>
        <textarea
          value={q.explanation}
          onChange={(e) => onUpdate(q._tempId, 'explanation', e.target.value)}
          rows={2}
          style={s.textarea}
          placeholder="Explain why the correct answer is correct…"
        />
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:    { minHeight: '100vh', background: '#f5f6fa' },
  main:    { maxWidth: 820, margin: '0 auto', padding: '1.5rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#888' },
  back:    { color: '#1d4ed8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '1rem' },
  h1:      { fontSize: '1.5rem', fontWeight: 900, color: '#1a1a2e', marginBottom: '1.5rem' },
  h2:      { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e' },

  section:       { marginBottom: '1.5rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },

  label:    { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#333', marginBottom: '0.35rem' },
  hint:     { fontWeight: 400, color: '#999', fontSize: '0.78rem' },
  input:    { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fff' },
  textarea: { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', background: '#fff', fontFamily: 'inherit' },
  inputError: { borderColor: '#e94560', background: '#fff8f8' },
  errMsg:   { color: '#c0392b', fontSize: '0.8rem', margin: '0.25rem 0 0' },

  field: { marginBottom: '1rem' },

  qBlock:  { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' },
  qHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  qNum:    { background: '#1a1a2e', color: '#fff', borderRadius: '6px', padding: '0.2rem 0.6rem', fontWeight: 800, fontSize: '0.85rem' },

  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  optionRow:   { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #eee', background: '#fafafa' },
  optionRowCorrect: { border: '1px solid #86efac', background: '#f0fdf4' },
  optionInput: { flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' },
  correctLabel:{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, minWidth: 56 },

  addQBtn:   { background: '#f0f4ff', color: '#1d4ed8', border: '1px solid #c7d2fe', padding: '0.45rem 1rem', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  removeBtn: { background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },

  saveRow:   { display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', paddingBottom: '3rem' },
  saveBtn:   { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' },
  cancelBtn: { color: '#666', textDecoration: 'none', fontSize: '0.9rem' },
};
