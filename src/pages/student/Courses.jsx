import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/database';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

const Courses = () => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();
  
  // Get current user from AuthContext
  const { currentUser } = useAuth();
  
  // State for courses
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // State for showing course details modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Function to fetch available courses (separate to only load when needed)
  const fetchAvailableCourses = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const email = currentUser.email;
      if (!email) {
        throw new Error('User email not found');
      }
      
      // Fetch all courses
      const allCoursesResponse = await fetch(`${getApiUrl('courses')}`);
      if (!allCoursesResponse.ok) {
        throw new Error('Failed to fetch available courses');
      }
      const allCourses = await allCoursesResponse.json();
      
      // Transform data for UI
      const formattedAvailable = allCourses
        .filter(course => !course.students.some(student => 
          student.email.toLowerCase() === email.toLowerCase()
        ))
        .map(course => ({
          id: course._id,
          name: course.name,
          instructor: course.instructorName || 'Unknown Instructor',
          enrolled: course.students?.length || 0,
          duration: course.duration || '10 weeks',
          level: course.level || 'Intermediate'
        }));
      
      setAvailableCourses(formattedAvailable);
    } catch {
      setError('Failed to load available courses. Please try again later.');
    }
  }, [currentUser]);

  // Fetch enrolled courses
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCourses() {
      if (!currentUser) return;
      
      try {
        if (isInitialLoad) {
          setIsLoading(true);
        }
        setError(null);
        
        const email = currentUser.email;
        if (!email) {
          throw new Error('User email not found');
        }
        
        const enrolledResponse = await fetch(`${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(email)}`);
        
        if (!enrolledResponse.ok) {
          const errorData = await enrolledResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch enrolled courses');
        }
        
        const enrolledData = await enrolledResponse.json();
        
        // Transform data for UI
        const formattedEnrolled = enrolledData.map(course => {
          let progress = 0;
          if (course.assignmentCount > 0) {
            const completedAssignments = course.assignmentCount - course.pendingCount;
            progress = Math.round((completedAssignments / course.assignmentCount) * 100);
          }
          let submittedAssignments = course.assignmentCount - course.pendingCount;
          
          return {
            id: course._id,
            name: course.name,
            instructor: course.instructorName || 'Unknown Instructor',
            progress: progress,
            nextClass: course.nextClass || 'Not scheduled',
            assignments: course.assignmentCount || 0,
            pendingCount: course.pendingCount || 0,
            submittedAssignments: submittedAssignments || 0,
            description: course.description || 'No description available for this course.',
            status: course.students.find(s => s.email === email.toLowerCase())?.status || 'pending'
          };
        });
        
        if (isMounted) {
          setEnrolledCourses(formattedEnrolled);
          setIsInitialLoad(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || 'Failed to load courses. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchCourses();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, isInitialLoad]);
  
  // Load available courses when switching to that tab
  useEffect(() => {
    if (activeTab === 'available' && availableCourses.length === 0) {
      fetchAvailableCourses();
    }
  }, [activeTab, availableCourses.length, fetchAvailableCourses]);

  // Handle enrolling in a course
  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      
      const email = currentUser.email;
      if (!email) {
        throw new Error('User email not found');
      }
      
      // Get the student's full name
      const studentName = currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser.firstName || currentUser.lastName || 'Student';
      
      // Enroll the student in the course
      const response = await fetch(`${getApiUrl('course')}/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: studentName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }
      
      // Remove from available courses
      setAvailableCourses(availableCourses.filter(course => course.id !== courseId));
      
      // Show success message
      alert('Enrollment request submitted. Awaiting instructor approval.');
      
      // Refresh enrolled courses to show pending status
      const updatedEnrolledResponse = await fetch(`${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(email)}`);
      if (!updatedEnrolledResponse.ok) {
        throw new Error('Failed to refresh enrolled courses');
      }
      
      const updatedEnrolledData = await updatedEnrolledResponse.json();
      const updatedCourses = updatedEnrolledData.map(course => {
        let progress = 0;
        if (course.assignmentCount > 0) {
          const completedAssignments = course.assignmentCount - course.pendingCount;
          progress = Math.round((completedAssignments / course.assignmentCount) * 100);
        }
        
        return {
          id: course._id,
          name: course.name,
          instructor: course.instructorName || 'Unknown Instructor',
          progress: progress,
          nextClass: course.nextClass || 'Not scheduled yet',
          assignments: course.assignmentCount || 0,
          pendingCount: course.pendingCount || 0,
          description: course.description || 'No description available for this course.',
          status: course.students.find(s => s.email === email.toLowerCase())?.status || 'pending'
        };
      });
      
      setEnrolledCourses(updatedCourses);
    } catch (err) {
      alert('Failed to enroll in the course. Please try again later.');
    } finally {
      setEnrolling(false);
    }
  };

  // Navigate to assignments filtered by course
  const viewCourseAssignments = (courseName) => {
    // Navigate to assignments page with course name as state parameter
    navigate('/student/assignments', { state: { selectedCourse: courseName } });
  };

  // Show course details modal
  const showCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  // Filter courses based on search term
  const filterCourses = (courses) => {
    return courses.filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredEnrolledCourses = filterCourses(enrolledCourses);
  const filteredAvailableCourses = filterCourses(availableCourses);

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Course Catalog</h1>
          <p className="welcome-subtitle">View your courses and discover new ones</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'enrolled' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrolled')}
          >
            My Courses
          </button>
          <button 
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Courses
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          Loading courses...
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <div className="content-grid">
          {activeTab === 'enrolled' ? (
            <>
              <div className="content-card full-width">
                <div className="card-header">
                  <h2 className="card-title">My Enrolled Courses</h2>
                </div>
                {filteredEnrolledCourses.length > 0 ? (
                  <div className="enrolled-courses">
                    {filteredEnrolledCourses.map(course => (
                      <div key={course.id} className={`enrolled-course-item ${course.status}`}>
                        <div className="course-header">
                          <h3 className="course-name">{course.name}</h3>
                          <span className="course-instructor">{course.instructor}</span>
                        </div>
                        <div className="course-progress-container">
                          <div className="progress-label">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="course-details">
                          <div className="detail-item">
                            <span className="detail-icon">🎯</span>
                            <span className="detail-text">Total Assignments: {course.assignments}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">☑️</span>
                            <span className="detail-text">Submitted Assignments: {course.submittedAssignments}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📝</span>
                            <span className="detail-text">Pending Assignments: {course.pendingCount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📋</span>
                            <span className="detail-text">
                              Status: <span className={`status-badge ${course.status}`}>{course.status}</span>
                            </span>
                          </div>
                        </div>
                        <div className="course-actions">
                          <button 
                            className="action-button primary"
                            onClick={() => showCourseDetails(course)}
                          >
                            About Course
                          </button>
                          {course.status === 'approved' && (
                            <button 
                              className="action-button secondary"
                              onClick={() => viewCourseAssignments(course.name)}
                            >
                              View Assignments
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-enrolled-courses">
                    <p>You haven't enrolled in any courses yet.</p>
                    <button className="action-button primary" onClick={() => setActiveTab('available')}>
                      Browse Available Courses
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="content-card full-width">
                <div className="card-header">
                  <h2 className="card-title">Available Courses</h2>
                </div>
                {filteredAvailableCourses.length > 0 ? (
                  <div className="available-courses">
                    {filteredAvailableCourses.map(course => (
                      <div key={course.id} className="available-course-item">
                        <div className="course-header">
                          <h3 className="course-name">{course.name}</h3>
                          <span className="course-instructor">{course.instructor}</span>
                        </div>
                        <div className="course-details">
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span className="detail-text">{course.enrolled} students enrolled</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">⏱️</span>
                            <span className="detail-text">Duration: {course.duration}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📊</span>
                            <span className="detail-text">Level: {course.level}</span>
                          </div>
                        </div>
                        <div className="course-actions">
                          <button 
                            className="action-button primary"
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrolling}
                          >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                          </button>
                          <button className="action-button secondary">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    No available courses match your search
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedCourse.name}</h2>
              <button className="close-button" onClick={() => setShowCourseModal(false)}>×</button>
            </div>
            <div className="course-details-modal">
              <div className="course-detail-item">
                <h3>Instructor</h3>
                <p>{selectedCourse.instructor}</p>
              </div>
              <div className="course-detail-item">
                <h3>Progress</h3>
                <div className="course-progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${selectedCourse.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{selectedCourse.progress}%</span>
                </div>
              </div>
              <div className="course-detail-item">
                <h3>Assignments</h3>
                <p>Total: {selectedCourse.assignments}</p>
                <p>Submitted: {selectedCourse.submittedAssignments}</p>
                <p>Pending: {selectedCourse.pendingCount}</p>
              </div>
              <div className="course-detail-item">
                <h3>Description</h3>
                <p>{selectedCourse.description || "No description available for this course."}</p>
              </div>
            </div>
            <div className="modal-footer">
              {selectedCourse.status === 'approved' && (
                <button 
                  className="action-button secondary"
                  onClick={() => {
                    setShowCourseModal(false);
                    viewCourseAssignments(selectedCourse.name);
                  }}
                >
                  View Assignments
                </button>
              )}
              <button 
                className="close-button"
                onClick={() => setShowCourseModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;