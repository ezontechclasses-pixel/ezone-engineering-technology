import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { AdminHeader } from './AdminDashboard';

export default function AdminClassroom() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'homework' | 'announcements'

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Tab Data
  const [liveClasses,   setLiveClasses]   = useState([]);
  const [homeworkList,  setHomeworkList]  = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Modals & Active Items for Sub-Views
  const [attendanceModal, setAttendanceModal] = useState({ open: false, liveClass: null, records: [], loading: false });
  const [submissionModal, setSubmissionModal] = useState({ open: false, homework: null, records: [], loading: false });

  // Forms
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [editLiveId,   setEditLiveId]   = useState(null);
  const [liveForm,     setLiveForm]     = useState({ courseId: '', title: '', description: '', meetingLink: '', scheduledAt: '', durationMinutes: 60, recordingUrl: '' });

  const [showHwForm,   setShowHwForm]   = useState(false);
  const [editHwId,     setEditHwId]     = useState(null);
  const [hwForm,       setHwForm]       = useState({ courseId: '', title: '', description: '', resourceLink: '', dueDate: '' });

  const [showAnnForm,  setShowAnnForm]  = useState(false);
  const [editAnnId,    setEditAnnId]    = useState(null);
  const [annForm,      setAnnForm]      = useState({ courseId: '', title: '', message: '' });

  // 1. Fetch courses & tab data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [crsRes, liveRes, hwRes, annRes] = await Promise.all([
        adminApi.get('/courses'),
        adminApi.get('/live-classes/all-flat'),
        adminApi.get('/homework/all-flat'),
        adminApi.get('/announcements/all-flat'),
      ]);

      const crsList = crsRes.data.data || [];
      setCourses(crsList);
      setLiveClasses(liveRes.data.data || []);
      setHomeworkList(hwRes.data.data || []);
      setAnnouncements(annRes.data.data || []);

      if (crsList.length > 0) {
        setLiveForm((prev) => ({ ...prev, courseId: prev.courseId || crsList[0]._id }));
        setHwForm((prev)   => ({ ...prev, courseId: prev.courseId || crsList[0]._id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ezone_admin_secret');
    navigate('/admin/login');
  };

  // ── LIVE CLASS ACTIONS ──────────────────────────────────────────────────
  const openNewLiveForm = () => {
    setEditLiveId(null);
    setLiveForm({
      courseId: courses[0]?._id || '',
      title: '',
      description: '',
      meetingLink: '',
      scheduledAt: new Date().toISOString().slice(0, 16),
      durationMinutes: 60,
      recordingUrl: '',
    });
    setShowLiveForm(true);
  };

  const openEditLiveForm = (cls) => {
    setEditLiveId(cls._id);
    const dateStr = cls.scheduledAt ? new Date(cls.scheduledAt).toISOString().slice(0, 16) : '';
    setLiveForm({
      courseId:        cls.courseId || courses[0]?._id || '',
      title:           cls.title || '',
      description:     cls.description || '',
      meetingLink:     cls.meetingLink || '',
      scheduledAt:     dateStr,
      durationMinutes: cls.durationMinutes || 60,
      recordingUrl:    cls.recordingUrl || '',
    });
    setShowLiveForm(true);
  };

  const handleSaveLive = async (e) => {
    e.preventDefault();
    try {
      if (editLiveId) {
        await adminApi.put(`/live-classes/${editLiveId}`, liveForm);
      } else {
        await adminApi.post('/live-classes', liveForm);
      }
      setShowLiveForm(false);
      loadData();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeleteLive = async (cls) => {
    if (!window.confirm(`Delete live class "${cls.title}"?`)) return;
    try {
      await adminApi.delete(`/live-classes/${cls._id}`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const openAttendanceModal = async (cls) => {
    setAttendanceModal({ open: true, liveClass: cls, records: [], loading: true });
    try {
      const { data } = await adminApi.get(`/live-classes/${cls._id}/attendance`);
      setAttendanceModal({ open: true, liveClass: cls, records: data.data || [], loading: false });
    } catch (err) {
      alert('Failed to load attendance: ' + err.message);
      setAttendanceModal({ open: false, liveClass: null, records: [], loading: false });
    }
  };

  // ── HOMEWORK ACTIONS ────────────────────────────────────────────────────
  const openNewHwForm = () => {
    setEditHwId(null);
    setHwForm({
      courseId: courses[0]?._id || '',
      title: '',
      description: '',
      resourceLink: '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    });
    setShowHwForm(true);
  };

  const openEditHwForm = (hw) => {
    setEditHwId(hw._id);
    const dateStr = hw.dueDate ? new Date(hw.dueDate).toISOString().slice(0, 16) : '';
    setHwForm({
      courseId:     hw.courseId || courses[0]?._id || '',
      title:        hw.title || '',
      description:  hw.description || '',
      resourceLink: hw.resourceLink || '',
      dueDate:      dateStr,
    });
    setShowHwForm(true);
  };

  const handleSaveHw = async (e) => {
    e.preventDefault();
    try {
      if (editHwId) {
        await adminApi.put(`/homework/${editHwId}`, hwForm);
      } else {
        await adminApi.post('/homework', hwForm);
      }
      setShowHwForm(false);
      loadData();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeleteHw = async (hw) => {
    if (!window.confirm(`Delete homework "${hw.title}"?`)) return;
    try {
      await adminApi.delete(`/homework/${hw._id}`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const openSubmissionsModal = async (hw) => {
    setSubmissionModal({ open: true, homework: hw, records: [], loading: true });
    try {
      const { data } = await adminApi.get(`/homework/${hw._id}/submissions`);
      setSubmissionModal({ open: true, homework: hw, records: data.data || [], loading: false });
    } catch (err) {
      alert('Failed to load submissions: ' + err.message);
      setSubmissionModal({ open: false, homework: null, records: [], loading: false });
    }
  };

  // ── ANNOUNCEMENT ACTIONS ────────────────────────────────────────────────
  const openNewAnnForm = () => {
    setEditAnnId(null);
    setAnnForm({ courseId: '', title: '', message: '' });
    setShowAnnForm(true);
  };

  const openEditAnnForm = (ann) => {
    setEditAnnId(ann._id);
    setAnnForm({
      courseId: ann.courseId || '',
      title:    ann.title || '',
      message:  ann.message || '',
    });
    setShowAnnForm(true);
  };

  const handleSaveAnn = async (e) => {
    e.preventDefault();
    try {
      if (editAnnId) {
        await adminApi.put(`/announcements/${editAnnId}`, annForm);
      } else {
        await adminApi.post('/announcements', annForm);
      }
      setShowAnnForm(false);
      loadData();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeleteAnn = async (ann) => {
    if (!window.confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await adminApi.delete(`/announcements/${ann._id}`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        .admin-tabbar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.75rem;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .admin-tabbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-main {
            padding: 1.5rem 1rem !important;
          }
          .admin-toolbar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
          .admin-classroom-grid2 {
            grid-template-columns: 1fr !important;
          }
          .admin-modal-content {
            padding: 1.25rem 1rem !important;
            width: 95% !important;
          }
        }
      `}</style>

      <AdminHeader title="Manage Online Classroom" onLogout={handleLogout} />

      <main style={s.main} className="admin-main">
        {/* Navigation Tabs */}
        <div style={s.tabBar} className="admin-tabbar">
          <button
            onClick={() => setActiveTab('live')}
            style={activeTab === 'live' ? s.tabActive : s.tab}
          >
            🎥 Live Classes ({liveClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            style={activeTab === 'homework' ? s.tabActive : s.tab}
          >
            📝 Homework ({homeworkList.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            style={activeTab === 'announcements' ? s.tabActive : s.tab}
          >
            📢 Announcements ({announcements.length})
          </button>
        </div>

        {loading && <p style={s.status}>Loading classroom data…</p>}
        {error && <p style={{ ...s.status, color: '#b91c1c' }}>Error: {error}</p>}

        {!loading && (
          <>
            {/* ── TAB 1: LIVE CLASSES ────────────────────────────────────── */}
            {activeTab === 'live' && (
              <div>
                <div style={s.toolbar} className="admin-toolbar">
                  <h2 style={s.tabH2}>Live Classes</h2>
                  <button onClick={openNewLiveForm} style={s.addBtn}>+ Schedule Live Class</button>
                </div>

                {/* Form Overlay */}
                {showLiveForm && (
                  <form onSubmit={handleSaveLive} style={s.formBox}>
                    <h3 style={s.formH3}>{editLiveId ? 'Edit Live Class' : 'Schedule New Live Class'}</h3>
                    <div style={s.grid2} className="admin-classroom-grid2">
                      <div>
                        <label style={s.label}>Course *</label>
                        <select
                          value={liveForm.courseId}
                          onChange={(e) => setLiveForm({ ...liveForm, courseId: e.target.value })}
                          style={s.input}
                          required
                        >
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>Grade {c.grade} — {c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={s.label}>Title *</label>
                        <input
                          type="text"
                          value={liveForm.title}
                          onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                          placeholder="e.g. Unit 3 Live Problem Solving"
                          style={s.input}
                          required
                        />
                      </div>
                    </div>

                    <div style={s.grid2} className="admin-classroom-grid2">
                      <div>
                        <label style={s.label}>Scheduled Date &amp; Time *</label>
                        <input
                          type="datetime-local"
                          value={liveForm.scheduledAt}
                          onChange={(e) => setLiveForm({ ...liveForm, scheduledAt: e.target.value })}
                          style={s.input}
                          required
                        />
                      </div>
                      <div>
                        <label style={s.label}>Duration (minutes)</label>
                        <input
                          type="number"
                          value={liveForm.durationMinutes}
                          onChange={(e) => setLiveForm({ ...liveForm, durationMinutes: Number(e.target.value) })}
                          style={s.input}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={s.label}>Meeting Link (Zoom / Teams / Meet) *</label>
                      <input
                        type="url"
                        value={liveForm.meetingLink}
                        onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                        style={s.input}
                        required
                      />
                    </div>

                    <div>
                      <label style={s.label}>Recording Link <span style={s.hint}>(after class ends)</span></label>
                      <input
                        type="url"
                        value={liveForm.recordingUrl}
                        onChange={(e) => setLiveForm({ ...liveForm, recordingUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... or Drive link"
                        style={s.input}
                      />
                    </div>

                    <div>
                      <label style={s.label}>Description</label>
                      <textarea
                        rows={2}
                        value={liveForm.description}
                        onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })}
                        style={s.textarea}
                      />
                    </div>

                    <div style={s.btnRow}>
                      <button type="submit" style={s.saveBtn}>Save Live Class</button>
                      <button type="button" onClick={() => setShowLiveForm(false)} style={s.cancelBtn}>Cancel</button>
                    </div>
                  </form>
                )}

                {liveClasses.length === 0 ? (
                  <p style={s.status}>No live classes scheduled yet.</p>
                ) : (
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Title</th>
                          <th style={s.th}>Course</th>
                          <th style={s.th}>Scheduled Time</th>
                          <th style={s.th}>Recording</th>
                          <th style={s.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveClasses.map((cls) => (
                          <tr key={cls._id} style={s.tr}>
                            <td style={s.td}>
                              <strong>{cls.title}</strong>
                              <br />
                              <a href={cls.meetingLink} target="_blank" rel="noreferrer" style={s.linkText}>Meeting Link ↗</a>
                            </td>
                            <td style={s.td}>{cls.courseLabel}</td>
                            <td style={s.td}>
                              {new Date(cls.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td style={s.td}>
                              {cls.recordingUrl ? (
                                <span style={s.badgeGreen}>Available</span>
                              ) : (
                                <span style={s.badgeGray}>None</span>
                              )}
                            </td>
                            <td style={s.td}>
                              <div style={s.actions}>
                                <button onClick={() => openAttendanceModal(cls)} style={s.attBtn}>Attendance</button>
                                <button onClick={() => openEditLiveForm(cls)} style={s.editBtn}>Edit</button>
                                <button onClick={() => handleDeleteLive(cls)} style={s.deleteBtn}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: HOMEWORK ────────────────────────────────────────── */}
            {activeTab === 'homework' && (
              <div>
                <div style={s.toolbar} className="admin-toolbar">
                  <h2 style={s.tabH2}>Homework &amp; Assignments</h2>
                  <button onClick={openNewHwForm} style={s.addBtn}>+ Create Homework</button>
                </div>

                {/* Form Overlay */}
                {showHwForm && (
                  <form onSubmit={handleSaveHw} style={s.formBox}>
                    <h3 style={s.formH3}>{editHwId ? 'Edit Homework' : 'Create Homework'}</h3>
                    <div style={s.grid2} className="admin-classroom-grid2">
                      <div>
                        <label style={s.label}>Course *</label>
                        <select
                          value={hwForm.courseId}
                          onChange={(e) => setHwForm({ ...hwForm, courseId: e.target.value })}
                          style={s.input}
                          required
                        >
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>Grade {c.grade} — {c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={s.label}>Title *</label>
                        <input
                          type="text"
                          value={hwForm.title}
                          onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                          placeholder="e.g. Unit 2 Past Paper Questions"
                          style={s.input}
                          required
                        />
                      </div>
                    </div>

                    <div style={s.grid2} className="admin-classroom-grid2">
                      <div>
                        <label style={s.label}>Due Date &amp; Time *</label>
                        <input
                          type="datetime-local"
                          value={hwForm.dueDate}
                          onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })}
                          style={s.input}
                          required
                        />
                      </div>
                      <div>
                        <label style={s.label}>Resource / Worksheet Link <span style={s.hint}>(optional)</span></label>
                        <input
                          type="url"
                          value={hwForm.resourceLink}
                          onChange={(e) => setHwForm({ ...hwForm, resourceLink: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          style={s.input}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={s.label}>Instructions / Description</label>
                      <textarea
                        rows={2}
                        value={hwForm.description}
                        onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                        style={s.textarea}
                      />
                    </div>

                    <div style={s.btnRow}>
                      <button type="submit" style={s.saveBtn}>Save Homework</button>
                      <button type="button" onClick={() => setShowHwForm(false)} style={s.cancelBtn}>Cancel</button>
                    </div>
                  </form>
                )}

                {homeworkList.length === 0 ? (
                  <p style={s.status}>No homework created yet.</p>
                ) : (
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Title</th>
                          <th style={s.th}>Course</th>
                          <th style={s.th}>Due Date</th>
                          <th style={s.th}>Submissions</th>
                          <th style={s.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {homeworkList.map((hw) => (
                          <tr key={hw._id} style={s.tr}>
                            <td style={s.td}><strong>{hw.title}</strong></td>
                            <td style={s.td}>{hw.courseLabel}</td>
                            <td style={s.td}>
                              {new Date(hw.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td style={s.td}>
                              <span style={s.badgeBlue}>{hw.submissionCount} submissions</span>
                            </td>
                            <td style={s.td}>
                              <div style={s.actions}>
                                <button onClick={() => openSubmissionsModal(hw)} style={s.attBtn}>View Submissions</button>
                                <button onClick={() => openEditHwForm(hw)} style={s.editBtn}>Edit</button>
                                <button onClick={() => handleDeleteHw(hw)} style={s.deleteBtn}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: ANNOUNCEMENTS ───────────────────────────────────── */}
            {activeTab === 'announcements' && (
              <div>
                <div style={s.toolbar} className="admin-toolbar">
                  <h2 style={s.tabH2}>Announcements</h2>
                  <button onClick={openNewAnnForm} style={s.addBtn}>+ Post Announcement</button>
                </div>

                {/* Form Overlay */}
                {showAnnForm && (
                  <form onSubmit={handleSaveAnn} style={s.formBox}>
                    <h3 style={s.formH3}>{editAnnId ? 'Edit Announcement' : 'Post Announcement'}</h3>
                    <div style={s.grid2} className="admin-classroom-grid2">
                      <div>
                        <label style={s.label}>Target Audience</label>
                        <select
                          value={annForm.courseId}
                          onChange={(e) => setAnnForm({ ...annForm, courseId: e.target.value })}
                          style={s.input}
                        >
                          <option value="">General (All Students)</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>Grade {c.grade} — {c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={s.label}>Title *</label>
                        <input
                          type="text"
                          value={annForm.title}
                          onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                          placeholder="e.g. Model Paper Discussion Tomorrow"
                          style={s.input}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={s.label}>Message *</label>
                      <textarea
                        rows={4}
                        value={annForm.message}
                        onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                        placeholder="Detailed notice text..."
                        style={s.textarea}
                        required
                      />
                    </div>

                    <div style={s.btnRow}>
                      <button type="submit" style={s.saveBtn}>Post Announcement</button>
                      <button type="button" onClick={() => setShowAnnForm(false)} style={s.cancelBtn}>Cancel</button>
                    </div>
                  </form>
                )}

                {announcements.length === 0 ? (
                  <p style={s.status}>No announcements posted yet.</p>
                ) : (
                  <div style={s.annGrid}>
                    {announcements.map((ann) => (
                      <div key={ann._id} style={s.annCardAdmin}>
                        <div style={s.annHeaderAdmin}>
                          <div>
                            <h3 style={s.annH3}>{ann.title}</h3>
                            <span style={s.annAudience}>{ann.courseLabel}</span>
                          </div>
                          <div style={s.actions}>
                            <button onClick={() => openEditAnnForm(ann)} style={s.editBtn}>Edit</button>
                            <button onClick={() => handleDeleteAnn(ann)} style={s.deleteBtn}>Delete</button>
                          </div>
                        </div>
                        <p style={s.annBody}>{ann.message}</p>
                        <span style={s.annTime}>Posted {new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── MODAL 1: ATTENDANCE LIST ───────────────────────────────────── */}
        {attendanceModal.open && (
          <div style={s.modalOverlay}>
            <div style={s.modalContent} className="admin-modal-content">
              <div style={s.modalHeader}>
                <h3 style={s.modalH3}>Attendance — {attendanceModal.liveClass?.title}</h3>
                <button onClick={() => setAttendanceModal({ open: false, liveClass: null, records: [], loading: false })} style={s.closeBtn}>✕</button>
              </div>

              {attendanceModal.loading ? (
                <p style={s.status}>Loading attendee list…</p>
              ) : attendanceModal.records.length === 0 ? (
                <p style={s.status}>No students have clicked to join this live class yet.</p>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Student Name</th>
                        <th style={s.th}>Email</th>
                        <th style={s.th}>Grade</th>
                        <th style={s.th}>Joined At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceModal.records.map((rec) => (
                        <tr key={rec._id} style={s.tr}>
                          <td style={s.td}><strong>{rec.studentName}</strong></td>
                          <td style={s.td}>{rec.studentEmail}</td>
                          <td style={s.td}>Grade {rec.studentGrade}</td>
                          <td style={s.td}>{new Date(rec.joinedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 2: HOMEWORK SUBMISSIONS LIST ─────────────────────────── */}
        {submissionModal.open && (
          <div style={s.modalOverlay}>
            <div style={{ ...s.modalContent, maxWidth: 850 }} className="admin-modal-content">
              <div style={s.modalHeader}>
                <h3 style={s.modalH3}>Submissions — {submissionModal.homework?.title}</h3>
                <button onClick={() => setSubmissionModal({ open: false, homework: null, records: [], loading: false })} style={s.closeBtn}>✕</button>
              </div>

              {submissionModal.loading ? (
                <p style={s.status}>Loading student submissions…</p>
              ) : submissionModal.records.length === 0 ? (
                <p style={s.status}>No submissions recorded for this homework yet.</p>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Student</th>
                        <th style={s.th}>Submission Link</th>
                        <th style={s.th}>Submitted At</th>
                        <th style={s.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionModal.records.map((rec) => (
                        <tr key={rec._id} style={s.tr}>
                          <td style={s.td}>
                            <strong>{rec.studentName}</strong>
                            <br />
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Grade {rec.studentGrade} • {rec.studentEmail}</span>
                            {rec.note && <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#555', fontStyle: 'italic' }}>Note: "{rec.note}"</p>}
                          </td>
                          <td style={s.td}>
                            <a href={rec.submissionLink} target="_blank" rel="noreferrer" style={s.linkText}>
                              View Submission ↗
                            </a>
                          </td>
                          <td style={s.td}>{new Date(rec.submittedAt).toLocaleString()}</td>
                          <td style={s.td}>
                            {rec.isLate ? (
                              <span style={s.badgeRed}>LATE</span>
                            ) : (
                              <span style={s.badgeGreen}>ON TIME</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const s = {
  page:   { minHeight: '100vh', background: '#f5f6fa' },
  main:   { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' },
  status: { textAlign: 'center', color: '#888', padding: '3rem 0' },

  tabBar:    { display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem' },
  tab:       { padding: '0.6rem 1.4rem', borderRadius: '8px', background: '#e5e7eb', color: '#444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' },
  tabActive: { padding: '0.6rem 1.4rem', borderRadius: '8px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },

  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  tabH2:   { margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e' },
  addBtn:  { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },

  formBox: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  formH3:  { margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e' },
  grid2:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' },
  label:   { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#333', marginBottom: '0.35rem' },
  hint:    { fontWeight: 400, color: '#888', fontSize: '0.78rem' },
  input:   { width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box', background: '#fff' },
  textarea:{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  btnRow:  { display: 'flex', gap: '1rem', marginTop: '0.5rem' },
  saveBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
  cancelBtn:{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' },

  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th:        { padding: '0.75rem 1rem', background: '#f8f9ff', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#666', borderBottom: '1px solid #e5e7eb' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '0.85rem 1rem', verticalAlign: 'middle', fontSize: '0.88rem' },
  linkText:  { color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' },

  badgeGreen: { background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 },
  badgeRed:   { background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 },
  badgeBlue:  { background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 },
  badgeGray:  { background: '#f3f4f6', color: '#666', padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 },

  actions:   { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  attBtn:    { padding: '0.3rem 0.65rem', background: '#f3e8ff', color: '#7e22ce', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
  editBtn:   { padding: '0.3rem 0.65rem', background: '#e8f4fd', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
  deleteBtn: { padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },

  annGrid:      { display: 'flex', flexDirection: 'column', gap: '1rem' },
  annCardAdmin: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.25rem' },
  annHeaderAdmin:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  annH3:        { margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1a1a2e' },
  annAudience:  { fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 },
  annBody:      { margin: '0 0 0.5rem', color: '#555', fontSize: '0.9rem', lineHeight: 1.5 },
  annTime:      { fontSize: '0.75rem', color: '#888' },

  /* Modal */
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modalContent: { background: '#fff', borderRadius: '14px', width: '100%', maxWidth: 700, padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' },
  modalH3:      { margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e' },
  closeBtn:     { background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
};
