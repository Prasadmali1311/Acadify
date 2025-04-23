import { useAuth } from '../contexts/AuthContext';
import StudentReports from '../pages/student/StudentReports';
import { Navigate } from 'react-router-dom';

const RoleBasedReports = () => {
  const { currentUser } = useAuth();

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="login" />;
  }

  // Get user role from profile
  const userRole = currentUser.profile?.role || 'student';

  // Only allow students to access reports
  switch (userRole.toLowerCase()) {
    case 'student':
      return <StudentReports />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RoleBasedReports;