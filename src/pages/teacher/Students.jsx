import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Students.css';

const Students = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

        setStudents(Array.from(allStudentsMap.values()));
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

  const handleStudentClick = (email) => {
    navigate(`/teacher/students/${encodeURIComponent(email)}/submissions`);
  };

  const displayLoading = isLoading || authLoading;

  return (
    <div className="students-container">
      <h1>Enrolled Students</h1>
      {displayLoading && <p>Loading students...</p>}
      {error && !displayLoading && <p className="error-message">{error}</p>}
      {!displayLoading && !error && (
        students.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Enrolled Courses</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr 
                  key={student.email} 
                  onClick={() => handleStudentClick(student.email)}
                  className="student-row"
                >
                  <td>{student.name || 'N/A'}</td>
                  <td>{student.email}</td>
                  <td>{student.courses.join(', ')}</td> 
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students are currently enrolled in your courses.</p>
        )
      )}
    </div>
  );
};

export default Students; 