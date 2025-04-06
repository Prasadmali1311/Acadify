import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInstructorCourses, createCourse } from '../../firebase/firestoreService';
import './Classes.css';

const Classes = () => {
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user from AuthContext
  const { currentUser } = useAuth();
  
  // State for courses
  const [classes, setClasses] = useState([]);

  // Fetch classes from Firestore
  useEffect(() => {
    async function fetchClasses() {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedCourses = await getInstructorCourses(currentUser.uid);
        
        // Transform data to match our UI format
        const formattedCourses = fetchedCourses.map(course => ({
          id: course.id,
          name: course.name,
          description: course.description,
          students: 0, // You might want to calculate this from enrollments
          nextClass: course.nextClass || 'Not scheduled yet'
        }));
        
        setClasses(formattedCourses);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (currentUser) {
      fetchClasses();
    }
  }, [currentUser]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName) return;
    
    try {
      setIsLoading(true);
      
      const newCourseData = {
        name: newClassName,
        description: newClassDescription,
        instructorId: currentUser.uid,
        instructorName: `${currentUser.profile?.firstName || ''} ${currentUser.profile?.lastName || ''}`.trim() || 'Teacher',
        level: 'Beginner',
        duration: '10 weeks',
        status: 'active'
      };
      
      const createdCourse = await createCourse(newCourseData);
      
      // Add the new course to the state
      setClasses([...classes, {
        id: createdCourse.id,
        name: createdCourse.name,
        description: createdCourse.description,
        students: 0,
        nextClass: 'Not scheduled yet'
      }]);
      
      setNewClassName('');
      setNewClassDescription('');
      setShowModal(false);
    } catch (err) {
      console.error('Error creating class:', err);
      setError('Failed to create class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Classes</h1>
          <p className="welcome-subtitle">Manage and monitor your classes</p>
        </div>
        <button className="report-button" onClick={() => setShowModal(true)}>
          <span className="text-xl">➕</span>
          <span>Create Class</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">All Classes</h2>
          </div>
          
          {isLoading && (
            <div className="loading-state">
              <p>Loading classes...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {!isLoading && !error && (
            <>
              {classes.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't created any classes yet.</p>
                  <button className="create-first-class" onClick={() => setShowModal(true)}>
                    Create Your First Class
                  </button>
                </div>
              ) : (
                <div className="class-list">
                  <div className="class-list-header">
                    <div className="class-name">Class Name</div>
                    <div className="class-students">Students</div>
                    <div className="class-description">Description</div>
                    <div className="class-next">Next Session</div>
                  </div>
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="class-item">
                      <div className="class-name">{classItem.name}</div>
                      <div className="class-students">{classItem.students} students</div>
                      <div className="class-description">{classItem.description}</div>
                      <div className="class-next">{classItem.nextClass}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for creating a new class */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Class</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="classDescription">Description</label>
                <textarea
                  id="classDescription"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes; 