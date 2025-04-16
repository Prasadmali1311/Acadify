import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assuming auth context provides token/user info
import { getApiUrl } from '../../config/database'; // Corrected path
import axios from 'axios';
import './TeacherStudentSubmissions.css'; // We'll create this later

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

  // Implement grading functionality if needed
  const handleGradeSubmission = (submissionId) => {
    console.log('Grading submission:', submissionId);
    // Add logic to open grading modal or navigate to grading page
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
                      onClick={() => handleGradeSubmission(sub._id)}
                      className="grade-button"
                      disabled={!!sub.grade} // Disable if already graded
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
                      <span className="file-name">{file.metadata?.originalName || file.filename}</span>
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
    </div>
  );
};

export default TeacherStudentSubmissions; 