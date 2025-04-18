import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getTeacherAssignments, 
  getInstructorCourses, 
  createAssignment, 
  updateAssignment 
} from '../../firebase/firestoreService';
import './TeacherAssignments.css';

const TeacherAssignments = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentClass, setNewAssignmentClass] = useState('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  
  // Get current user
  const { currentUser } = useAuth();
  
  // State for assignments and courses
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);

  // Force component to update
  const forceUpdate = useCallback(() => {
    setRenderKey(prevKey => prevKey + 1);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  // Function to fetch data - extracted for reuse
  const fetchData = async () => {
    if (!currentUser) {
      console.log("No current user found - cannot fetch assignments");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("FETCH STARTED: Current User:", currentUser);
      console.log("FETCH STARTED: User ID:", currentUser.uid);
      
      // Fetch courses first
      const fetchedCourses = await getInstructorCourses(currentUser.uid);
      console.log("DEBUG: Fetched Courses:", JSON.stringify(fetchedCourses));
      
      // Format courses for the dropdown
      const formattedCourses = fetchedCourses.map(course => ({
        id: course.id,
        name: course.name
      }));
      console.log("DEBUG: Formatted Courses:", JSON.stringify(formattedCourses));
      
      setClasses(formattedCourses);
      
      // If there are courses, set the first one as default for new assignments
      if (formattedCourses.length > 0) {
        setNewAssignmentClass(formattedCourses[0].id);
      } else {
        console.warn("WARNING: No courses found for this teacher");
      }
      
      // Fetch assignments
      console.log("DEBUG: Attempting to fetch assignments for teacherId:", currentUser.uid);
      const fetchedAssignments = await getTeacherAssignments(currentUser.uid);
      console.log("DEBUG: Fetched Assignments:", JSON.stringify(fetchedAssignments));
      
      // Format assignments for UI
      const formattedAssignments = fetchedAssignments.map(assignment => {
        // Calculate submission stats (in a real app, this would come from your backend)
        const totalStudents = Math.floor(Math.random() * 30) + 10; // Random for demo
        const submissions = Math.floor(Math.random() * totalStudents);
        
        // Ensure all required properties exist
        return {
          id: assignment.id || 'unknown-id',
          title: assignment.title || 'Untitled Assignment',
          class: assignment.courseName || 'Unknown Class',
          description: assignment.description || 'No description provided',
          publishedDate: assignment.createdAt ? new Date(assignment.createdAt.seconds * 1000).toISOString().split('T')[0] : 'Unknown',
          deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : 'Unknown',
          status: assignment.status || 'active',
          submissions,
          totalStudents
        };
      });
      
      console.log("DEBUG: Formatted Assignments:", JSON.stringify(formattedAssignments));
      console.log("DEBUG: Setting assignments state with count:", formattedAssignments.length);
      
      // Update the assignments state and force a re-render
      setAssignments([...formattedAssignments]);
      forceUpdate();
      
      // Add animation highlighting to make changes more visible
      document.querySelector('.assignment-list')?.classList.add('highlight-update');
      setTimeout(() => {
        document.querySelector('.assignment-list')?.classList.remove('highlight-update');
      }, 1500);
      
      console.log("DEBUG: Fetch completed successfully");
    } catch (err) {
      console.error('ERROR FETCHING DATA:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teacher's courses and assignments
  useEffect(() => {
    console.log("DEBUG: useEffect triggered. Current user:", currentUser?.uid);
    if (currentUser?.uid) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Handler for creating a new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentClass || !newAssignmentDeadline) {
      console.log("Missing required fields:", { 
        title: newAssignmentTitle, 
        class: newAssignmentClass, 
        deadline: newAssignmentDeadline 
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Find the selected course
      const selectedCourseObj = classes.find(c => c.id === newAssignmentClass);
      console.log("DEBUG: Selected course:", selectedCourseObj);
      
      if (!selectedCourseObj) {
        throw new Error("Selected course not found");
      }
      
      // Create assignment data
      const assignmentData = {
        title: newAssignmentTitle,
        description: newAssignmentDescription,
        courseId: newAssignmentClass,
        courseName: selectedCourseObj.name,
        teacherId: currentUser.uid,
        instructorName: `${currentUser.profile?.firstName || ''} ${currentUser.profile?.lastName || ''}`.trim() || 'Teacher',
        deadline: new Date(newAssignmentDeadline),
        status: 'draft'
      };
      
      console.log("DEBUG: Assignment data to be created:", assignmentData);
      
      // Create the assignment in Firestore
      const result = await createAssignment(assignmentData);
      console.log("DEBUG: Assignment created successfully:", result);
      
      // Reset form
      setNewAssignmentTitle('');
      setNewAssignmentDescription('');
      setNewAssignmentDeadline('');
      
      // Close modal
      setShowModal(false);
      
      // Wait a moment for Firestore to process
      setTimeout(async () => {
        console.log("DEBUG: Refreshing assignments after creation");
        await fetchData();
      }, 500);
      
    } catch (err) {
      console.error('ERROR CREATING ASSIGNMENT:', err);
      alert('Failed to create assignment. Please try again. Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for publishing a draft assignment
  const handlePublishAssignment = async (id) => {
    try {
      setIsLoading(true);
      
      // Update the assignment status in Firestore
      await updateAssignment(id, { status: 'active' });
      
      // Refresh the assignments list instead of just updating the UI
      await fetchData();
      
    } catch (err) {
      console.error('Error publishing assignment:', err);
      alert('Failed to publish assignment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter assignments based on selected class and status
  const filteredAssignments = assignments.filter(assignment => {
    const matchesClass = selectedClass === 'all' || assignment.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    return matchesClass && matchesStatus;
  });

  return (
    <div className="dashboard-container" key={renderKey}>
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Assignments</h1>
          <p className="welcome-subtitle">Create, monitor, and grade student assignments</p>
        </div>
        <button className="report-button" onClick={() => setShowModal(true)}>
          <span className="text-xl">➕</span>
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="filters-section">
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
        <div className="filter-container">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">Assignment List</h2>
            <div className="card-actions">
              <div className="assignment-count">
                {filteredAssignments.length} assignments 
                <span className="last-updated"> (Updated: {lastUpdated})</span>
              </div>
              <button 
                className="refresh-button" 
                onClick={() => {
                  fetchData();
                  forceUpdate();
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {isLoading && (
            <div className="loading-state">
              <p>Loading assignments...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="assignment-list">
              <div className="assignment-list-header">
                <div className="assignment-title">Title</div>
                <div className="assignment-class">Class</div>
                <div className="assignment-date">Published</div>
                <div className="assignment-deadline">Deadline</div>
                <div className="assignment-submissions">Submissions</div>
                <div className="assignment-status">Status</div>
                <div className="assignment-actions">Actions</div>
              </div>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-item">
                    <div className="assignment-title">{assignment.title}</div>
                    <div className="assignment-class">{assignment.class}</div>
                    <div className="assignment-date">{assignment.publishedDate}</div>
                    <div className="assignment-deadline">{assignment.deadline}</div>
                    <div className="assignment-submissions">
                      {assignment.status === 'draft' 
                        ? '-' 
                        : `${assignment.submissions}/${assignment.totalStudents}`}
                    </div>
                    <div className={`assignment-status-badge ${assignment.status}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </div>
                    <div className="assignment-actions">
                      {assignment.status === 'draft' ? (
                        <button 
                          className="action-button publish"
                          onClick={() => handlePublishAssignment(assignment.id)}
                        >
                          Publish
                        </button>
                      ) : assignment.status === 'active' ? (
                        <button className="action-button grade">
                          Grade
                        </button>
                      ) : (
                        <button className="action-button view">
                          View
                        </button>
                      )}
                      <button className="action-button edit">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-assignments">
                  <p>No assignments found matching your filters.</p>
                  <button 
                    className="create-first-assignment" 
                    onClick={() => setShowModal(true)}
                  >
                    Create Your First Assignment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating a new assignment */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Assignment</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label htmlFor="assignmentTitle">Title</label>
                <input
                  type="text"
                  id="assignmentTitle"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignmentClass">Class</label>
                {classes.length > 0 ? (
                  <select
                    id="assignmentClass"
                    value={newAssignmentClass}
                    onChange={(e) => setNewAssignmentClass(e.target.value)}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(classItem => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="no-classes-warning">
                    <p>You need to create a class first</p>
                    <button 
                      type="button" 
                      className="action-button primary"
                      onClick={() => {
                        setShowModal(false);
                        window.location.href = '/classes';
                      }}
                    >
                      Create Class
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="assignmentDeadline">Deadline</label>
                <input
                  type="date"
                  id="assignmentDeadline"
                  value={newAssignmentDeadline}
                  onChange={(e) => setNewAssignmentDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignmentDescription">Description</label>
                <textarea
                  id="assignmentDescription"
                  value={newAssignmentDescription}
                  onChange={(e) => setNewAssignmentDescription(e.target.value)}
                  rows="4"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting || classes.length === 0}
                >
                  {isSubmitting ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments; 