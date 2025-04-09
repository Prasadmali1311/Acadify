import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import RoleBasedAssignments from './components/RoleBasedAssignments';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/Courses';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentProfile from './pages/student/StudentProfile';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/Classes';
import TeacherStudents from './pages/teacher/Students';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
// Common pages
import Settings from './pages/Settings';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<RoleBasedDashboard />} />
            
            {/* Student routes */}
            <Route path="student">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Teacher routes */}
            <Route path="teacher">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="assignments" element={<TeacherAssignments />} />
            </Route>

            {/* Common routes */}
            <Route path="settings" element={<Settings />} />
            <Route path="upload" element={<FileUpload />} />
            <Route path="files" element={<FileList />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
