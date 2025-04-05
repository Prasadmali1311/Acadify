import { useState } from 'react';
import './Courses.css';

const Courses = () => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample enrolled courses data
  const enrolledCourses = [
    { id: 1, name: 'Mathematics 101', instructor: 'Dr. Alan Johnson', progress: 75, nextClass: 'Monday, 10:00 AM', assignments: 2 },
    { id: 2, name: 'Physics for Beginners', instructor: 'Prof. Maria Garcia', progress: 60, nextClass: 'Wednesday, 2:00 PM', assignments: 1 },
    { id: 3, name: 'Introduction to Literature', instructor: 'Dr. Emily Wilson', progress: 90, nextClass: 'Friday, 11:00 AM', assignments: 0 },
  ];

  // Sample available courses data
  const availableCourses = [
    { id: 4, name: 'Chemistry Advanced', instructor: 'Dr. Robert Chen', enrolled: 24, duration: '12 weeks', level: 'Advanced' },
    { id: 5, name: 'Computer Science Basics', instructor: 'Prof. James Smith', enrolled: 56, duration: '10 weeks', level: 'Beginner' },
    { id: 6, name: 'Art History', instructor: 'Dr. Sophia Rodriguez', enrolled: 32, duration: '8 weeks', level: 'Intermediate' },
    { id: 7, name: 'Business Economics', instructor: 'Prof. Michael Brown', enrolled: 45, duration: '14 weeks', level: 'Intermediate' },
  ];

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
                    <div key={course.id} className="enrolled-course-item">
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
                          <span className="detail-icon">📅</span>
                          <span className="detail-text">Next: {course.nextClass}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📝</span>
                          <span className="detail-text">{course.assignments} pending assignments</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="action-button primary">Continue Learning</button>
                        <button className="action-button secondary">View Syllabus</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">No enrolled courses match your search</div>
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
                        <button className="action-button primary">Enroll Now</button>
                        <button className="action-button secondary">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">No available courses match your search</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Courses; 