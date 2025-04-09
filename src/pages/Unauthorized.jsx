import { Link } from 'react-router-dom';
import '../styles/Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <Link to="/dashboard" className="back-button">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 