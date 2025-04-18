import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import axios from 'axios';
import './Classes.css';

const Classes = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    code: ''
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("DEBUG: Fetching courses for instructor:", currentUser?.id);
        const response = await axios.get(getApiUrl('instructorCourses'), {
          params: { instructorId: currentUser.id }
        });
        console.log("DEBUG: Fetched courses:", response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchCourses();
    }
  }, [currentUser]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCourse.name.trim()) {
      alert('Course name is required');
      return;
    }
    
    if (!currentUser?.id) {
      alert('User ID is not available. Please try logging in again.');
      return;
    }

    try {
      console.log("DEBUG: Creating course with data:", {
        name: newCourse.name.trim(),
        description: newCourse.description.trim(),
        code: newCourse.code.trim(),
        instructorId: currentUser.id,
        instructorName: `${currentUser.firstName} ${currentUser.lastName}`.trim()
      });

      const response = await axios.post(getApiUrl('courses'), {
        name: newCourse.name.trim(),
        description: newCourse.description.trim(),
        code: newCourse.code.trim(),
        instructorId: currentUser.id,
        instructorName: `${currentUser.firstName} ${currentUser.lastName}`.trim()
      });
      
      console.log("DEBUG: Course created successfully:", response.data);
      setCourses([...courses, response.data]);
      setShowCreateModal(false);
      setNewCourse({ name: '', description: '', code: '' });
    } catch (err) {
      console.error('Error creating course:', err);
      alert(err.response?.data?.error || 'Failed to create course. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>My Courses</h1>
        <button 
          className="create-button"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Course
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading courses...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <div className="course-info">
                    <h3>{course.name}</h3>
                    <p>{course.description || "No description provided"}</p>
                    <div className="course-students">
                      {course.students?.length || 0} students enrolled
                    </div>
                    {course.code && <div className="course-code">Code: {course.code}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>You haven't created any courses yet.</p>
              <button 
                className="action-button primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Course
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  required
                  placeholder="Enter course name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Enter course description"
                />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  placeholder="Enter course code"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes; 