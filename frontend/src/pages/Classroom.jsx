import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Classroom() {
  const { student } = useAuth();

  const [courses,        setCourses]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [liveClasses,    setLiveClasses]    = useState([]);
  const [homeworkList,   setHomeworkList]   = useState([]);
  const [submissions,    setSubmissions]    = useState({}); // { homeworkId: submissionObj }
  const [announcements,  setAnnouncements]  = useState([]);

  const [loading,        setLoading]        = useState(true);
  const [joiningId,      setJoiningId]      = useState(null);
  const [submittingId,   setSubmittingId]   = useState(null);
  const [subForms,       setSubForms]       = useState({}); // { homeworkId: { submissionLink, note } }
  const [msg,            setMsg]            = useState({ id: '', type: '', text: '' });

  // 1. Fetch courses and select student's default course
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        const list = data.data || [];
        setCourses(list);

        if (list.length > 0) {
          const studentGrade = String(student?.grade || '12');
          const matched = list.find((c) => String(c.grade) === studentGrade) || list[0];
          setSelectedCourse(matched);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, [student]);

  // 2. Fetch classroom data for selected course
  const loadClassroomData = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const courseId = selectedCourse._id;
      const [liveRes, hwRes, annRes] = await Promise.all([
        api.get(`/live-classes?courseId=${courseId}`),
        api.get(`/homework?courseId=${courseId}`),
        api.get(`/announcements?courseId=${courseId}`),
      ]);

      const hwItems = hwRes.data.data || [];
      setLiveClasses(liveRes.data.data || []);
      setHomeworkList(hwItems);
      setAnnouncements(annRes.data.data || []);

      // Fetch student's submissions for homework items
      const subMap = {};
      const formMap = {};
      await Promise.all(
        hwItems.map(async (hw) => {
          try {
            const { data } = await api.get(`/homework/${hw._id}/my-submission`);
            if (data.data) {
              subMap[hw._id] = data.data;
              formMap[hw._id] = {
                submissionLink: data.data.submissionLink || '',
                note: data.data.note || '',
              };
            } else {
              formMap[hw._id] = { submissionLink: '', note: '' };
            }
          } catch (e) {
            formMap[hw._id] = { submissionLink: '', note: '' };
          }
        })
      );
      setSubmissions(subMap);
      setSubForms(formMap);

    } catch (err) {
      console.error('Error loading classroom:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => { loadClassroomData(); }, [loadClassroomData]);

  // Handle joining live class
  const handleJoin = async (liveClassId) => {
    setJoiningId(liveClassId);
    try {
      const { data } = await api.post(`/live-classes/${liveClassId}/join`);
      if (data.meetingLink) {
        window.open(data.meetingLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      alert('Failed to join class: ' + err.message);
    } finally {
      setJoiningId(null);
    }
  };

  // Handle homework submission
  const handleHomeworkSubmit = async (e, homeworkId) => {
    e.preventDefault();
    const form = subForms[homeworkId] || {};
    if (!form.submissionLink?.trim()) {
      setMsg({ id: homeworkId, type: 'error', text: 'Please provide a valid link to your homework.' });
      return;
    }

    setSubmittingId(homeworkId);
    setMsg({ id: homeworkId, type: '', text: '' });
    try {
      const { data } = await api.post(`/homework/${homeworkId}/submit`, form);
      setSubmissions((prev) => ({ ...prev, [homeworkId]: data.data }));
      setMsg({ id: homeworkId, type: 'success', text: '✓ Homework submitted successfully!' });
    } catch (err) {
      setMsg({ id: homeworkId, type: 'error', text: 'Submission failed: ' + err.message });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSubFormChange = (hwId, field, val) => {
    setSubForms((prev) => ({
      ...prev,
      [hwId]: {
        ...prev[hwId],
        [field]: val,
      },
    }));
  };

  // Filter classes into Today's, Upcoming, and Past
  const now = new Date();
  const isToday = (d) => {
    const target = new Date(d);
    return (
      target.getDate() === now.getDate() &&
      target.getMonth() === now.getMonth() &&
      target.getFullYear() === now.getFullYear()
    );
  };

  const todaysClasses = liveClasses.filter((c) => isToday(c.scheduledAt));
  const upcomingClasses = liveClasses.filter(
    (c) => new Date(c.scheduledAt) > now && !isToday(c.scheduledAt)
  );
  const pastClasses = liveClasses.filter(
    (c) => new Date(c.scheduledAt) <= now && !isToday(c.scheduledAt)
  );

  return (
    <div style={s.page} className="classroom-page">
      <style>{`
        @media (max-width: 768px) {
          .classroom-page {
            padding: 1.5rem 1rem 4rem !important;
          }
          .classroom-layout {
            grid-template-columns: 1fr !important;
          }
          .classroom-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .classroom-course-selector {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .classroom-today-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          .classroom-today-card button {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Header */}
      <header style={s.header} className="classroom-header">
        <div>
          <h1 style={s.title}>🖥️ Online Classroom</h1>
          <p style={s.sub}>Live lectures, homework assignments, and announcements</p>
        </div>

        {/* Course Filter */}
        <div style={s.courseSelector} className="classroom-course-selector">
          <label style={s.cLabel} htmlFor="course-select">Grade / Course:</label>
          <select
            id="course-select"
            value={selectedCourse?._id || ''}
            onChange={(e) => {
              const found = courses.find((c) => c._id === e.target.value);
              if (found) setSelectedCourse(found);
            }}
            style={s.cSelect}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                Grade {c.grade} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div style={s.loadingState}>Loading classroom details…</div>
      ) : (
        <main style={s.mainLayout} className="classroom-layout">

          {/* Left Column: Live Classes & Homework */}
          <div style={s.leftCol}>

            {/* 1. Today's Class Banner */}
            {todaysClasses.length > 0 && (
              <section style={s.todayBanner}>
                <div style={s.todayBadge}>🔴 LIVE TODAY</div>
                {todaysClasses.map((cls) => (
                  <div key={cls._id} style={s.todayCard} className="classroom-today-card">
                    <div style={{ flex: 1 }}>
                      <h2 style={s.todayTitle}>{cls.title}</h2>
                      <p style={s.todayMeta}>
                        🕒 {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} mins)
                      </p>
                      {cls.description && <p style={s.todayDesc}>{cls.description}</p>}
                    </div>
                    <button
                      onClick={() => handleJoin(cls._id)}
                      disabled={joiningId === cls._id}
                      style={s.joinBtn}
                    >
                      {joiningId === cls._id ? 'Joining…' : '🎥 Join Live Class'}
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* 2. Upcoming Classes */}
            <section style={s.sectionCard}>
              <h2 style={s.sectionTitle}>📅 Upcoming Live Classes</h2>
              {upcomingClasses.length === 0 ? (
                <p style={s.emptyText}>No upcoming classes scheduled for this course.</p>
              ) : (
                <div style={s.classList}>
                  {upcomingClasses.map((cls) => (
                    <div key={cls._id} style={s.classRow}>
                      <div style={{ flex: 1 }}>
                        <h3 style={s.cTitle}>{cls.title}</h3>
                        <p style={s.cDate}>
                          🗓️ {new Date(cls.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} mins)
                        </p>
                        {cls.description && <p style={s.cDesc}>{cls.description}</p>}
                      </div>
                      <button
                        onClick={() => handleJoin(cls._id)}
                        disabled={joiningId === cls._id}
                        style={s.joinBtnSmall}
                      >
                        Join Link ↗
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Past Classes & Recordings */}
            <section style={s.sectionCard}>
              <h2 style={s.sectionTitle}>📹 Past Classes &amp; Recordings</h2>
              {pastClasses.length === 0 ? (
                <p style={s.emptyText}>No past class recordings available yet.</p>
              ) : (
                <div style={s.classList}>
                  {pastClasses.map((cls) => (
                    <div key={cls._id} style={s.classRow}>
                      <div style={{ flex: 1 }}>
                        <h3 style={s.cTitle}>{cls.title}</h3>
                        <p style={s.cDate}>
                          Held on {new Date(cls.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                      {cls.recordingUrl ? (
                        <a
                          href={cls.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={s.recBtn}
                        >
                          ▶ Watch Recording ↗
                        </a>
                      ) : (
                        <span style={s.noRec}>Recording Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Homework Section */}
            <section style={s.sectionCard}>
              <h2 style={s.sectionTitle}>📝 Homework &amp; Assignments</h2>
              {homeworkList.length === 0 ? (
                <p style={s.emptyText}>No active homework assignments for this course.</p>
              ) : (
                <div style={s.hwList}>
                  {homeworkList.map((hw) => {
                    const sub = submissions[hw._id];
                    const isOverdue = new Date(hw.dueDate) < now && !sub;
                    const formVal = subForms[hw._id] || { submissionLink: '', note: '' };

                    return (
                      <div key={hw._id} style={s.hwCard}>
                        <div style={s.hwHeader}>
                          <h3 style={s.hwTitle}>{hw.title}</h3>
                          <span style={{ ...s.dueBadge, color: isOverdue ? '#b91c1c' : '#555', background: isOverdue ? '#fee2e2' : '#f3f4f6' }}>
                            Due: {new Date(hw.dueDate).toLocaleDateString()} at {new Date(hw.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {hw.description && <p style={s.hwDesc}>{hw.description}</p>}

                        {hw.resourceLink && (
                          <div style={{ marginBottom: '0.85rem' }}>
                            <a href={hw.resourceLink} target="_blank" rel="noreferrer" style={s.resLink}>
                              📎 Download Worksheet / Resource ↗
                            </a>
                          </div>
                        )}

                        {/* Submission status & form */}
                        <div style={s.subBox}>
                          {sub && (
                            <div style={s.doneBar}>
                              <span>✓ Submitted on {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <a href={sub.submissionLink} target="_blank" rel="noreferrer" style={s.subLink}>View Link ↗</a>
                            </div>
                          )}

                          <form onSubmit={(e) => handleHomeworkSubmit(e, hw._id)} style={{ marginTop: sub ? '0.75rem' : 0 }}>
                            <label style={s.fieldLabel}>
                              {sub ? 'Update Submission Link (Drive / Photos):' : 'Submission Link (Google Drive / OneDrive / Photos):'}
                            </label>
                            <input
                              type="url"
                              value={formVal.submissionLink}
                              onChange={(e) => handleSubFormChange(hw._id, 'submissionLink', e.target.value)}
                              placeholder="https://drive.google.com/file/d/..."
                              style={s.input}
                              required
                            />

                            <input
                              type="text"
                              value={formVal.note}
                              onChange={(e) => handleSubFormChange(hw._id, 'note', e.target.value)}
                              placeholder="Optional note to instructor..."
                              style={{ ...s.input, marginTop: '0.5rem' }}
                            />

                            {msg.id === hw._id && msg.text && (
                              <p style={msg.type === 'success' ? s.msgOk : s.msgErr}>{msg.text}</p>
                            )}

                            <button
                              type="submit"
                              disabled={submittingId === hw._id}
                              style={s.subBtn}
                            >
                              {submittingId === hw._id ? 'Submitting…' : sub ? 'Update Submission' : 'Submit Homework'}
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Announcements Feed */}
          <div style={s.rightCol}>
            <section style={s.sectionCard}>
              <h2 style={s.sectionTitle}>📢 Classroom Announcements</h2>
              {announcements.length === 0 ? (
                <p style={s.emptyText}>No announcements posted yet.</p>
              ) : (
                <div style={s.annList}>
                  {announcements.map((ann) => (
                    <div key={ann._id} style={s.annCard}>
                      <div style={s.annHeader}>
                        <h3 style={s.annTitle}>{ann.title}</h3>
                        {!ann.courseId ? (
                          <span style={s.genBadge}>General</span>
                        ) : (
                          <span style={s.courseBadge}>Course Notice</span>
                        )}
                      </div>
                      <p style={s.annMsg}>{ann.message}</p>
                      <span style={s.annDate}>
                        Posted {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </main>
      )}
    </div>
  );
}

const s = {
  page:         { maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title:        { fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.4rem' },
  sub:          { color: '#666', fontSize: '0.95rem', margin: 0 },

  courseSelector: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb' },
  cLabel:         { fontWeight: 700, fontSize: '0.88rem', color: '#1a1a2e' },
  cSelect:        { padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' },

  loadingState: { textAlign: 'center', padding: '4rem', color: '#888' },

  mainLayout:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' },
  leftCol:      { display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 2 },
  rightCol:     { display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 },

  /* Today's Banner */
  todayBanner: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '16px', padding: '1.75rem', color: '#fff' },
  todayBadge:  { display: 'inline-block', background: '#e94560', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' },
  todayCard:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  todayTitle:  { fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#fff' },
  todayMeta:   { fontSize: '0.9rem', color: '#64748b', margin: '0 0 0.5rem' },
  todayDesc:   { fontSize: '0.88rem', color: '#cbd5e1', margin: 0 },
  joinBtn:     { background: '#e94560', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' },

  /* Sections */
  sectionCard:  { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem' },
  sectionTitle: { margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.65rem' },
  emptyText:    { color: '#888', fontSize: '0.9rem', margin: 0 },

  classList: { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  classRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f0f0f0', gap: '1rem', flexWrap: 'wrap' },
  cTitle:    { margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e' },
  cDate:     { margin: 0, fontSize: '0.82rem', color: '#666' },
  cDesc:     { margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#777' },

  joinBtnSmall: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' },
  recBtn:       { background: '#ff0000', color: '#fff', textDecoration: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.83rem' },
  noRec:        { fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' },

  /* Homework */
  hwList:   { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  hwCard:   { background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' },
  hwHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' },
  hwTitle:  { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' },
  dueBadge: { padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 },
  hwDesc:   { margin: '0 0 0.85rem', color: '#555', fontSize: '0.88rem', lineHeight: 1.5 },
  resLink:  { color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' },

  subBox:     { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' },
  doneBar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', color: '#15803d', padding: '0.55rem 0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.83rem', marginBottom: '0.75rem' },
  subLink:    { color: '#15803d', textDecoration: 'underline' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#444', marginBottom: '0.35rem' },
  input:      { width: '100%', padding: '0.55rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.88rem', boxSizing: 'border-box' },
  subBtn:     { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.65rem' },
  msgOk:      { color: '#15803d', fontSize: '0.82rem', fontWeight: 600, margin: '0.4rem 0 0' },
  msgErr:     { color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600, margin: '0.4rem 0 0' },

  /* Announcements */
  annList:     { display: 'flex', flexDirection: 'column', gap: '1rem' },
  annCard:     { background: '#fff8f8', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem' },
  annHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  annTitle:    { margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#991b1b' },
  genBadge:    { background: '#e0e7ff', color: '#3730a3', padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 },
  courseBadge: { background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 },
  annMsg:      { margin: '0 0 0.5rem', color: '#444', fontSize: '0.88rem', lineHeight: 1.55 },
  annDate:     { fontSize: '0.75rem', color: '#888' },
};
