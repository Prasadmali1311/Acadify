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

  // TODO: Implement grading functionality if needed
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
                  <td>
                    {/* Add View/Grade button here */} 
                    <button 
                      onClick={() => handleGradeSubmission(sub._id)}
                      className="grade-button"
                      disabled={!!sub.grade} // Disable if already graded
                    >
                      {sub.grade ? 'View Grade' : 'Grade'}
                    </button>
                    {/* Link to view submission details could go here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No submissions found for this student in your courses.</p>
        )
      )}
    </div>
  );
};

export default TeacherStudentSubmissions; 