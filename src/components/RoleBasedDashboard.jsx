import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../pages/Dashboard';
import TeacherDashboard from '../pages/TeacherDashboard';
import { Navigate } from 'react-router-dom';

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Get user role from profile
  const userRole = currentUser.profile?.role || 'student';

  // Render dashboard based on role
  switch (userRole.toLowerCase()) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default RoleBasedDashboard; 