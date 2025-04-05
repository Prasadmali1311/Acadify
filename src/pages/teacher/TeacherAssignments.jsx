import { useState } from 'react';
import './TeacherAssignments.css';

const TeacherAssignments = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentClass, setNewAssignmentClass] = useState('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  
  // Sample assignments data
  const [assignments, setAssignments] = useState([
    { 
      id: 1, 
      title: 'Final Exam Questions', 
      class: 'Mathematics 101', 
      publishedDate: '2025-03-25', 
      deadline: '2025-04-15', 
      status: 'active',
      submissions: 22,
      totalStudents: 32
    },
    { 
      id: 2, 
      title: 'Physics Lab Report', 
      class: 'Physics for Beginners', 
      publishedDate: '2025-03-20', 
      deadline: '2025-04-05', 
      status: 'active',
      submissions: 15,
      totalStudents: 28
    },
    { 
      id: 3, 
      title: 'Chemical Compounds Quiz', 
      class: 'Chemistry Advanced', 
      publishedDate: '2025-03-10', 
      deadline: '2025-03-30', 
      status: 'active',
      submissions: 12,
      totalStudents: 15
    },
    { 
      id: 4, 
      title: 'Midterm Exam', 
      class: 'Mathematics 101', 
      publishedDate: '2025-02-15', 
      deadline: '2025-03-01', 
      status: 'graded',
      submissions: 31,
      totalStudents: 32
    },
    { 
      id: 5, 
      title: 'Programming Exercise', 
      class: 'Computer Science Basics', 
      publishedDate: '2025-03-01', 
      deadline: '2025-03-15', 
      status: 'graded',
      submissions: 20,
      totalStudents: 24
    },
    { 
      id: 6, 
      title: 'Draft Research Paper', 
      class: 'Physics for Beginners', 
      publishedDate: '2025-02-20', 
      deadline: '2025-03-10', 
      status: 'draft',
      submissions: 0,
      totalStudents: 28
    }
  ]);
  
  // Sample class data for filtering
  const classes = [
    { id: 1, name: 'Mathematics 101' },
    { id: 2, name: 'Physics for Beginners' },
    { id: 3, name: 'Chemistry Advanced' },
    { id: 4, name: 'Computer Science Basics' },
  ];

  // Handler for creating a new assignment
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentClass || !newAssignmentDeadline) return;
    
    const newAssignment = {
      id: assignments.length + 1,
      title: newAssignmentTitle,
      class: newAssignmentClass,
      publishedDate: new Date().toISOString().split('T')[0],
      deadline: newAssignmentDeadline,
      description: newAssignmentDescription,
      status: 'draft',
      submissions: 0,
      totalStudents: classes.find(c => c.name === newAssignmentClass)?.id * 8 || 20 // Mock data
    };
    
    setAssignments([...assignments, newAssignment]);
    setNewAssignmentTitle('');
    setNewAssignmentClass('');
    setNewAssignmentDeadline('');
    setNewAssignmentDescription('');
    setShowModal(false);
  };

  // Handler for publishing a draft assignment
  const handlePublishAssignment = (id) => {
    setAssignments(
      assignments.map(assignment => 
        assignment.id === id 
          ? { ...assignment, status: 'active' } 
          : assignment
      )
    );
  };

  // Filter assignments based on selected class and status
  const filteredAssignments = assignments.filter(assignment => {
    const matchesClass = selectedClass === 'all' || assignment.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    return matchesClass && matchesStatus;
  });

  return (
    <div className="dashboard-container">
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
            <div className="assignment-count">{filteredAssignments.length} assignments</div>
          </div>
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
              <div className="no-results">No assignments match your criteria</div>
            )}
          </div>
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
                <select
                  id="assignmentClass"
                  value={newAssignmentClass}
                  onChange={(e) => setNewAssignmentClass(e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(classItem => (
                    <option key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
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
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Assignment
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