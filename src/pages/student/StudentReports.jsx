import { useState } from 'react';
import './StudentReports.css';

const StudentReports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Sample subjects for filter
  const subjects = [
    { id: 1, name: 'HTML & CSS Fundamentals' },
    { id: 2, name: 'JavaScript Essentials' },
    { id: 3, name: 'React Framework' },
    { id: 4, name: 'Backend Development with Node.js' },
  ];
  
  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Progress Reports</h1>
          <p className="welcome-subtitle">Track your academic performance and progress</p>
        </div>
      </div>

      <div className="filters-section">
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
        <div className="filter-container">
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="content-grid">
        {/* Overall Performance Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Overall Performance</h2>
          </div>
          <div className="chart-container">
            {/* Placeholder for chart */}
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
              <p>Overall Grade: 85%</p>
            </div>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">GPA</span>
              <span className="metric-value">3.7</span>
            </div>
            <div className="metric">
              <span className="metric-label">Assignments</span>
              <span className="metric-value">15/16</span>
            </div>
            <div className="metric">
              <span className="metric-label">Attendance</span>
              <span className="metric-value">90%</span>
            </div>
          </div>
        </div>

        {/* Subject Performance Card */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Subject Performance</h2>
          </div>
          <div className="chart-container">
            {/* Placeholder for chart */}
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
                      style={{ width: `${70 + subject.id * 5}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{70 + subject.id * 5}%</span>
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
                <tr>
                  <td>Responsive Website Project</td>
                  <td>HTML & CSS Fundamentals</td>
                  <td>Apr 15, 2025</td>
                  <td>Apr 15, 2025</td>
                  <td className="performance-text excellent">92%</td>
                </tr>
                <tr>
                  <td>DOM Manipulation Challenge</td>
                  <td>JavaScript Essentials</td>
                  <td>Apr 5, 2025</td>
                  <td>Apr 4, 2025</td>
                  <td className="performance-text good">85%</td>
                </tr>
                <tr>
                  <td>Component Architecture Quiz</td>
                  <td>React Framework</td>
                  <td>Mar 30, 2025</td>
                  <td>Mar 29, 2025</td>
                  <td className="performance-text average">72%</td>
                </tr>
                <tr>
                  <td>API Integration Project</td>
                  <td>Backend Development with Node.js</td>
                  <td>Mar 15, 2025</td>
                  <td>Mar 15, 2025</td>
                  <td className="performance-text excellent">95%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReports; 