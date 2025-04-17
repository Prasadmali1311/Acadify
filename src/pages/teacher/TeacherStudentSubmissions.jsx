import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assuming auth context provides token/user info
import { getApiUrl } from '../../config/database'; // Corrected path
import axios from 'axios';
import './TeacherStudentSubmissions.css'; // We'll create this later

// Function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const TeacherStudentSubmissions = () => {
  const { studentEmail } = useParams(); // Get student email from URL
  const { currentUser } = useAuth(); // Needed for auth token
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeError, setGradeError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!studentEmail || !currentUser) {
        setError('Required information missing (student email or user).');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token'); // Get auth token
        if (!token) {
          throw new Error('Authentication required.');
        }

        // Construct the correct API URL
        const apiUrl = `${getApiUrl('submissions')}/teacher/student/${encodeURIComponent(studentEmail)}`;
        
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}` // Send token for backend auth
          }
        });

        if (response.status !== 200) {
          throw new Error(response.data.error || 'Failed to fetch submissions');
        }

        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching student submissions:', err);
        setError(err.message || 'Failed to load submissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [studentEmail, currentUser]);

  // Function to handle viewing files of a submission
  const handleViewFiles = async (submission) => {
    try {
      setLoadingFiles(true);
      setSelectedSubmission(submission);
      setShowFileModal(true);
      
      if (!submission.fileIds || submission.fileIds.length === 0) {
        setSubmissionFiles([]);
        return;
      }
      
      // Fetch file details based on fileIds
      const token = localStorage.getItem('token');
      const promises = submission.fileIds.map(fileId => 
        axios.get(`${getApiUrl('files')}/id/${fileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(promises);
      const files = responses.map(response => response.data);
      setSubmissionFiles(files);
    } catch (err) {
      console.error('Error fetching submission files:', err);
      alert('Failed to load files for this submission.');
    } finally {
      setLoadingFiles(false);
    }
  };
  
  // Function to open a file in a new tab
  const openFile = (filename) => {
    const fileUrl = `${getApiUrl('file')}/${filename}`;
    window.open(fileUrl, '_blank');
  };
  
  // Close the file modal
  const closeFileModal = () => {
    setShowFileModal(false);
    setSelectedSubmission(null);
    setSubmissionFiles([]);
  };

  // Open grading modal
  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeValue('');
    setFeedback('');
    setGradeError(null);
    setShowGradeModal(true);
  };

  // Close grading modal
  const closeGradeModal = () => {
    setShowGradeModal(false);
    setSelectedSubmission(null);
    setGradeValue('');
    setFeedback('');
    setGradeError(null);
  };

  // Submit grade
  const submitGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeValue) {
      setGradeError('Please provide a grade.');
      return;
    }
    
    try {
      setIsGrading(true);
      setGradeError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${getApiUrl('submissions')}/${selectedSubmission._id}/grade`,
        {
          grade: gradeValue,
          feedback: feedback
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Update the submission in the local state
        const updatedSubmissions = submissions.map(sub => 
          sub._id === selectedSubmission._id 
            ? { ...sub, grade: gradeValue, feedback: feedback }
            : sub
        );
        
        setSubmissions(updatedSubmissions);
        closeGradeModal();
        
        // Show success message
        alert('Submission graded successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to grade submission');
      }
    } catch (err) {
      console.error('Error grading submission:', err);
      setGradeError(err.message || 'Failed to grade submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  // View grade details
  const handleViewGrade = (submission) => {
    setSelectedSubmission(submission);
    setGradeValue(submission.grade || '');
    setFeedback(submission.feedback || '');
    setShowGradeModal(true);
  };

  return (
    <div className="student-submissions-container">
      <h1>Submissions for {decodeURIComponent(studentEmail)}</h1> 
      
      <Link to="/teacher/students" className="back-link">&larr; Back to Student List</Link>

      {isLoading && <p>Loading submissions...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && (
        submissions.length > 0 ? (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.assignmentTitle}</td>
                  <td>{sub.courseName}</td>
                  <td>{new Date(sub.submissionDate).toLocaleString()}</td>
                  <td>{sub.grade ? 'Graded' : 'Submitted'}</td>
                  <td>{sub.grade || '-'}</td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => sub.grade ? handleViewGrade(sub) : handleGradeSubmission(sub)}
                      className="grade-button"
                    >
                      {sub.grade ? 'View Grade' : 'Grade'}
                    </button>
                    
                    <button 
                      onClick={() => handleViewFiles(sub)}
                      className="view-files-button"
                    >
                      View Files
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No submissions found for this student in your courses.</p>
        )
      )}
      
      {/* File Viewing Modal */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal-content file-modal">
            <div className="modal-header">
              <h2>Submission Files</h2>
              <button className="close-button" onClick={closeFileModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="submission-details">
                <p><strong>Assignment:</strong> {selectedSubmission?.assignmentTitle}</p>
                <p><strong>Course:</strong> {selectedSubmission?.courseName}</p>
                <p><strong>Submitted:</strong> {new Date(selectedSubmission?.submissionDate).toLocaleString()}</p>
                <p><strong>Content:</strong> {selectedSubmission?.content || 'No content provided'}</p>
              </div>
              
              <h3>Attached Files</h3>
              
              {loadingFiles ? (
                <p>Loading files...</p>
              ) : submissionFiles.length > 0 ? (
                <div className="file-list">
                  {submissionFiles.map(file => (
                    <div key={file._id} className="file-item">
                      <div className="file-details">
                        <span className="file-name">{file.metadata?.originalName || file.filename}</span>
                        <small>Size: {formatFileSize(file.size)}</small>
                      </div>
                      <button 
                        onClick={() => openFile(file.filename)}
                        className="view-button"
                      >
                        View File
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No files attached to this submission.</p>
              )}
            </div>
            
            <div className="modal-footer">
              <button onClick={closeFileModal} className="close-modal-button">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {showGradeModal && (
        <div className="modal-overlay">
          <div className="modal-content grade-modal">
            <div className="modal-header">
              <h2>{selectedSubmission?.grade ? 'View Grade' : 'Grade Submission'}</h2>
              <button className="close-button" onClick={closeGradeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="submission-details">
                <p><strong>Assignment:</strong> {selectedSubmission?.assignmentTitle}</p>
                <p><strong>Course:</strong> {selectedSubmission?.courseName}</p>
                <p><strong>Submitted:</strong> {new Date(selectedSubmission?.submissionDate).toLocaleString()}</p>
              </div>
              
              <form onSubmit={submitGrade} className="grade-form">
                <div className="form-group">
                  <label htmlFor="grade">Grade:</label>
                  <input
                    type="text"
                    id="grade"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    disabled={!!selectedSubmission?.grade}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="feedback">Feedback (optional):</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows="4"
                    disabled={!!selectedSubmission?.grade}
                  ></textarea>
                </div>
                
                {gradeError && <p className="error-message">{gradeError}</p>}
                
                {!selectedSubmission?.grade && (
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-grade-button"
                      disabled={isGrading}
                    >
                      {isGrading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                    <button
                      type="button"
                      onClick={closeGradeModal}
                      className="cancel-button"
                      disabled={isGrading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
            
            {selectedSubmission?.grade && (
              <div className="modal-footer">
                <button onClick={closeGradeModal} className="close-modal-button">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentSubmissions; 