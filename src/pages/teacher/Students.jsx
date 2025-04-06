import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTeacherStudents, getInstructorCourses } from '../../firebase/firestoreService';
import './Students.css';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user
  const { currentUser } = useAuth();
  
  // State for students and classes
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch teacher's students and courses
  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch courses
        const fetchedCourses = await getInstructorCourses(currentUser.uid);
        
        // Format courses for the dropdown
        const formattedCourses = fetchedCourses.map(course => ({
          id: course.id,
          name: course.name
        }));
        
        setClasses(formattedCourses);
        
        // Fetch students
        const fetchedStudents = await getTeacherStudents(currentUser.uid);
        
        // Format students for UI
        const formattedStudents = fetchedStudents.map(student => {
          // Assign random data for the demo
          const randomPerformance = Math.random();
          let performance;
          if (randomPerformance > 0.75) {
            performance = 'Excellent';
          } else if (randomPerformance > 0.5) {
            performance = 'Good';
          } else if (randomPerformance > 0.25) {
            performance = 'Average';
          } else {
            performance = 'Below Average';
          }
          
          const attendance = Math.floor(Math.random() * 30) + 70 + '%';
          
          // Randomly assign a course for filtering
          const randomClass = formattedCourses[Math.floor(Math.random() * formattedCourses.length)]?.name || 'Unknown';
          
          return {
            id: student.id,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            email: student.email || 'No email',
            class: randomClass,
            performance,
            attendance
          };
        });
        
        setStudents(formattedStudents);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [currentUser]);

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
          
          {isLoading ? (
            <div className="loading-state">
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Students; 