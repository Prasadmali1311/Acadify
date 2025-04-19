import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../../config/database';
import './TeacherAssignments.css';

const TeacherAssignments = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentClass, setNewAssignmentClass] = useState('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  const [newAssignmentTotalMarks, setNewAssignmentTotalMarks] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [renderKey, setRenderKey] = useState(0);
  
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
      console.log("FETCH STARTED: User ID:", currentUser.id);
      
      // Get the instructor ID from the user's profile or use a default
      const instructorId = currentUser.id;
      
      // Fetch courses first
      const coursesResponse = await axios.get(getApiUrl('instructorCourses'), {
        params: { instructorId }
      });
      console.log("DEBUG: Fetched Courses:", coursesResponse.data);
      
      // Format courses for the dropdown
      const formattedCourses = coursesResponse.data.map(course => ({
        id: course._id,
        name: course.name
      }));
      console.log("DEBUG: Formatted Courses:", formattedCourses);
      
      setClasses(formattedCourses);
      
      // If there are courses, set the first one as default for new assignments
      if (formattedCourses.length > 0) {
        setNewAssignmentClass(formattedCourses[0].id);
      } else {
        console.warn("WARNING: No courses found for this instructor");
      }
      
      // Fetch assignments
      console.log("DEBUG: Attempting to fetch assignments for instructorId:", instructorId);
      const assignmentsResponse = await axios.get(getApiUrl('teacherAssignments'), {
        params: { instructorId }
      });
      console.log("DEBUG: Fetched Assignments:", assignmentsResponse.data);
      
      // Format assignments for UI
      const formattedAssignments = await Promise.all(assignmentsResponse.data.map(async assignment => {
        // Fetch real submission stats from the backend
        let totalStudents = 0;
        let submissions = 0;
        
        try {
          const statsResponse = await axios.get(`${getApiUrl('assignment')}/${assignment._id}/stats`);
          totalStudents = statsResponse.data.totalStudents;
          submissions = statsResponse.data.submissions;
          console.log(`DEBUG: Fetched stats for assignment ${assignment._id}:`, statsResponse.data);
        } catch (err) {
          console.error(`Error fetching stats for assignment ${assignment._id}:`, err);
          // Fallback to defaults
          totalStudents = 0;
          submissions = 0;
        }
        
        return {
          id: assignment._id,
          title: assignment.title || 'Untitled Assignment',
          class: assignment.courseName || 'Unknown Class',
          description: assignment.description || 'No description provided',
          publishedDate: assignment.createdAt ? new Date(assignment.createdAt).toISOString().split('T')[0] : 'Unknown',
          deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : 'Unknown',
          status: assignment.status || 'active',
          submissions,
          totalStudents
        };
      }));
      
      console.log("DEBUG: Formatted Assignments:", formattedAssignments);
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
    console.log("DEBUG: useEffect triggered. Current user:", currentUser?.id);
    if (currentUser?.id) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Handler for creating a new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!classes || classes.length === 0) {
      alert('Please create a class first before creating an assignment.');
      return;
    }
    
    if (!newAssignmentClass) {
      alert('Please select a class for this assignment.');
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
      
      // Get the instructor ID from the user's profile or use a default
      const instructorId = currentUser.id;
      
      // Create assignment data
      const assignmentData = {
        title: newAssignmentTitle,
        description: newAssignmentDescription,
        courseId: newAssignmentClass,
        courseName: selectedCourseObj.name,
        instructorId: instructorId,
        instructorName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Teacher',
        deadline: new Date(newAssignmentDeadline),
        totalMarks: newAssignmentTotalMarks,
        status: 'draft'
      };
      
      console.log("DEBUG: Assignment data to be created:", assignmentData);
      
      // Create the assignment using MongoDB API
      const response = await axios.post(getApiUrl('createAssignment'), assignmentData);
      console.log("DEBUG: Assignment created successfully:", response.data);
      
      // Reset form
      setNewAssignmentTitle('');
      setNewAssignmentDescription('');
      setNewAssignmentDeadline('');
      setNewAssignmentTotalMarks(100);
      
      // Close modal
      setShowModal(false);
      
      // Wait a moment for the database to process
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
      
      // Update the assignment status using MongoDB API
      await axios.put(getApiUrl('updateAssignment'), {
        assignmentId: id,
        status: 'active'
      });
      
      // Refresh the assignments list
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
              <div className="loading-spinner"></div>
              <p>Loading assignments...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="assignment-list-container">
              <div className="assignment-list">
                <div className="assignment-list-header">
                  <div className="assignment-title">Title</div>
                  <div className="assignment-class">Class</div>
                  <div className="assignment-date">Published</div>
                  <div className="assignment-deadline">Deadline</div>
                  <div className="assignment-submissions">Submissions</div>
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
                      <div className="assignment-actions">
                        <div className="action-buttons-container">
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
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-assignments">
                    <div className="no-assignments-content">
                      <p>No assignments found matching your filters.</p>
                      <button 
                        className="create-first-assignment" 
                        onClick={() => setShowModal(true)}
                      >
                        Create Your First Assignment
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                        window.location.href = '/teacher/classes';
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
                  type="datetime-local"
                  id="assignmentDeadline"
                  value={newAssignmentDeadline}
                  onChange={(e) => setNewAssignmentDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignmentTotalMarks">Total Marks</label>
                <input
                  type="number"
                  id="assignmentTotalMarks"
                  min="1"
                  max="1000"
                  value={newAssignmentTotalMarks}
                  onChange={(e) => setNewAssignmentTotalMarks(parseInt(e.target.value, 10))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignmentDescription">Description</label>
                <textarea
                  id="assignmentDescription"
                  value={newAssignmentDescription}
                  onChange={(e) => setNewAssignmentDescription(e.target.value)}
                  placeholder="Enter assignment description"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}>
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