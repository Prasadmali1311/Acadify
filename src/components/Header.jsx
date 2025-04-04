import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, userRole, userProfile, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    
    if (userProfile && userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    if (userProfile && userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    
    if (currentUser.email) {
      return currentUser.email;
    }
    
    return 'User';
  };

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
        <div className="user-profile-container" ref={profileMenuRef}>
          <div 
            className="user-profile" 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="avatar">
              {getUserInitials()}
            </div>
            <span className="username">{getUserDisplayName()}</span>
          </div>
          
          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar">
                  {getUserInitials()}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{getUserDisplayName()}</div>
                  <div className="profile-role">{userRole || 'User'}</div>
                </div>
              </div>
              <div className="profile-menu-items">
                <button className="profile-menu-item">
                  <span>Profile</span>
                </button>
                <button className="profile-menu-item">
                  <span>Settings</span>
                </button>
                <button className="profile-menu-item logout-button" onClick={handleLogout}>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
