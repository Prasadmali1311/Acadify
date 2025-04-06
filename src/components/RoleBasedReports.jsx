import { useAuth } from '../contexts/AuthContext';
import TeacherReports from '../pages/teacher/TeacherReports';
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

  // Render reports based on role
  switch (userRole.toLowerCase()) {
    case 'teacher':
      return <TeacherReports />;
    case 'student':
      return <StudentReports />;
    default:
      return <StudentReports />;
  }
};

export default RoleBasedReports; 