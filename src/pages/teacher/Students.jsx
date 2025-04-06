import { useState } from 'react';
import './Students.css';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  
  // Sample student data (would come from your database in a real app)
  const students = [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', class: 'HTML & CSS Fundamentals', performance: 'Excellent', attendance: '95%' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', class: 'JavaScript Essentials', performance: 'Good', attendance: '87%' },
    { id: 3, name: 'Michael Brown', email: 'michael.b@example.com', class: 'React Framework', performance: 'Average', attendance: '78%' },
    { id: 4, name: 'Emma Wilson', email: 'emma.w@example.com', class: 'HTML & CSS Fundamentals', performance: 'Excellent', attendance: '98%' },
    { id: 5, name: 'David Lee', email: 'david.l@example.com', class: 'Backend Development with Node.js', performance: 'Good', attendance: '92%' },
    { id: 6, name: 'Jessica Chen', email: 'jessica.c@example.com', class: 'JavaScript Essentials', performance: 'Excellent', attendance: '97%' },
    { id: 7, name: 'Thomas Rodriguez', email: 'thomas.r@example.com', class: 'Backend Development with Node.js', performance: 'Below Average', attendance: '65%' },
    { id: 8, name: 'Olivia Martin', email: 'olivia.m@example.com', class: 'React Framework', performance: 'Good', attendance: '85%' },
  ];
  
  // Sample class data for filtering
  const classes = [
    { id: 1, name: 'HTML & CSS Fundamentals' },
    { id: 2, name: 'JavaScript Essentials' },
    { id: 3, name: 'React Framework' },
    { id: 4, name: 'Backend Development with Node.js' },
  ];

  // Filter students based on search term and selected class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Student Management</h1>
          <p className="welcome-subtitle">View and monitor student progress</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
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
      </div>

      <div className="content-grid">
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">Student List</h2>
            <div className="student-count">{filteredStudents.length} students</div>
          </div>
          <div className="student-list">
            <div className="student-list-header">
              <div className="student-name">Name</div>
              <div className="student-email">Email</div>
              <div className="student-class">Class</div>
              <div className="student-performance">Performance</div>
              <div className="student-attendance">Attendance</div>
              <div className="student-actions">Actions</div>
            </div>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="student-item">
                  <div className="student-name">{student.name}</div>
                  <div className="student-email">{student.email}</div>
                  <div className="student-class">{student.class}</div>
                  <div className={`student-performance ${student.performance.toLowerCase().replace(' ', '-')}`}>
                    {student.performance}
                  </div>
                  <div className="student-attendance">{student.attendance}</div>
                  <div className="student-actions">
                    <button className="action-button view">View Profile</button>
                    <button className="action-button message">Message</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No students match your search criteria</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students; 