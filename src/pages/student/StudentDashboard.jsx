import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [completedAssignments, setCompletedAssignments] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user's first name
  const getUserFirstName = () => {
    if (!currentUser) return 'User';
    
    // If we have first name in user data
    if (currentUser.firstName) {
      return currentUser.firstName;
    }
    
    // Fallback to email
    return currentUser.email ? currentUser.email.split('@')[0] : 'User';
  };

  // Format time difference
  const formatTimeDifference = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.email) return;

      try {
        setIsLoading(true);
        setError('');

        // Fetch student's assignments
        const assignmentsResponse = await axios.get(getApiUrl('studentAssignments'), {
          params: { email: currentUser.email }
        });

        // Calculate statistics
        const assignments = assignmentsResponse.data;
        const pending = assignments.filter(assignment => assignment.status === 'pending').length;
        const completed = assignments.filter(assignment => assignment.status === 'graded').length;
        
        // Calculate average score
        const gradedAssignments = assignments.filter(assignment => assignment.marks !== undefined && assignment.marks !== null);
        const totalScore = gradedAssignments.reduce((sum, assignment) => sum + (assignment.marks / assignment.totalMarks) * 100, 0);
        const avgScore = gradedAssignments.length > 0 ? Math.round(totalScore / gradedAssignments.length) : 0;

        setPendingAssignments(pending);
        setCompletedAssignments(completed);
        setAverageScore(avgScore);

        // Fetch recent submissions
        const submissionsResponse = await axios.get(getApiUrl('submissions'), {
          params: { studentEmail: currentUser.email }
        });

        // Fetch enrolled courses
        const enrollmentsResponse = await axios.get(getApiUrl('enrolledCourses'), {
          params: { email: currentUser.email }
        });

        // Process activities
        const activities = [];
        
        // Add submission activities
        submissionsResponse.data.forEach(submission => {
          // Skip submissions without proper data
          if (!submission.assignmentTitle || !submission.submissionDate) return;

          activities.push({
            id: `submission-${submission._id}`,
            title: `${submission.assignmentTitle} ${submission.grade ? 'graded' : 'submitted'}`,
            time: formatTimeDifference(submission.submissionDate),
            status: submission.grade ? 'graded' : 'submitted'
          });
        });

        // Add enrollment activities
        enrollmentsResponse.data.forEach(course => {
          const studentData = course.students.find(s => s.email === currentUser.email.toLowerCase());
          if (studentData) {
            activities.push({
              id: `enrollment-${course._id}`,
              title: `Enrolled in ${course.name}`,
              time: formatTimeDifference(studentData.enrolledAt),
              status: 'completed'
            });
          }
        });

        // Sort activities by time (newest first) and take the 3 most recent
        const sortedActivities = activities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 3);

        setRecentActivities(sortedActivities);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (isLoading) {
    return <div className="dashboard-container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-container error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">
            Welcome back, <span className="welcome-name">{getUserFirstName()}</span>
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
          <p className="stat-value">{pendingAssignments}</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-down">
              <span className="text-lg">↓</span> 2
            </span>
            <span className="text-gray-500">from last week</span>
          </p>
        </div>

        <div className="stat-card green">
          <h3 className="stat-title text-green-600">Completed Assignments</h3>
          <p className="stat-value">{completedAssignments}</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 3
            </span>
            <span className="text-gray-500">from last week</span>
          </p>
        </div>

        <div className="stat-card purple">
          <h3 className="stat-title text-purple-600">Average Score</h3>
          <p className="stat-value">{averageScore}%</p>
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
            {recentActivities.map((activity) => (
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
                  <h4 className="font-medium text-blue-900">Node.js API Project</h4>
                  <p className="text-sm text-blue-700">Due in 5 days</p>
                </div>
                <span className="priority-badge high">High Priority</span>
              </div>
            </div>
            <div className="deadline-item medium-priority">
              <div className="flex">
                <div>
                  <h4 className="font-medium text-purple-900">React State Management Exercise</h4>
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

export default StudentDashboard; 