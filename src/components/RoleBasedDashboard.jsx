import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedDashboard = () => {
  const { userRole } = useAuth();

  switch (userRole) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RoleBasedDashboard; 