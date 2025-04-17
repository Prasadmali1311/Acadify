import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Students.css';

const Students = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const fetchStudents = async () => {
      if (!currentUser) {
        setError('User not logged in.');
        setIsLoading(false);
        return;
      }
      
      if (currentUser.role !== 'teacher' || !currentUser.id) {
        setError('Access denied or Instructor ID not found.');
        setIsLoading(false);
        return;
      }
      
      const instructorId = currentUser.id;

      try {
        setIsLoading(true);
        const coursesResponse = await axios.get(`${getApiUrl('courses')}?instructorId=${instructorId}`);
        
        if (coursesResponse.status !== 200) {
          throw new Error('Failed to fetch courses');
        }

        const coursesData = coursesResponse.data;
        
        // Extract unique course names for the filter dropdown
        const uniqueCourses = [...new Set(coursesData.map(course => course.name))];
        setCourses(uniqueCourses);
        
        const allStudentsMap = new Map();
        coursesData.forEach(course => {
          course.students.forEach(student => {
            if (!allStudentsMap.has(student.email)) {
              allStudentsMap.set(student.email, {
                ...student,
                courses: [course.name]
              });
            } else {
              const existingStudent = allStudentsMap.get(student.email);
              if (!existingStudent.courses.includes(course.name)) {
                  existingStudent.courses.push(course.name);
              }
            }
          });
        });

        const studentsList = Array.from(allStudentsMap.values());
        setStudents(studentsList);
        setFilteredStudents(studentsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to load students.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser, authLoading]);

  // Apply filters when search term or selected course changes
  useEffect(() => {
    let result = [...students];
    
    // Apply course filter
    if (selectedCourse !== 'all') {
      result = result.filter(student => 
        student.courses.includes(selectedCourse)
      );
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name?.toLowerCase().includes(term) || 
        student.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(result);
  }, [searchTerm, selectedCourse, students]);

  const handleStudentClick = (email) => {
    navigate(`/teacher/students/${encodeURIComponent(email)}/submissions`);
  };

  const displayLoading = isLoading || authLoading;

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Enrolled Students</h1>
          <p className="welcome-subtitle">View and manage students enrolled in your courses</p>
        </div>
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">Total Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Active Courses</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search students by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select 
            className="filter-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {displayLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading students data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {filteredStudents.length > 0 ? (
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrolled Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr 
                      key={student.email}
                      className="student-row"
                    >
                      <td className="student-name">{student.name || 'N/A'}</td>
                      <td className="student-email">{student.email}</td>
                      <td className="student-courses">
                        <div className="course-tags">
                          {student.courses.map((course, index) => (
                            <span key={index} className="course-tag">{course}</span>
                          ))}
                        </div>
                      </td>
                      <td className="student-actions">
                        <button 
                          className="view-submissions-btn"
                          onClick={() => handleStudentClick(student.email)}
                        >
                          View Submissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">
              <i className="no-results-icon">📚</i>
              <p>No students match your search criteria</p>
              {searchTerm || selectedCourse !== 'all' ? (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCourse('all');
                  }}
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Students; 