import { useState } from 'react';
import './TeacherReports.css';

const TeacherReports = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Sample classes data
  const classes = [
    { id: 1, name: 'HTML & CSS Fundamentals' },
    { id: 2, name: 'JavaScript Essentials' },
    { id: 3, name: 'React Framework' },
    { id: 4, name: 'Backend Development with Node.js' },
  ];

  // Sample student data (would come from Firebase in a real app)
  const students = [
    { id: 1, name: 'Alex Johnson', grade: 92, status: 'excellent', lastActivity: '1 day ago', assignmentsCompleted: '16/16' },
    { id: 2, name: 'Sam Thompson', grade: 85, status: 'good', lastActivity: '3 days ago', assignmentsCompleted: '14/16' },
    { id: 3, name: 'Jamie Lee', grade: 78, status: 'average', lastActivity: '2 hours ago', assignmentsCompleted: '13/16' },
    { id: 4, name: 'Morgan Smith', grade: 65, status: 'poor', lastActivity: '5 days ago', assignmentsCompleted: '10/16' },
    { id: 5, name: 'Casey Brown', grade: 91, status: 'excellent', lastActivity: '1 hour ago', assignmentsCompleted: '15/16' },
  ];

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Class Analytics</h1>
          <p className="welcome-subtitle">View performance metrics and generate reports</p>
        </div>
        <button className="export-button">
          <span className="button-icon">📋</span>
          <span>Export Data</span>
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-container">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Classes</option>
            {classes.map(classItem => (
              <option key={classItem.id} value={classItem.name}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-container">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
        </div>
      </div>

      <div className="content-grid">
        {/* Class Overview Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Class Overview</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-title">Total Students</div>
              <div className="stat-value">128</div>
              <div className="stat-trend">
                <span className="trend-indicator trend-up">+5% </span>
                <span>from last month</span>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-title">Avg. Grade</div>
              <div className="stat-value">82%</div>
              <div className="stat-trend">
                <span className="trend-indicator trend-up">+3% </span>
                <span>from last month</span>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-title">Completion Rate</div>
              <div className="stat-value">94%</div>
              <div className="stat-trend">
                <span className="trend-indicator trend-down">-2% </span>
                <span>from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Distribution Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Grade Distribution</h2>
          </div>
          <div className="chart-container">
            {/* Placeholder for chart */}
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
            </div>
          </div>
          <div className="distribution-legend">
            <div className="legend-item">
              <span className="legend-color excellent"></span>
              <span className="legend-label">A (90-100%)</span>
              <span className="legend-value">32%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color good"></span>
              <span className="legend-label">B (80-89%)</span>
              <span className="legend-value">45%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color average"></span>
              <span className="legend-label">C (70-79%)</span>
              <span className="legend-value">15%</span>
            </div>
            <div className="legend-item">
              <span className="legend-color poor"></span>
              <span className="legend-label">D or below (&lt;70%)</span>
              <span className="legend-value">8%</span>
            </div>
          </div>
        </div>

        {/* Assignment Performance Card */}
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">Assignment Performance</h2>
          </div>
          <div className="chart-container horizontal-chart">
            {/* Placeholder for horizontal bar chart */}
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
              <p>Assignment performance by class</p>
            </div>
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">Student Performance</h2>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Overall Grade</th>
                  <th>Performance</th>
                  <th>Assignments Completed</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.grade}%</td>
                    <td>
                      <div className="performance-text-container">
                        <span className={`performance-indicator ${student.status}`}></span>
                        <span className={`performance-text ${student.status}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>{student.assignmentsCompleted}</td>
                    <td>{student.lastActivity}</td>
                    <td>
                      <div className="student-actions">
                        <button className="action-button view">View Details</button>
                        <button className="action-button message">Message</button>
                      </div>
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

export default TeacherReports; 