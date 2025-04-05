import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Profile.css';

const Profile = () => {
  const { currentUser, getUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    role: '',
    displayName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Initialize form data from currentUser
      setFormData({
        firstName: currentUser.firstName || currentUser.profile?.firstName || '',
        lastName: currentUser.lastName || currentUser.profile?.lastName || '',
        mobileNumber: currentUser.mobileNumber || currentUser.profile?.mobileNumber || '',
        role: currentUser.role || currentUser.profile?.role || 'student',
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage({ text: '', type: '' });
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || currentUser.profile?.firstName || '',
        lastName: currentUser.lastName || currentUser.profile?.lastName || '',
        mobileNumber: currentUser.mobileNumber || currentUser.profile?.mobileNumber || '',
        role: currentUser.role || currentUser.profile?.role || 'student',
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      });
    }
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Update user profile in Firestore
      if (currentUser && currentUser.uid) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobileNumber: formData.mobileNumber
        });

        // Get updated profile
        await getUserProfile(currentUser.uid);
        
        setMessage({ 
          text: 'Profile updated successfully!', 
          type: 'success' 
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: `Error updating profile: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0).toUpperCase()}${formData.lastName.charAt(0).toUpperCase()}`;
    } else if (formData.email) {
      return formData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Check if user has a profile photo
  const hasProfilePhoto = () => {
    return currentUser?.photoURL || currentUser?.profile?.photoURL ? true : false;
  };

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    return currentUser?.photoURL || currentUser?.profile?.photoURL || '';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-description">
          View and manage your personal information
        </p>
      </div>

      <div className="profile-content">
        <div className="profile-section user-info-section">
          <div className="profile-image-container">
            {hasProfilePhoto() ? (
              <img 
                src={getProfilePhotoUrl()}
                alt="Profile" 
                className="profile-image"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="profile-image-placeholder">
                {getUserInitials()}
              </div>
            )}
            {!hasProfilePhoto() && !isEditing && (
              <button className="update-photo-button">
                Upload Photo
              </button>
            )}
          </div>

          <div className="user-details">
            <h2 className="user-name">{formData.firstName} {formData.lastName}</h2>
            <p className="user-role">{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
            <p className="user-email">{formData.email}</p>
            {!isEditing && (
              <button className="edit-profile-button" onClick={toggleEdit}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input 
                  type="tel" 
                  id="mobileNumber" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (cannot be changed)</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role (cannot be changed)</label>
                <input 
                  type="text" 
                  id="role" 
                  name="role"
                  value={formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="info-group">
                <div className="info-label">First Name</div>
                <div className="info-value">{formData.firstName || 'Not provided'}</div>
              </div>
              
              <div className="info-group">
                <div className="info-label">Last Name</div>
                <div className="info-value">{formData.lastName || 'Not provided'}</div>
              </div>
              
              <div className="info-group">
                <div className="info-label">Mobile Number</div>
                <div className="info-value">{formData.mobileNumber || 'Not provided'}</div>
              </div>
              
              <div className="info-group">
                <div className="info-label">Email</div>
                <div className="info-value">{formData.email}</div>
              </div>
              
              <div className="info-group">
                <div className="info-label">Role</div>
                <div className="info-value">{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 