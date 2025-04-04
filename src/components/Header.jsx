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
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    
    // If we have profile data with first and last name
    if (currentUser.profile && currentUser.profile.firstName && currentUser.profile.lastName) {
      const firstInitial = currentUser.profile.firstName.charAt(0).toUpperCase();
      const lastInitial = currentUser.profile.lastName.charAt(0).toUpperCase();
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
    
    // If we have profile data with first and last name
    if (currentUser.profile && currentUser.profile.firstName && currentUser.profile.lastName) {
      return `${currentUser.profile.firstName} ${currentUser.profile.lastName}`;
    }
    
    // If we have a display name from Google
    if (currentUser.profile && currentUser.profile.displayName) {
      return currentUser.profile.displayName;
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
    console.log('Photo URL (direct):', currentUser?.photoURL);
    console.log('Photo URL (profile):', currentUser?.profile?.photoURL);
    
    // Check both possible locations for the photo URL
    const hasPhoto = currentUser?.photoURL || currentUser?.profile?.photoURL ? true : false;
    console.log('Has profile photo:', hasPhoto);
    return hasPhoto;
  };

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    // Try to get the photo URL from both possible locations
    const photoUrl = currentUser?.photoURL || currentUser?.profile?.photoURL || '';
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
