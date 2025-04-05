import { useAuth } from '../contexts/AuthContext';
import TeacherAssignments from '../pages/teacher/TeacherAssignments';
import StudentAssignments from '../pages/student/StudentAssignments';
import { Navigate } from 'react-router-dom';

const RoleBasedAssignments = () => {
  const { currentUser } = useAuth();

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="login" />;
  }

  // Get user role from profile
  const userRole = currentUser.profile?.role || 'student';

  // Render assignments based on role
  switch (userRole.toLowerCase()) {
    case 'teacher':
      return <TeacherAssignments />;
    case 'student':
      return <StudentAssignments />;
    default:
      return <StudentAssignments />;
  }
};

export default RoleBasedAssignments; 