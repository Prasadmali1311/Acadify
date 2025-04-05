import { useState } from 'react';
import './Classes.css';

const Classes = () => {
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  
  // Sample class data (would come from your database in a real app)
  const [classes, setClasses] = useState([
    { id: 1, name: 'Mathematics 101', students: 32, description: 'Introduction to calculus and algebra', nextClass: 'Monday, 10:00 AM' },
    { id: 2, name: 'Physics for Beginners', students: 28, description: 'Fundamental concepts of physics', nextClass: 'Wednesday, 2:00 PM' },
    { id: 3, name: 'Chemistry Advanced', students: 15, description: 'Advanced organic chemistry concepts', nextClass: 'Thursday, 11:30 AM' },
    { id: 4, name: 'Computer Science Basics', students: 24, description: 'Programming fundamentals and algorithms', nextClass: 'Tuesday, 9:00 AM' },
  ]);

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!newClassName) return;
    
    const newClass = {
      id: classes.length + 1,
      name: newClassName,
      description: newClassDescription,
      students: 0,
      nextClass: 'Not scheduled yet'
    };
    
    setClasses([...classes, newClass]);
    setNewClassName('');
    setNewClassDescription('');
    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-heading">Your Classes</h1>
          <p className="welcome-subtitle">Manage and monitor your classes</p>
        </div>
        <button className="report-button" onClick={() => setShowModal(true)}>
          <span className="text-xl">➕</span>
          <span>Create Class</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="content-card full-width">
          <div className="card-header">
            <h2 className="card-title">All Classes</h2>
          </div>
          <div className="class-list">
            <div className="class-list-header">
              <div className="class-name">Class Name</div>
              <div className="class-students">Students</div>
              <div className="class-description">Description</div>
              <div className="class-next">Next Session</div>
            </div>
            {classes.map((classItem) => (
              <div key={classItem.id} className="class-item">
                <div className="class-name">{classItem.name}</div>
                <div className="class-students">{classItem.students} students</div>
                <div className="class-description">{classItem.description}</div>
                <div className="class-next">{classItem.nextClass}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for creating a new class */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Class</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="classDescription">Description</label>
                <textarea
                  id="classDescription"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes; 