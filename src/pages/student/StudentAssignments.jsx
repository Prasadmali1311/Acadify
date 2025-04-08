import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { getApiUrl } from '../../config/database';
import './StudentAssignments.css';

const StudentAssignments = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Get current user
  const { currentUser } = useAuth();
  
  // State for assignments and courses
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Force component to update
  const forceUpdate = useCallback(() => {
    setRenderKey(prevKey => prevKey + 1);
  }, []);

  // Function to fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const studentId = currentUser?.profile?.studentId || 'student1';

      // Fetch enrolled courses
      const coursesResponse = await fetch(`${getApiUrl()}/courses/student?studentId=${studentId}`);
      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }
      const coursesData = await coursesResponse.json();
      console.log('Fetched courses:', coursesData);

      // Fetch assignments
      const assignmentsResponse = await fetch(`${getApiUrl()}/assignments/student?studentId=${studentId}`);
      if (!assignmentsResponse.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const assignmentsData = await assignmentsResponse.json();
      console.log('Fetched assignments:', assignmentsData);

      // Format assignments with course names
      const formattedAssignments = assignmentsData.map(assignment => {
        const course = coursesData.find(c => c._id === assignment.courseId);
        return {
          ...assignment,
          courseName: course?.name || 'Unknown Course',
          instructorName: course?.instructorName || 'Unknown Instructor'
        };
      });

      setCourses(coursesData);
      setAssignments(formattedAssignments);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load assignments. Please try again later.');
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
  };

  // Handle submitting an assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!currentAssignment) return;

    try {
      setIsSubmitting(true);
      const studentId = currentUser.profile?.studentId || 'student1';
      
      // Upload files first if any
      const fileIds = [];
      if (uploadedFiles.length > 0) {
        for (const fileObj of uploadedFiles) {
          const formData = new FormData();
          formData.append('file', fileObj.file);
          
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
            fileIds.push(response.data.fileId);
          }
        }
      }

      // Create submission data
      const submissionData = {
        assignmentId: currentAssignment.id,
        studentId: studentId,
        courseId: currentAssignment.courseId,
        content: submissionText,
        fileIds: fileIds,
        submissionDate: new Date().toISOString()
      };

      // Submit the assignment
      await axios.post(getApiUrl('submissions'), submissionData);
      
      // Close modal and reset states
      setShowSubmitModal(false);
      setCurrentAssignment(null);
      setUploadedFiles([]);
      setSubmissionText('');
      setUploadProgress({});
      
      // Refresh assignments
      setTimeout(async () => {
        await fetchData();
        alert('Assignment submitted successfully!');
      }, 1500);
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
            {courses.map(course => (
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
              <div key={assignment.id} className="assignment-card">
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
                  {getDaysIndicator(assignment.deadline)}
                </div>
                <div className="assignment-description">
                  <p>{assignment.description}</p>
                </div>
                {assignment.status === 'pending' && (
                  <button
                    className="submit-button"
                    onClick={() => handleOpenSubmitModal(assignment)}
                  >
                    Submit Assignment
                  </button>
                )}
                {assignment.status === 'graded' && (
                  <div className="grade-section">
                    <p><strong>Grade:</strong> {assignment.grade}</p>
                    <p><strong>Feedback:</strong> {assignment.feedback}</p>
                  </div>
                )}
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
                            <span className="file-size">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="progress-bar">
                              <div
                                className="progress"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
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