import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  
  // Get user's first name
  const getUserFirstName = () => {
    if (!currentUser) return 'User';
    
    // If we have profile data with first name
    if (currentUser.profile && currentUser.profile.firstName) {
      return currentUser.profile.firstName;
    }
    
    // If we have a display name from Google
    if (currentUser.profile && currentUser.profile.displayName) {
      return currentUser.profile.displayName.split(' ')[0];
    }
    
    // If we have a display name directly on the user object
    if (currentUser.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    
    // Fallback to email
    return currentUser.email ? currentUser.email.split('@')[0] : 'User';
  };
  
  const activities = [
    { id: 1, title: 'Math Assignment graded', time: '2 hours ago', status: 'completed' },
    { id: 2, title: 'Physics Quiz created', time: '1 day ago', status: 'completed' },
    { id: 3, title: 'Chemistry Report submitted for review', time: '3 hours ago', status: 'pending' }
  ];

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">
            Welcome back, Teacher <span className="welcome-name">{getUserFirstName()}</span>
          </h1>
          <p className="welcome-subtitle">Here's what's happening with your classes</p>
        </div>
        <button className="report-button">
          <span className="text-xl">📊</span>
          <span>Generate Report</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3 className="stat-title text-blue-600">Active Classes</h3>
          <p className="stat-value">4</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 1
            </span>
            <span className="text-gray-500">from last semester</span>
          </p>
        </div>

        <div className="stat-card green">
          <h3 className="stat-title text-green-600">Assignments to Grade</h3>
          <p className="stat-value">8</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-down">
              <span className="text-lg">↓</span> 3
            </span>
            <span className="text-gray-500">from yesterday</span>
          </p>
        </div>

        <div className="stat-card purple">
          <h3 className="stat-title text-purple-600">Student Engagement</h3>
          <p className="stat-value">92%</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 7%
            </span>
            <span className="text-gray-500">from last month</span>
          </p>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <button className="view-all-button">View all →</button>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-time">{activity.time}</p>
                </div>
                <span className={`status-badge ${activity.status}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Tasks</h2>
            <button className="view-all-button">View all →</button>
          </div>
          <div className="space-y-4">
            <div className="deadline-item high-priority">
              <div className="flex">
                <div>
                  <h4 className="font-medium text-blue-900">Grade Final Projects</h4>
                  <p className="text-sm text-blue-700">Due in 3 days</p>
                </div>
                <span className="priority-badge high">High Priority</span>
              </div>
            </div>
            <div className="deadline-item medium-priority">
              <div className="flex">
                <div>
                  <h4 className="font-medium text-purple-900">Prepare Midterm Exam</h4>
                  <p className="text-sm text-purple-700">Due in 1 week</p>
                </div>
                <span className="priority-badge medium">Medium Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 