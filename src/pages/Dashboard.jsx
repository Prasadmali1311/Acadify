import './Dashboard.css';

const Dashboard = () => {
  const activities = [
    { id: 1, title: 'Math Assignment submitted', time: '2 hours ago', status: 'completed' },
    { id: 2, title: 'Physics Quiz due soon', time: '1 day left', status: 'pending' },
    { id: 3, title: 'Chemistry Report graded', time: '3 hours ago', status: 'completed' }
  ];

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">
            Welcome back, <span className="welcome-name">Student</span>
          </h1>
          <p className="welcome-subtitle">Here's what's happening with your assignments</p>
        </div>
        <button className="report-button">
          <span className="text-xl">📊</span>
          <span>Generate Report</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3 className="stat-title text-blue-600">Pending Assignments</h3>
          <p className="stat-value">5</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-down">
              <span className="text-lg">↓</span> 2
            </span>
            <span className="text-gray-500">from last week</span>
          </p>
        </div>

        <div className="stat-card green">
          <h3 className="stat-title text-green-600">Completed Assignments</h3>
          <p className="stat-value">12</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 3
            </span>
            <span className="text-gray-500">from last week</span>
          </p>
        </div>

        <div className="stat-card purple">
          <h3 className="stat-title text-purple-600">Average Score</h3>
          <p className="stat-value">85%</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 5%
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
            <h2 className="card-title">Upcoming Deadlines</h2>
            <button className="view-all-button">View all →</button>
          </div>
          <div className="space-y-4">
            <div className="deadline-item high-priority">
              <div className="flex">
                <div>
                  <h4 className="font-medium text-blue-900">Final Project</h4>
                  <p className="text-sm text-blue-700">Due in 5 days</p>
                </div>
                <span className="priority-badge high">High Priority</span>
              </div>
            </div>
            <div className="deadline-item medium-priority">
              <div className="flex">
                <div>
                  <h4 className="font-medium text-purple-900">Literature Review</h4>
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

export default Dashboard;
