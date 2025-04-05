import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Assignments from './pages/Assignments';
import Reports from './pages/Reports';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Courses from './pages/Courses';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/signup" element={
          currentUser ? <Navigate to="/" replace /> : <Signup />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<RoleBasedDashboard />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="classes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Classes />
            </ProtectedRoute>
          } />
          <Route path="students" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Courses />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
