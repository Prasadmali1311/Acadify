import { useState, useEffect, useCallback, useReducer } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { getApiUrl } from '../../config/database';
import './StudentAssignments.css';

// Reducer for force update
const forceUpdateReducer = (state) => state + 1;

const StudentAssignments = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [renderKey, forceUpdate] = useReducer(forceUpdateReducer, 0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileIds, setFileIds] = useState([]);
  
  // Get current user
  const { currentUser } = useAuth();
  
  // State for assignments and courses
  const [assignments, setAssignments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  // Fetch student's assignments and courses for filters
  useEffect(() => {
    const fetchDataAndCourses = async () => {
      if (currentUser?.email) {
        console.log('[EFFECT] Fetching data for email:', currentUser.email);
        setIsLoading(true); // Start loading before fetches
        try {
          // Fetch Courses for filter dropdown
          console.log(`[EFFECT] Attempting to fetch courses from: ${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(currentUser.email)}`);
          const coursesResponse = await fetch(`${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(currentUser.email)}`);
          
          console.log('[EFFECT] Courses response status:', coursesResponse.status);
          if (!coursesResponse.ok) {
            const errorText = await coursesResponse.text();
            console.error('[EFFECT] Courses response error text:', errorText);
            throw new Error(`Failed to fetch courses: ${coursesResponse.status} ${errorText}`);
          }
          
          const coursesData = await coursesResponse.json();
          setAllCourses(coursesData); // Set courses for filter
          console.log('[EFFECT] Fetched courses for filter:', coursesData);

          // Fetch Assignments (using the separate fetchData function)
          await fetchData(); 
          
          setError(null); // Clear error after successful fetches
        } catch (err) {
          console.error('[EFFECT] Error fetching initial data:', err);
          setError(err.message || 'Failed to load initial data');
        } finally {
           // Loading state is handled within fetchData
        }
      } else {
        console.log('[EFFECT] No email found in currentUser:', currentUser);
        setError('Please log in to view your assignments.');
        setIsLoading(false); // Ensure loading stops if no user
      }
    };
    fetchDataAndCourses();
  }, [currentUser]); // Depend only on currentUser

  // Function to fetch assignments data (called by effect and after submit)
  const fetchData = async () => {
    console.log(`[FETCH_DATA] Starting fetch for email: ${currentUser?.email}`);
    try {
      setIsLoading(true);
      const email = currentUser?.email;
      if (!email) {
        throw new Error('User email not found');
      }

      // Fetch enrolled courses (Not strictly needed for status, but might be useful context)
      // const coursesResponse = await fetch(`${getApiUrl('enrolledCourses')}?email=${encodeURIComponent(email)}`);
      // if (!coursesResponse.ok) {
      //   throw new Error('Failed to fetch courses');
      // }
      // const coursesData = await coursesResponse.json();
      // setCourses(coursesData);
      // console.log(`[FETCH_DATA] Fetched courses:`, coursesData);

      // Fetch assignments
      console.log(`[FETCH_DATA] Fetching assignments from: ${getApiUrl('studentAssignments')}?email=${encodeURIComponent(email)}`);
      const assignmentsResponse = await fetch(`${getApiUrl('studentAssignments')}?email=${encodeURIComponent(email)}`);
      if (!assignmentsResponse.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const assignmentsData = await assignmentsResponse.json();
      console.log(`[FETCH_DATA] Received assignments data from backend:`, JSON.stringify(assignmentsData, null, 2)); // Log the raw data
      setAssignments(assignmentsData); // Update state
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load assignments');
    } finally {
      setIsLoading(false);
      console.log(`[FETCH_DATA] Fetch finished.`);
    }
  };

  // Filter assignments based on selected status and class
  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesClass = selectedClass === 'all' || assignment.courseName === selectedClass;
    return matchesStatus && matchesClass;
  });

  // Handle file upload
  const onDrop = useCallback(acceptedFiles => {
    setUploadedFiles(acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      progress: 0
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    }
  });

  // Handle opening the submission modal
  const handleOpenSubmitModal = (assignment) => {
    setCurrentAssignment(assignment);
    setShowSubmitModal(true);
    setUploadedFiles([]);
    setSubmissionText('');
    setFileIds([]);
  };

  // Handle submitting an assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!currentAssignment) return;

    try {
      setIsSubmitting(true);
      const email = currentUser.email;
      
      // Upload files first if any and they haven't been uploaded yet
      let submissionFileIds = [...fileIds]; // Use already uploaded files
      
      if (uploadedFiles.length > 0 && fileIds.length === 0) {
        for (const fileObj of uploadedFiles) {
          const formData = new FormData();
          formData.append('file', fileObj.file);
          formData.append('userEmail', email); // Add user email to track who uploaded the file
          
          const response = await axios.post(getApiUrl('upload'), formData, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({
                ...prev,
                [fileObj.name]: progress
              }));
            }
          });
          
          if (response.data && response.data.fileId) {
            submissionFileIds.push(response.data.fileId);
          }
        }
      }

      // Create submission data with the correct structure
      const submissionData = {
        assignmentId: currentAssignment._id,
        studentEmail: email.toLowerCase(),
        courseId: currentAssignment.courseId,
        content: submissionText,
        fileIds: submissionFileIds,
        submissionDate: new Date().toISOString()
      };

      console.log('Debug - Submission Data:', submissionData);
      console.log('Debug - Current Assignment:', currentAssignment);

      // Submit the assignment
      await axios.post(getApiUrl('submissions'), submissionData);
      
      // Close modal and reset states
      setShowSubmitModal(false);
      setCurrentAssignment(null);
      setUploadedFiles([]);
      setSubmissionText('');
      setUploadProgress({});
      setFileIds([]);
      
      // Refresh assignments
      setTimeout(async () => {
        await fetchData();
        alert('Assignment submitted successfully!');
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting assignment:', err);
      console.error('Error details:', err.response?.data); // Log detailed error
      alert(err.response?.data?.error || 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container" key={renderKey}>
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Assignments (student)</h1>
          <p className="welcome-subtitle">View, submit, and manage your course assignments</p>
        </div>
        <div className="action-buttons">
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

      <div className="filters-section">
        <div className="filter-container">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Classes</option>
            {allCourses.map(course => (
              <option key={course._id} value={course.name}>
                {course.name}
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
      </div>

      {isLoading ? (
        <div className="loading">Loading assignments...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="assignment-cards">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map(assignment => (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  <span className={`status-badge ${assignment.status}`}>
                    {assignment.status}
                  </span>
                </div>
                <div className="assignment-details">
                  <p><strong>Course:</strong> {assignment.courseName}</p>
                  <p><strong>Instructor:</strong> {assignment.instructorName}</p>
                  <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString()}</p>
                  {assignment.submissionDate && (
                    <p><strong>Submitted:</strong> {new Date(assignment.submissionDate).toLocaleDateString()}</p>
                  )}
                  {assignment.grade && (
                    <p><strong>Grade:</strong> {assignment.grade}</p>
                  )}
                </div>
                <div className="assignment-actions">
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => handleOpenSubmitModal(assignment)}
                      className="submit-btn"
                  >
                    Submit Assignment
                  </button>
                )}
                  {assignment.status === 'submitted' && !assignment.grade && (
                    <span className="submitted-badge">Submitted</span>
                )}
                {assignment.status === 'graded' && (
                    <div className="grade-info">
                      <span className="grade-badge">Grade: {assignment.grade}</span>
                      {assignment.feedback && (
                        <button 
                          onClick={() => {
                            setCurrentAssignment(assignment);
                            setShowSubmitModal(true);
                          }}
                          className="view-feedback-btn"
                        >
                          View Feedback
                        </button>
                      )}
                  </div>
                )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-assignments">
              <p>No assignments found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label>Submission Text</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your submission text here..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Attach Files</label>
                <div {...getRootProps()} className={`file-upload-dropzone ${isDragActive ? 'active' : ''}`}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <p>Drag and drop files here, or click to select files</p>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files">
                    <ul>
                      {uploadedFiles.map(({ file }) => (
                        <li key={file.name}>
                          <div className="file-info">
                            <span>{file.name}</span>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="progress-bar">
                              <div
                                  className="progress-fill" 
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setUploadedFiles([]);
                    setUploadProgress({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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