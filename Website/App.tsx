import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentExamView from "./pages/student/StudentExamView";
import StudentResultView from "./pages/student/StudentResultView";
import StudentExams from "./pages/student/StudentExams";
import StudentProgress from "./pages/student/StudentProgress";
import StudentSubjects from "./pages/student/StudentSubjects";
import StudentAITutor from "./pages/student/StudentAITutor"; // Fixed casing
import StudentSettings from "./pages/student/StudentSettings";
import StudentSubjectDetail from "./pages/student/StudentSubjectDetail";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import TeacherExamBuilder from "./pages/teacher/TeacherExamBuilder";
import TeacherAIAssistant from "./pages/teacher/TeacherAIAssistant";
import TeacherLibrary from "./pages/teacher/TeacherLibrary";
import ClassDetail from "./pages/teacher/ClassDetail";
import StudentDetail from "./pages/teacher/StudentDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBackups from "./pages/admin/AdminBackups";
import AdminSettings from "./pages/admin/AdminSettings";
import SystemLogs from "./pages/admin/SystemLogs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<DashboardLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="subject/:id" element={<StudentSubjectDetail />} />
          <Route path="ai-tutor" element={<StudentAITutor />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="exam/:id" element={<StudentExamView />} />
          <Route path="result/:id" element={<StudentResultView />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="exams" element={<TeacherExamBuilder />} />
          <Route path="ai-assistant" element={<TeacherAIAssistant />} />
          <Route path="library" element={<TeacherLibrary />} />
          <Route path="class/:id" element={<ClassDetail />} />
          <Route path="student/:id" element={<StudentDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="system" element={<SystemLogs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="backups" element={<AdminBackups />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;