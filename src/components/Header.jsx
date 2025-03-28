import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="search-container">
        <input
          type="search"
          placeholder="Search..."
          className="search-input"
        />
      </div>
      <div className="header-actions">
        <button className="notification-button">
          🔔
        </button>
        <div className="user-profile">
          <div className="avatar">
            U
          </div>
          <span className="username">User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
