import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config/database';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(getApiUrl('profile'), {
          params: { userId: currentUser.uid }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(getApiUrl('profile'), {
        userId: currentUser.uid,
        ...profile
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <button 
          className="edit-button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Name</label>
              <p>{`${profile.firstName} ${profile.lastName}`}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            <div className="info-group">
              <label>Role</label>
              <p>{profile.role}</p>
            </div>
            <div className="info-group">
              <label>Bio</label>
              <p>{profile.bio || 'No bio provided'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 