import { useState } from 'react';
import './StudentAssignments.css';

const StudentAssignments = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileAttached, setFileAttached] = useState(false);
  
  // Sample assignments data
  const assignments = [
    { 
      id: 1, 
      title: 'Responsive Portfolio Website', 
      class: 'HTML & CSS Fundamentals', 
      instructor: 'Dr. Emma Richards',
      deadline: '2025-04-15', 
      status: 'pending',
      description: 'Create a responsive portfolio website using HTML5 and CSS3. Implement mobile-first design principles.',
      graded: false
    },
    { 
      id: 2, 
      title: 'Interactive Quiz App', 
      class: 'JavaScript Essentials', 
      instructor: 'Prof. David Chen',
      deadline: '2025-04-05', 
      status: 'pending',
      description: 'Build an interactive quiz application with JavaScript. Include timer, scoring, and result feedback.',
      graded: false
    },
    { 
      id: 3, 
      title: 'CSS Grid Layout Challenge', 
      class: 'HTML & CSS Fundamentals', 
      instructor: 'Dr. Emma Richards',
      deadline: '2025-03-01', 
      status: 'submitted',
      submittedDate: '2025-02-28',
      description: 'Design a complex webpage layout using CSS Grid. Include responsive breakpoints.',
      graded: false
    },
    { 
      id: 4, 
      title: 'API Integration Project', 
      class: 'Backend Development with Node.js', 
      instructor: 'Dr. Michael Thompson',
      deadline: '2025-03-15', 
      status: 'submitted',
      submittedDate: '2025-03-14',
      description: 'Develop a RESTful API with Node.js and Express. Implement CRUD operations and authentication.',
      graded: false
    },
    { 
      id: 5, 
      title: 'Component Architecture Design', 
      class: 'React Framework', 
      instructor: 'Dr. Sarah Johnson',
      deadline: '2025-02-20', 
      status: 'graded',
      submittedDate: '2025-02-19',
      gradedDate: '2025-02-25',
      grade: 'A',
      feedback: 'Excellent component structure and state management. Well-organized code with proper React patterns.',
      description: 'Create a React application with reusable components. Implement proper state management and props.',
      graded: true
    },
    { 
      id: 6, 
      title: 'State Management Project', 
      class: 'JavaScript Essentials', 
      instructor: 'Prof. David Chen',
      deadline: '2025-02-10', 
      status: 'graded',
      submittedDate: '2025-02-09',
      gradedDate: '2025-02-15',
      grade: 'B+',
      feedback: 'Good implementation of state management patterns. Some room for improvement in code organization.',
      description: 'Implement different state management patterns in JavaScript. Compare and contrast approaches.',
      graded: true
    }
  ];
  
  // Sample class data for filtering
  const classes = [
    { id: 1, name: 'HTML & CSS Fundamentals' },
    { id: 2, name: 'JavaScript Essentials' },
    { id: 3, name: 'React Framework' },
    { id: 4, name: 'Backend Development with Node.js' }
  ];

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
  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log("Submitting assignment:", {
      assignmentId: currentAssignment.id,
      text: submissionText,
      fileAttached,
      submittedDate: new Date().toISOString()
    });
    
    // Reset form and close modal
    setSubmissionText('');
    setFileAttached(false);
    setShowSubmitModal(false);
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Assignments</h1>
          <p className="welcome-subtitle">View, submit, and manage your course assignments</p>
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
      </div>

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
                      <span>{assignment.deadline}</span>
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
                      <span>{assignment.submittedDate}</span>
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
            No assignments match your criteria
          </div>
        )}
      </div>

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
                <button type="button" className="cancel-button" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Submit Assignment
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