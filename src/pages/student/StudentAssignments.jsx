import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getStudentAssignments, 
  getEnrolledCourses, 
  submitAssignment
} from '../../firebase/firestoreService';
import './StudentAssignments.css';

const StudentAssignments = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileAttached, setFileAttached] = useState(false);
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
  const fetchData = async (forceRefresh = false) => {
    if (!currentUser) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch enrolled courses first
      const fetchedCourses = await getEnrolledCourses(currentUser.uid);
      
      // Format courses for dropdown
      const formattedCourses = fetchedCourses.map(course => ({
        id: course.id,
        name: course.name
      }));
      
      setClasses(formattedCourses);
      
      // Fetch assignments
      const fetchedAssignments = await getStudentAssignments(currentUser.uid);
      
      // Format assignments for display
      const formattedAssignments = fetchedAssignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title || 'Untitled Assignment',
        class: assignment.courseName || 'Unknown Course',
        courseId: assignment.courseId || 'unknown-course',
        instructor: assignment.instructorName || 'Instructor',
        deadline: assignment.deadline,
        status: assignment.status || 'pending',
        description: assignment.description || 'No description provided',
        submittedDate: assignment.submissionDate,
        gradedDate: assignment.gradedDate,
        grade: assignment.grade,
        feedback: assignment.feedback,
        graded: assignment.status === 'graded'
      }));
      
      // Update the assignments state and force a re-render
      setAssignments([...formattedAssignments]);
      forceUpdate();
      
      // Add animation highlighting to make changes more visible
      document.querySelector('.assignment-cards')?.classList.add('highlight-update');
      setTimeout(() => {
        document.querySelector('.assignment-cards')?.classList.remove('highlight-update');
      }, 1500);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student's assignments and courses
  useEffect(() => {
    if (currentUser?.uid) {
      fetchData();
    }
  }, [currentUser]);

  // Calculate days left or overdue
  const getDaysIndicator = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="overdue">{Math.abs(diffDays)} days overdue</span>;
    } else if (diffDays === 0) {
      return <span className="due-today">Due today</span>;
    } else {
      return <span className="days-left">{diffDays} days left</span>;
    }
  };

  // Filter assignments based on selected status and class
  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesClass = selectedClass === 'all' || assignment.class === selectedClass;
    return matchesStatus && matchesClass;
  });

  // Handle opening the submission modal
  const handleOpenSubmitModal = (assignment) => {
    setCurrentAssignment(assignment);
    setShowSubmitModal(true);
  };

  // Handle submitting an assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Create submission object
      const submissionData = {
        assignmentId: currentAssignment.id,
        studentId: currentUser.uid,
        courseId: currentAssignment.courseId,
        content: submissionText,
        fileAttached,
        submissionDate: new Date().toISOString()
      };
      
      // Submit to Firestore
      const result = await submitAssignment(submissionData);
      
      // Reset form and close modal
      setSubmissionText('');
      setFileAttached(false);
      setShowSubmitModal(false);
      
      // Wait a moment for Firestore to process
      setTimeout(async () => {
        await fetchData(true);
        alert('Assignment submitted successfully!');
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container" key={renderKey}>
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Assignments</h1>
          <p className="welcome-subtitle">View, submit, and manage your course assignments</p>
        </div>
        <div className="action-buttons">
          <button 
            className="refresh-button" 
            onClick={() => {
              fetchData(true);
              forceUpdate();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
        <div className="last-updated-info">
          Updated: {lastUpdated}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <>
          {assignments.length === 0 && (
            <div className="empty-state">
              <h3>No assignments found</h3>
              <p>You don't have any assignments yet. This could be because:</p>
              <ul>
                <li>You are not enrolled in any courses</li>
                <li>Your courses don't have any assignments yet</li>
                <li>There was an error loading your assignments</li>
              </ul>
              <div className="empty-state-actions">
                <button 
                  className="primary-button"
                  onClick={() => window.location.href = '/courses'}
                >
                  Explore Available Courses
                </button>
                <button 
                  className="secondary-button"
                  onClick={fetchData}
                >
                  Refresh Assignments
                </button>
              </div>
            </div>
          )}
          
          {assignments.length > 0 && (
            <div className="assignment-cards">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className={`assignment-card ${assignment.status}`}>
                    <div className="assignment-card-header">
                      <h3 className="assignment-card-title">{assignment.title}</h3>
                      <div className={`assignment-card-status ${assignment.status}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </div>
                    </div>
                    <div className="assignment-card-class">
                      <span>{assignment.class}</span>
                      <span className="assignment-card-instructor">{assignment.instructor}</span>
                    </div>
                    <div className="assignment-card-description">
                      {assignment.description}
                    </div>
                    <div className="assignment-card-meta">
                      {assignment.status === 'pending' && (
                        <>
                          <div className="assignment-card-deadline">
                            <span className="meta-label">Deadline:</span>
                            <span>{assignment.deadline instanceof Date ? 
                                  assignment.deadline.toLocaleDateString() : 
                                  (typeof assignment.deadline === 'string' ? 
                                    new Date(assignment.deadline).toLocaleDateString() : 
                                    'Unknown date')}</span>
                          </div>
                          <div className="assignment-card-days">
                            {getDaysIndicator(assignment.deadline)}
                          </div>
                        </>
                      )}
                      {assignment.status === 'submitted' && (
                        <>
                          <div className="assignment-card-deadline">
                            <span className="meta-label">Submitted:</span>
                            <span>{assignment.submittedDate instanceof Date ? 
                                  assignment.submittedDate.toLocaleDateString() : 
                                  (typeof assignment.submittedDate === 'string' ? 
                                    new Date(assignment.submittedDate).toLocaleDateString() : 
                                    'Unknown date')}</span>
                          </div>
                          <div className="assignment-card-status-text">
                            Awaiting grade
                          </div>
                        </>
                      )}
                      {assignment.status === 'graded' && (
                        <>
                          <div className="assignment-card-grade">
                            <span className="meta-label">Grade:</span>
                            <span className="grade">{assignment.grade}</span>
                          </div>
                          <div className="assignment-card-feedback">
                            <span className="meta-label">Feedback:</span>
                            <span>{assignment.feedback}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="assignment-card-actions">
                      <button className="action-button view">View Details</button>
                      {assignment.status === 'pending' && (
                        <button 
                          className="action-button submit"
                          onClick={() => handleOpenSubmitModal(assignment)}
                        >
                          Submit
                        </button>
                      )}
                      {assignment.status === 'submitted' && (
                        <button className="action-button edit">Edit Submission</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-assignments">
                  <p>No assignments match your criteria.</p>
                  <button 
                    className="filter-reset-button" 
                    onClick={() => {
                      setSelectedStatus('all');
                      setSelectedClass('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal for submitting an assignment */}
      {showSubmitModal && currentAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit Assignment: {currentAssignment.title}</h2>
              <button className="close-button" onClick={() => setShowSubmitModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label htmlFor="submissionText">Submission Text (Optional)</label>
                <textarea
                  id="submissionText"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows="6"
                  placeholder="Type your response or any comments about your submission here..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="submissionFile">Upload Files</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="submissionFile"
                    onChange={() => setFileAttached(true)}
                    className="file-input"
                  />
                  <button type="button" className="file-upload-button">
                    Choose File
                  </button>
                  <span className="file-status">
                    {fileAttached ? "File selected" : "No file chosen"}
                  </span>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => !isSubmitting && setShowSubmitModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments; 