import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
// import Reports from './pages/Reports'; // Removed as this component was deleted
import Classes from './pages/teacher/Classes';
import Students from './pages/teacher/Students';
import Courses from './pages/student/Courses';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import RoleBasedAssignments from './components/RoleBasedAssignments';
import RoleBasedReports from './components/RoleBasedReports';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="login" 
          element={currentUser ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="signup" 
          element={currentUser ? <Navigate to="/" replace /> : <Signup />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedDashboard />} />
          <Route path="assignments" element={<RoleBasedAssignments />} />
          <Route path="reports" element={<RoleBasedReports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route 
            path="classes" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Classes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="students" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Students />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="courses" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Courses />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
