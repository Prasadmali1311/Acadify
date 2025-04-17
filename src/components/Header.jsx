import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, userRole, logout } = useAuth();
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
      navigate('login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    
    // If user has first and last name
    if (currentUser.firstName && currentUser.lastName) {
      const firstInitial = currentUser.firstName.charAt(0).toUpperCase();
      const lastInitial = currentUser.lastName.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
    
    // Fallback to email initial
    if (currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    // If user has first and last name
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    // If we have a display name directly on the user object
    if (currentUser.displayName) {
      return currentUser.displayName;
    }
    
    // Fallback to email
    return currentUser.email || 'User';
  };

  // Check if user has a profile photo
  const hasProfilePhoto = () => {
    // Debug logs
    console.log('Current User:', currentUser);
    console.log('Photo URL:', currentUser?.photoURL);
    
    // Check if photo URL exists
    const hasPhoto = currentUser?.photoURL ? true : false;
    console.log('Has profile photo:', hasPhoto);
    return hasPhoto;
  };

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    // Get the photo URL
    const photoUrl = currentUser?.photoURL || '';
    console.log('Using photo URL:', photoUrl);
    return photoUrl;
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
            {hasProfilePhoto() ? (
              <img 
                src={getProfilePhotoUrl()} 
                alt="Profile" 
                className="avatar profile-photo"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar">
                {getUserInitials()}
              </div>
            )}
            <span className="username">{getUserDisplayName()}</span>
          </div>
          
          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                {hasProfilePhoto() ? (
                  <img 
                    src={getProfilePhotoUrl()} 
                    alt="Profile" 
                    className="profile-avatar profile-photo"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="profile-avatar">
                    {getUserInitials()}
                  </div>
                )}
                <div className="profile-info">
                  <div className="profile-name">{getUserDisplayName()}</div>
                  <div className="profile-email">{currentUser?.email}</div>
                  <div className="profile-role">{userRole || 'User'}</div>
                </div>
              </div>
              <div className="profile-menu-items">
                <button className="profile-menu-item" onClick={() => {
                  navigate('profile');
                  setIsProfileMenuOpen(false);
                }}>
                  <span>Profile</span>
                </button>
                <button className="profile-menu-item" onClick={() => {
                  navigate('settings');
                  setIsProfileMenuOpen(false);
                }}>
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
