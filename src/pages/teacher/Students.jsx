import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch instructor's courses
        const coursesResponse = await axios.get(getApiUrl('instructorCourses'), {
          params: { instructorId: currentUser.uid }
        });
        setCourses(coursesResponse.data);

        // Fetch students
        const studentsResponse = await axios.get(getApiUrl('teacherStudents'), {
          params: { teacherId: currentUser.uid }
        });
        setStudents(studentsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchData();
    }
  }, [currentUser]);

  const filteredStudents = students.filter(student => 
    selectedCourse === 'all' || student.courseId === selectedCourse
  );

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>My Students</h1>
        <div className="filter-container">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading students...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(student => (
            <div key={student._id} className="student-card">
              <div className="student-info">
                <h3>{student.name}</h3>
                <p>{student.email}</p>
                <p>Course: {student.courseName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students; 