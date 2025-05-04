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
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentAlerts, setEnrollmentAlerts] = useState({ pending: [], rejected: [] });

  // Get user's first name
  const getUserFirstName = () => {
    if (!currentUser) return 'User';
    if (currentUser.firstName) return currentUser.firstName;
    return currentUser.email ? currentUser.email.split('@')[0] : 'User';
  };

  // Format time difference
  const formatTimeDifference = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get priority based on days until deadline
  const getPriority = (daysUntil) => {
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.email) return;

      try {
        setIsLoading(true);
        setError('');

        // Fetch enrolled courses to check status
        const coursesResponse = await axios.get(getApiUrl('enrolledCourses'), {
          params: { email: currentUser.email }
        });

        // Check for pending/rejected enrollments
        const pendingEnrollments = coursesResponse.data.filter(
          course => course.students.find(s => 
            s.email === currentUser.email.toLowerCase() && 
            s.status === 'pending'
          )
        );

        const rejectedEnrollments = coursesResponse.data.filter(
          course => course.students.find(s => 
            s.email === currentUser.email.toLowerCase() && 
            s.status === 'rejected'
          )
        );

        // Set enrollment alerts
        if (pendingEnrollments.length > 0 || rejectedEnrollments.length > 0) {
          setEnrollmentAlerts({
            pending: pendingEnrollments,
            rejected: rejectedEnrollments
          });
        }

        // Fetch student's assignments
        const assignmentsResponse = await axios.get(getApiUrl('studentAssignments'), {
          params: { email: currentUser.email }
        });

        const assignments = assignmentsResponse.data;
        
        // Calculate statistics
        const pending = assignments.filter(assignment => assignment.status === 'pending').length;
        const completed = assignments.filter(assignment => assignment.status === 'graded').length;
        
        // Calculate average score
        const gradedAssignments = assignments.filter(assignment => assignment.marks !== undefined && assignment.marks !== null);
        const totalScore = gradedAssignments.reduce((sum, assignment) => sum + (assignment.marks / assignment.totalMarks) * 100, 0);
        const avgScore = gradedAssignments.length > 0 ? Math.round(totalScore / gradedAssignments.length) : 0;

        setPendingAssignments(pending);
        setCompletedAssignments(completed);
        setAverageScore(avgScore);

        // Process upcoming deadlines
        const pendingAssignments = assignments.filter(assignment => assignment.status === 'pending');
        const now = new Date();
        const upcoming = pendingAssignments
          .filter(assignment => new Date(assignment.deadline) > now)
          .map(assignment => {
            const daysUntil = getDaysUntilDeadline(assignment.deadline);
            return {
              id: assignment._id,
              title: assignment.title,
              daysUntil: daysUntil,
              deadline: assignment.deadline,
              priority: getPriority(daysUntil)
            };
          })
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 3); // Get top 3 upcoming deadlines

        setUpcomingDeadlines(upcoming);

        // Process recent activities
        const activities = [
          // Get most recent graded assignments
          ...assignments
            .filter(assignment => assignment.status === 'graded')
            .map(assignment => ({
              id: `graded-${assignment._id}`,
              title: `${assignment.title} - Graded: ${assignment.grade}${assignment.marks ? ` (${assignment.marks}/${assignment.totalMarks})` : ''}`,
              time: formatTimeDifference(assignment.gradedDate || assignment.submissionDate),
              status: 'completed'
            })),
          // Get recent submissions
          ...assignments
            .filter(assignment => assignment.status === 'submitted')
            .map(assignment => ({
              id: `submitted-${assignment._id}`,
              title: `${assignment.title} - Submitted`,
              time: formatTimeDifference(assignment.submissionDate),
              status: 'submitted'
            }))
        ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 3);

        setRecentActivities(activities);
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
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
      {/* Enrollment Status Alerts */}
      {(enrollmentAlerts.pending.length > 0 || enrollmentAlerts.rejected.length > 0) && (
        <div className="enrollment-alerts">
          {enrollmentAlerts.pending.length > 0 && (
            <div className="alert pending">
              <span className="alert-icon">⏳</span>
              <div className="alert-content">
                <h4>Pending Enrollments</h4>
                <p>Your enrollment in the following courses is awaiting instructor approval:</p>
                <ul>
                  {enrollmentAlerts.pending.map(course => (
                    <li key={course._id}>{course.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {enrollmentAlerts.rejected.length > 0 && (
            <div className="alert rejected">
              <span className="alert-icon">❌</span>
              <div className="alert-content">
                <h4>Enrollment Rejected</h4>
                <p>Your enrollment was not approved for the following courses:</p>
                <ul>
                  {enrollmentAlerts.rejected.map(course => (
                    <li key={course._id}>{course.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">
            Welcome back, <span className="welcome-name">{getUserFirstName()}</span>
          </h1>
          <p className="welcome-subtitle">Here's what's happening with your assignments</p>
        </div>
        {/* <button className="report-button">
          <span className="text-xl">📊</span>
          <span>Generate Report</span>
        </button> */}
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
            {/* <button className="view-all-button">View all →</button> */}
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
            {recentActivities.length === 0 && (
              <div className="no-activities">No recent activities</div>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Deadlines</h2>
            {/* <button className="view-all-button">View all →</button> */}
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className={`deadline-item ${deadline.priority}-priority`}>
                <div className="flex">
                  <div>
                    <h4 className="font-medium text-blue-900">{deadline.title}</h4>
                    <p className="text-sm text-blue-700">
                      Due in {deadline.daysUntil} {deadline.daysUntil === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <span className={`priority-badge ${deadline.priority}`}>
                    {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            ))}
            {upcomingDeadlines.length === 0 && (
              <div className="no-deadlines">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;