import './Assignments.css';

const Assignments = () => {
  const assignments = [
    { id: 1, title: 'React Basics', due: '2024-02-20', status: 'pending' },
    { id: 2, title: 'JavaScript Arrays', due: '2024-02-22', status: 'completed' },
    { id: 3, title: 'CSS Layouts', due: '2024-02-25', status: 'pending' }
  ];

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1 className="page-title">Assignments</h1>
        <button className="new-assignment-btn">New Assignment</button>
      </div>
      
      <div className="assignments-grid">
        {assignments.map(assignment => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-info">
              <h3>{assignment.title}</h3>
              <p className="assignment-due">Due: {assignment.due}</p>
            </div>
            <span className={`status-badge ${assignment.status}`}>
              {assignment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
