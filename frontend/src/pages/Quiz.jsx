import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

// ─── Phase constants ──────────────────────────────────────────────────────────
const PHASE = { LOADING: 'loading', START: 'start', QUIZ: 'quiz', RESULTS: 'results', ERROR: 'error' };

export default function Quiz() {
  const { lessonId } = useParams();
  const navigate     = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [phase,       setPhase]       = useState(PHASE.LOADING);
  const [quiz,        setQuiz]        = useState(null);          // { _id, questions[], total }
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [answers,     setAnswers]     = useState({});            // { [questionId]: selectedAnswer }
  const [submitting,  setSubmitting]  = useState(false);
  const [results,     setResults]     = useState(null);          // server response on submit
  const [errorMsg,    setErrorMsg]    = useState('');

  // ── Fetch quiz on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get(`/quizzes/lesson/${lessonId}`);
        if (!cancelled) {
          setQuiz(data.data);
          setPhase(PHASE.START);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message);
          setPhase(PHASE.ERROR);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [lessonId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleStart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setResults(null);
    setPhase(PHASE.QUIZ);
  };

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => setCurrentIdx((i) => Math.min(i + 1, quiz.questions.length - 1));
  const handlePrev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId:     q._id,
        selectedAnswer: answers[q._id] ?? null,
      }));
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers: payload });
      setResults(data.data);
      setPhase(PHASE.RESULTS);
    } catch (err) {
      setErrorMsg(err.message);
      setPhase(PHASE.ERROR);
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers]);

  const handleRetry = () => handleStart();

  // ── Derived ─────────────────────────────────────────────────────────────────
  const question      = quiz?.questions[currentIdx];
  const isLast        = quiz && currentIdx === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress      = quiz ? Math.round(((currentIdx + 1) / quiz.questions.length) * 100) : 0;

  // ────────────────────────────────────────────────────────────────────────────
  // Render phases
  // ────────────────────────────────────────────────────────────────────────────

  if (phase === PHASE.LOADING) {
    return (
      <div style={s.centred}>
        <span style={s.bigEmoji}>⏳</span>
        <p style={s.statusText}>Loading quiz…</p>
      </div>
    );
  }

  if (phase === PHASE.ERROR) {
    return (
      <div style={s.centred}>
        <span style={s.bigEmoji}>⚠️</span>
        <p style={{ ...s.statusText, color: '#e94560' }}>{errorMsg}</p>
        <button onClick={() => navigate(-1)} style={s.btnSecondary}>← Go back</button>
      </div>
    );
  }

  // ── START screen ─────────────────────────────────────────────────────────────
  if (phase === PHASE.START) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <span style={{ fontSize: '3rem' }}>📝</span>
          <h1 style={s.h1}>Quiz</h1>
          <div style={s.infoGrid}>
            <InfoChip label="Questions" value={quiz.total} />
            <InfoChip label="Type"      value="MCQ" />
          </div>
          <p style={s.startHint}>
            Read each question carefully. You can navigate back and change answers before submitting.
          </p>
          <button onClick={handleStart} style={s.btnPrimary}>Start Quiz →</button>
          <button onClick={() => navigate(-1)} style={{ ...s.btnSecondary, marginTop: '0.75rem' }}>
            ← Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ screen ───────────────────────────────────────────────────────────────
  if (phase === PHASE.QUIZ) {
    return (
      <div style={s.page}>
        <div style={s.quizWrap}>

          {/* Header */}
          <div style={s.quizHeader}>
            <span style={s.quizMeta}>Question {currentIdx + 1} of {quiz.questions.length}</span>
            <span style={s.answeredBadge}>{answeredCount} answered</span>
          </div>

          {/* Progress bar */}
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>

          {/* Question card */}
          <div style={s.questionCard}>
            <p style={s.questionText}>{question.question}</p>

            <div style={s.optionsList}>
              {question.options.map((opt, i) => {
                const selected = answers[question._id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(question._id, opt)}
                    style={selected ? s.optionSelected : s.option}
                  >
                    <span style={selected ? s.radioOn : s.radioOff} />
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div style={s.navRow}>
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              style={currentIdx === 0 ? s.btnDisabled : s.btnSecondary}
            >
              ← Previous
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={s.btnSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit Quiz ✓'}
              </button>
            ) : (
              <button onClick={handleNext} style={s.btnPrimary}>
                Next →
              </button>
            )}
          </div>

          {/* Question dots navigator */}
          <div style={s.dots}>
            {quiz.questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentIdx(i)}
                style={
                  i === currentIdx
                    ? s.dotActive
                    : answers[q._id]
                      ? s.dotAnswered
                      : s.dot
                }
                title={`Question ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ── RESULTS screen ────────────────────────────────────────────────────────────
  if (phase === PHASE.RESULTS && results) {
    const passed = results.percentage >= 50;

    return (
      <div style={s.page}>
        <div style={s.resultsWrap}>

          {/* Score card */}
          <div style={{ ...s.scoreCard, borderColor: passed ? '#22c55e' : '#e94560' }}>
            <span style={s.scoreTrophy}>{passed ? '🏆' : '📋'}</span>
            <h1 style={s.scoreTitle}>{passed ? 'Well done!' : 'Keep practising!'}</h1>
            <div style={s.scoreCircle}>
              <span style={{ ...s.scorePct, color: passed ? '#22c55e' : '#e94560' }}>
                {results.percentage}%
              </span>
              <span style={s.scoreRaw}>{results.score} / {results.total} correct</span>
            </div>
            <div style={s.resultActions}>
              <button onClick={handleRetry} style={s.btnSecondary}>🔁 Try Again</button>
              <button onClick={() => navigate(-1)} style={s.btnPrimary}>← Back to Lesson</button>
            </div>
          </div>

          {/* Per-question review */}
          <h2 style={s.reviewTitle}>Review</h2>
          <div style={s.reviewList}>
            {results.results.map((r, i) => (
              <div key={String(r.questionId)} style={r.correct ? s.reviewItemCorrect : s.reviewItemWrong}>
                <div style={s.reviewQ}>
                  <span style={r.correct ? s.reviewIcon : s.reviewIconWrong}>
                    {r.correct ? '✓' : '✗'}
                  </span>
                  <p style={s.reviewQText}><strong>Q{i + 1}.</strong> {r.question}</p>
                </div>

                <div style={s.reviewAnswers}>
                  <ReviewAnswer
                    label="Your answer"
                    value={r.selectedAnswer ?? '(not answered)'}
                    type={r.correct ? 'correct' : 'wrong'}
                  />
                  {!r.correct && (
                    <ReviewAnswer
                      label="Correct answer"
                      value={r.correctAnswer}
                      type="correct"
                    />
                  )}
                </div>

                {r.explanation && (
                  <p style={s.explanation}>
                    <strong>💡 Explanation:</strong> {r.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ ...s.resultActions, marginTop: '2rem' }}>
            <button onClick={handleRetry} style={s.btnSecondary}>🔁 Try Again</button>
            <Link to="/courses" style={s.btnPrimary}>← Back to Courses</Link>
          </div>

        </div>
      </div>
    );
  }

  return null;
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function InfoChip({ label, value }) {
  return (
    <div style={s.infoChip}>
      <span style={s.infoChipVal}>{value}</span>
      <span style={s.infoChipLbl}>{label}</span>
    </div>
  );
}

function ReviewAnswer({ label, value, type }) {
  const bg    = type === 'correct' ? '#dcfce7' : '#fee2e2';
  const color = type === 'correct' ? '#15803d' : '#b91c1c';
  return (
    <div style={{ ...s.reviewAnswerTag, background: bg, color }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7 }}>{label}: </span>
      {value}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:    { minHeight: '80vh', background: '#f8f9ff', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem' },
  centred: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' },
  bigEmoji:   { fontSize: '3.5rem' },
  statusText: { color: '#666', fontSize: '1rem' },

  // ── Start card ──
  card: { background: '#fff', borderRadius: '16px', padding: '3rem 2.5rem', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' },
  h1:   { fontSize: '1.8rem', fontWeight: 900, color: '#1a1a2e', margin: 0 },
  infoGrid: { display: 'flex', gap: '1.5rem' },
  infoChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f0f4ff', borderRadius: '10px', padding: '0.75rem 1.25rem' },
  infoChipVal: { fontSize: '1.4rem', fontWeight: 900, color: '#1a1a2e' },
  infoChipLbl: { fontSize: '0.75rem', color: '#888', marginTop: '0.15rem' },
  startHint: { color: '#666', fontSize: '0.9rem', maxWidth: 340, lineHeight: 1.65, margin: '0.5rem 0' },

  // ── Quiz wrap ──
  quizWrap:   { background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: 680, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  quizMeta:   { fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' },
  answeredBadge: { background: '#f0f4ff', color: '#4f46e5', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '20px' },

  // Progress bar
  progressTrack: { height: 6, background: '#f0f0f0', borderRadius: 4, marginBottom: '1.75rem', overflow: 'hidden' },
  progressFill:  { height: '100%', background: '#e94560', borderRadius: 4, transition: 'width 0.3s ease' },

  // Question
  questionCard: { marginBottom: '1.75rem' },
  questionText: { fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.65, marginBottom: '1.25rem' },
  optionsList:  { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  option: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1.1rem', borderRadius: '10px',
    border: '2px solid #e5e7eb', background: '#fff',
    cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', color: '#333',
    transition: 'border-color 0.15s, background 0.15s', width: '100%',
  },
  optionSelected: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1.1rem', borderRadius: '10px',
    border: '2px solid #e94560', background: '#fff5f7',
    cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', color: '#1a1a2e',
    fontWeight: 600, width: '100%',
  },
  radioOff: { width: 18, height: 18, borderRadius: '50%', border: '2px solid #ccc', flexShrink: 0 },
  radioOn:  { width: 18, height: 18, borderRadius: '50%', border: '2px solid #e94560', background: '#e94560', flexShrink: 0 },

  // Navigation
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' },

  // Dots
  dots: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1.5rem', justifyContent: 'center' },
  dot:        { width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb', border: 'none', cursor: 'pointer', padding: 0 },
  dotAnswered:{ width: 10, height: 10, borderRadius: '50%', background: '#a5b4fc', border: 'none', cursor: 'pointer', padding: 0 },
  dotActive:  { width: 10, height: 10, borderRadius: '50%', background: '#e94560', border: 'none', cursor: 'pointer', padding: 0 },

  // Results
  resultsWrap: { maxWidth: 720, width: '100%' },
  scoreCard:   { background: '#fff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '2px solid', marginBottom: '2rem' },
  scoreTrophy: { fontSize: '3rem', display: 'block', marginBottom: '0.5rem' },
  scoreTitle:  { fontSize: '1.6rem', fontWeight: 900, color: '#1a1a2e', marginBottom: '1.25rem' },
  scoreCircle: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' },
  scorePct:    { fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 },
  scoreRaw:    { color: '#888', fontSize: '0.9rem', marginTop: '0.4rem' },
  resultActions: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },

  reviewTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1rem' },
  reviewList:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  reviewItemCorrect: { background: '#fff', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e', borderRadius: '10px', padding: '1.25rem' },
  reviewItemWrong:   { background: '#fff', border: '1px solid #fecaca', borderLeft: '4px solid #e94560', borderRadius: '10px', padding: '1.25rem' },
  reviewQ:     { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' },
  reviewIcon:     { width: 22, height: 22, borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', flexShrink: 0 },
  reviewIconWrong:{ width: 22, height: 22, borderRadius: '50%', background: '#e94560', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', flexShrink: 0 },
  reviewQText: { margin: 0, lineHeight: 1.6, color: '#1a1a2e', fontSize: '0.95rem' },
  reviewAnswers: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  reviewAnswerTag: { padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 600 },
  explanation: { margin: 0, color: '#555', fontSize: '0.88rem', lineHeight: 1.65, borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' },

  // Buttons
  btnPrimary:   { display: 'inline-block', background: '#e94560', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', textDecoration: 'none' },
  btnSecondary: { display: 'inline-block', background: '#f3f4f6', color: '#1a1a2e', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #e5e7eb', cursor: 'pointer', textDecoration: 'none' },
  btnSubmit:    { display: 'inline-block', background: '#22c55e', color: '#fff', padding: '0.7rem 1.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' },
  btnDisabled:  { display: 'inline-block', background: '#f3f4f6', color: '#ccc', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #eee', cursor: 'not-allowed' },
};
