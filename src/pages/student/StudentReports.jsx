import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import './StudentReports.css';

const StudentReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // State for performance data
  const [stats, setStats] = useState({
    gpa: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!currentUser?.email) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch enrolled courses with performance data
        const coursesResponse = await axios.get(`${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(currentUser.email)}`);
        const coursesData = coursesResponse.data;

        // Format courses for subject performance
        const formattedSubjects = coursesData.map(course => {
          const completedAssignments = course.assignmentCount - course.pendingCount;
          const progress = course.assignmentCount > 0 
            ? Math.round((completedAssignments / course.assignmentCount) * 100) 
            : 0;

          return {
            id: course._id,
            name: course.name,
            progress,
            assignmentCount: course.assignmentCount,
            completedAssignments
          };
        });
        setSubjects(formattedSubjects);

        // Calculate overall statistics
        const totalAssignments = formattedSubjects.reduce((sum, subject) => sum + subject.assignmentCount, 0);
        const totalCompleted = formattedSubjects.reduce((sum, subject) => sum + subject.completedAssignments, 0);
        
        // Fetch submissions to calculate grades
        const submissionsResponse = await axios.get(`${getApiUrl('studentSubmissions')}?email=${encodeURIComponent(currentUser.email)}`);
        const submissionsData = submissionsResponse.data;

        // Calculate average grade from submissions
        const gradedSubmissions = submissionsData.filter(sub => sub.marks !== undefined && sub.marks !== null);
        const totalScore = gradedSubmissions.reduce((sum, sub) => sum + (sub.marks / sub.totalMarks) * 100, 0);
        const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalScore / gradedSubmissions.length) : 0;

        setStats({
          gpa: (averageGrade / 20).toFixed(1), // Convert percentage to 4.0 scale
          totalAssignments,
          completedAssignments: totalCompleted,
          averageGrade
        });

        // Get recent graded submissions
        const recentGrades = submissionsData
          .filter(sub => sub.marks !== undefined || sub.grade)
          .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
          .slice(0, 5);

        setRecentGrades(recentGrades);
        setError(null);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err.message || 'Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [currentUser]);

  if (isLoading) {
    return <div className="loading">Loading performance data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Progress Reports</h1>
          <p className="welcome-subtitle">Track your academic performance and progress</p>
        </div>
      </div>

      <div className="content-grid">
        {/* Overall Performance Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Overall Performance</h2>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
              <p>Overall Grade: {stats.averageGrade}%</p>
            </div>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">GPA</span>
              <span className="metric-value">{stats.gpa}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Assignments</span>
              <span className="metric-value">{stats.completedAssignments}/{stats.totalAssignments}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Completion</span>
              <span className="metric-value">
                {stats.totalAssignments > 0 
                  ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Subject Performance Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Subject Progress</h2>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <span className="chart-icon">📈</span>
            </div>
          </div>
          <div className="subjects-list">
            {subjects.map(subject => (
              <div key={subject.id} className="subject-item">
                <span className="subject-name">{subject.name}</span>
                <div className="subject-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{subject.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grades Card */}
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">Recent Grades</h2>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Submitted</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {recentGrades.map(grade => (
                  <tr key={grade._id}>
                    <td>{grade.assignmentTitle}</td>
                    <td>{grade.courseName}</td>
                    <td>{new Date(grade.deadline).toLocaleDateString()}</td>
                    <td>{new Date(grade.submissionDate).toLocaleDateString()}</td>
                    <td className={`performance-text ${getPerformanceClass(grade.marks, grade.totalMarks)}`}>
                      {grade.marks !== undefined ? `${grade.marks}/${grade.totalMarks}` : grade.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine performance class
const getPerformanceClass = (marks, totalMarks) => {
  if (marks === undefined || totalMarks === undefined) return 'good';
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 70) return 'average';
  return 'poor';
};

export default StudentReports;