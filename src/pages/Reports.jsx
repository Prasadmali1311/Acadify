import './Reports.css';

const Reports = () => {
  return (
    <div className="reports-container">
      <h1 className="page-title">Reports</h1>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3 className="card-title">Performance Overview</h3>
          <div className="chart-placeholder">
            Chart Placeholder
          </div>
        </div>
        
        <div className="report-card">
          <h3 className="card-title">Submission Analytics</h3>
          <div className="chart-placeholder">
            Chart Placeholder
          </div>
        </div>
        
        <div className="report-card full-width">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-list">
            {[1,2,3].map(i => (
              <div key={i} className="activity-item">
                Activity Item {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
