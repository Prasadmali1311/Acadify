import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [activeClasses, setActiveClasses] = useState(0);
  const [assignmentsToGrade, setAssignmentsToGrade] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Format time difference
  const formatTimeDifference = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now - then) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - then) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  // Get days until deadline
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

  // Get user's first name
  const getUserFirstName = () => {
    if (!currentUser) return 'User';
    if (currentUser.firstName) return currentUser.firstName;
    return currentUser.email ? currentUser.email.split('@')[0] : 'User';
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoading(true);
        setError('');

        // Fetch active classes
        const classesResponse = await axios.get(getApiUrl('instructorCourses'), {
          params: { instructorId: currentUser.id }
        });
        setActiveClasses(classesResponse.data.length);

        // Fetch assignments created by this instructor
        const assignmentsResponse = await axios.get(getApiUrl('teacherAssignments'), {
          params: { instructorId: currentUser.id }
        });
        const assignments = assignmentsResponse.data;
        
        // Set total assignments count
        setTotalAssignments(assignments.length);
        
        // Get all submissions for these assignments
        const assignmentIds = assignments.map(assignment => assignment._id);
        const submissionsResponse = await axios.get(getApiUrl('submissions'), {
          params: { assignmentId: { $in: assignmentIds } }
        });
        const submissions = submissionsResponse.data;
        
        // Filter submissions that are submitted but not graded
        const pendingSubmissions = submissions.filter(
          submission => !submission.grade && !submission.marks
        );
        setAssignmentsToGrade(pendingSubmissions.length);

        // Process upcoming tasks
        const now = new Date();
        const upcomingTasksList = [
          // Tasks for grading pending submissions
          ...submissions
            .filter(sub => !sub.grade && !sub.marks)
            .map(sub => ({
              id: `grade-${sub._id}`,
              title: `Grade ${sub.assignmentTitle || 'Assignment'} for ${sub.studentEmail}`,
              type: 'grading',
              deadline: new Date(new Date(sub.submissionDate).getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after submission
              priority: 'high'
            })),
          // Tasks for assignments near deadline with low submission rates
          ...assignments
            .filter(assignment => {
              const deadline = new Date(assignment.deadline);
              return deadline > now;
            })
            .map(assignment => {
              const daysUntil = getDaysUntilDeadline(assignment.deadline);
              const submissionCount = submissions.filter(s => s.assignmentId === assignment._id).length;
              const submissionRate = submissionCount / (assignment.totalStudents || 1);
              
              return {
                id: `assignment-${assignment._id}`,
                title: `${assignment.title} - Due Soon`,
                type: 'deadline',
                deadline: new Date(assignment.deadline),
                daysUntil,
                priority: getPriority(daysUntil),
                submissionRate: Math.round(submissionRate * 100)
              };
            })
        ]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

        setUpcomingTasks(upcomingTasksList);

        // Process recent activities
        const activities = [
          // Recently graded submissions
          ...submissions
            .filter(sub => sub.grade || sub.marks)
            .map(sub => ({
              id: `graded-${sub._id}`,
              title: `${sub.assignmentTitle || 'Assignment'} graded for ${sub.studentEmail}`,
              time: formatTimeDifference(sub.gradedDate || sub.submissionDate),
              status: 'completed'
            })),
          // Recently submitted assignments pending review
          ...submissions
            .filter(sub => !sub.grade && !sub.marks)
            .map(sub => ({
              id: `pending-${sub._id}`,
              title: `${sub.assignmentTitle || 'Assignment'} submitted by ${sub.studentEmail}`,
              time: formatTimeDifference(sub.submissionDate),
              status: 'pending'
            })),
          // Recently created assignments
          ...assignments
            .filter(assignment => new Date(assignment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .map(assignment => ({
              id: `created-${assignment._id}`,
              title: `Created: ${assignment.title}`,
              time: formatTimeDifference(assignment.createdAt),
              status: 'completed'
            }))
        ]
        .sort((a, b) => {
          const timeA = a.time.match(/(\d+)/)[0];
          const timeB = b.time.match(/(\d+)/)[0];
          return timeA - timeB;
        })
        .slice(0, 5);

        setRecentActivities(activities);
        setError(null);
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
          <p className="stat-value">{activeClasses}</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 1
            </span>
            <span className="text-gray-500">from last semester</span>
          </p>
        </div>

        <div className="stat-card green">
          <h3 className="stat-title text-green-600">Assignments to Grade</h3>
          <p className="stat-value">{assignmentsToGrade}</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-down">
              <span className="text-lg">↓</span> 3
            </span>
            <span className="text-gray-500">from yesterday</span>
          </p>
        </div>

        <div className="stat-card purple">
          <h3 className="stat-title text-purple-600">Total Assignments</h3>
          <p className="stat-value">{totalAssignments}</p>
          <p className="stat-trend">
            <span className="trend-indicator trend-up">
              <span className="text-lg">↑</span> 2
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
            {recentActivities.length === 0 && (
              <div className="no-activities">No recent activities</div>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Tasks</h2>
            <button className="view-all-button">View all →</button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className={`deadline-item ${task.priority}-priority`}>
                <div className="flex">
                  <div>
                    <h4 className="font-medium text-blue-900">{task.title}</h4>
                    <p className="text-sm text-blue-700">
                      {task.type === 'grading' ? (
                        'Grade within 7 days of submission'
                      ) : (
                        <>
                          Due in {task.daysUntil} {task.daysUntil === 1 ? 'day' : 'days'}
                          {task.submissionRate !== undefined && (
                            <span className="text-gray-600"> • {task.submissionRate}% submitted</span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <div className="no-deadlines">No upcoming tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;