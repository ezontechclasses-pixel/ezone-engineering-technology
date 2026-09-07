import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminProtectedRoute from './routes/AdminProtectedRoute';
import Navbar from './components/Navbar';

// Student pages
import Home        from './pages/Home';
import Courses     from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Classroom   from './pages/Classroom';
import Notes       from './pages/Notes';
import Quiz        from './pages/Quiz';
import Results     from './pages/Results';

// Admin pages
import AdminLogin         from './pages/admin/AdminLogin';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminCourses       from './pages/admin/AdminCourses';
import AdminUnits         from './pages/admin/AdminUnits';
import AdminLessons       from './pages/admin/AdminLessons';
import AdminQuizzes       from './pages/admin/AdminQuizzes';
import QuizForm           from './pages/admin/QuizForm';
import AdminStudents      from './pages/admin/AdminStudents';
import AdminStudentDetail from './pages/admin/AdminStudentDetail';
import AdminSiteContent   from './pages/admin/AdminSiteContent';
import AdminMaterials     from './pages/admin/AdminMaterials';
import MaterialForm       from './pages/admin/MaterialForm';
import AdminClassroom     from './pages/admin/AdminClassroom';
import AdminTestimonials  from './pages/admin/AdminTestimonials';

// Navbar is hidden on /admin/* routes — admin has its own header
function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/"            element={<Home />} />
        <Route path="/courses"     element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />

        {/* ── Student protected ───────────────────────────────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/classroom" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
        <Route path="/notes"     element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/quiz/:lessonId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/results"   element={<ProtectedRoute><Results /></ProtectedRoute>} />

        {/* ── Admin ───────────────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/courses"
          element={<AdminProtectedRoute><AdminCourses /></AdminProtectedRoute>} />
        <Route path="/admin/courses/:courseId/units"
          element={<AdminProtectedRoute><AdminUnits /></AdminProtectedRoute>} />
        <Route path="/admin/units/:unitId/lessons"
          element={<AdminProtectedRoute><AdminLessons /></AdminProtectedRoute>} />
        <Route path="/admin/quizzes"
          element={<AdminProtectedRoute><AdminQuizzes /></AdminProtectedRoute>} />
        <Route path="/admin/quizzes/new"
          element={<AdminProtectedRoute><QuizForm /></AdminProtectedRoute>} />
        <Route path="/admin/quizzes/:quizId/edit"
          element={<AdminProtectedRoute><QuizForm /></AdminProtectedRoute>} />
        <Route path="/admin/students"
          element={<AdminProtectedRoute><AdminStudents /></AdminProtectedRoute>} />
        <Route path="/admin/students/:id"
          element={<AdminProtectedRoute><AdminStudentDetail /></AdminProtectedRoute>} />
        <Route path="/admin/content"
          element={<AdminProtectedRoute><AdminSiteContent /></AdminProtectedRoute>} />
        <Route path="/admin/materials"
          element={<AdminProtectedRoute><AdminMaterials /></AdminProtectedRoute>} />
        <Route path="/admin/materials/new"
          element={<AdminProtectedRoute><MaterialForm /></AdminProtectedRoute>} />
        <Route path="/admin/materials/:id/edit"
          element={<AdminProtectedRoute><MaterialForm /></AdminProtectedRoute>} />
        <Route path="/admin/classroom"
          element={<AdminProtectedRoute><AdminClassroom /></AdminProtectedRoute>} />
        <Route path="/admin/testimonials"
          element={<AdminProtectedRoute><AdminTestimonials /></AdminProtectedRoute>} />

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route path="*" element={
          <main style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h1>404 — Page Not Found</h1>
          </main>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
