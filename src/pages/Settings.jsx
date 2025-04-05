import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const [activePanel, setActivePanel] = useState('account');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    soundEffects: true,
    autoSave: true,
    language: 'english',
    timezone: 'UTC',
    privacy: 'friends'
  });

  // Handle toggle change
  const handleToggleChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle select change
  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Save settings (would normally connect to backend)
  const saveSettings = () => {
    // In a real app, you would save to backend here
    alert('Settings saved successfully!');
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings({
      emailNotifications: true,
      smsNotifications: false,
      darkMode: false,
      soundEffects: true,
      autoSave: true,
      language: 'english',
      timezone: 'UTC',
      privacy: 'friends'
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-description">Manage your account settings and preferences</p>
      </div>

      <div className="settings-navigation">
        <button 
          className={`nav-item ${activePanel === 'account' ? 'active' : ''}`}
          onClick={() => setActivePanel('account')}
        >
          Account
        </button>
        <button 
          className={`nav-item ${activePanel === 'notifications' ? 'active' : ''}`}
          onClick={() => setActivePanel('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`nav-item ${activePanel === 'appearance' ? 'active' : ''}`}
          onClick={() => setActivePanel('appearance')}
        >
          Appearance
        </button>
        <button 
          className={`nav-item ${activePanel === 'privacy' ? 'active' : ''}`}
          onClick={() => setActivePanel('privacy')}
        >
          Privacy
        </button>
      </div>

      {activePanel === 'account' && (
        <div className="settings-panel">
          <div className="panel-header">
            <h2 className="panel-title">Account Settings</h2>
            <p className="panel-description">Update your account preferences and settings</p>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Address</div>
                <div className="setting-description">Your current email: {currentUser?.email}</div>
              </div>
              <button className="edit-button">Change</button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Password</div>
                <div className="setting-description">Last changed 3 months ago</div>
              </div>
              <button className="edit-button">Update</button>
            </div>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Timezone</div>
                <div className="setting-description">Choose your preferred timezone</div>
              </div>
              <select 
                className="select-field"
                value={settings.timezone}
                onChange={(e) => handleSelectChange('timezone', e.target.value)}
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="EST">EST (Eastern Standard Time)</option>
                <option value="CST">CST (Central Standard Time)</option>
                <option value="PST">PST (Pacific Standard Time)</option>
                <option value="IST">IST (Indian Standard Time)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Language</div>
                <div className="setting-description">Select your preferred language</div>
              </div>
              <select 
                className="select-field"
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'notifications' && (
        <div className="settings-panel">
          <div className="panel-header">
            <h2 className="panel-title">Notification Settings</h2>
            <p className="panel-description">Manage how you receive notifications</p>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Notifications</div>
                <div className="setting-description">Receive notifications via email</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggleChange('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">SMS Notifications</div>
                <div className="setting-description">Receive notifications via text message</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.smsNotifications}
                  onChange={() => handleToggleChange('smsNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Assignment Reminders</div>
                <div className="setting-description">Get reminders about upcoming assignments</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={true}
                  onChange={() => {}}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Class Announcements</div>
                <div className="setting-description">Get notified about new class announcements</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={true}
                  onChange={() => {}}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'appearance' && (
        <div className="settings-panel">
          <div className="panel-header">
            <h2 className="panel-title">Appearance Settings</h2>
            <p className="panel-description">Customize how Acadify looks for you</p>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Dark Mode</div>
                <div className="setting-description">Switch between light and dark themes</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.darkMode}
                  onChange={() => handleToggleChange('darkMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Sound Effects</div>
                <div className="setting-description">Play sound effects for notifications and actions</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.soundEffects}
                  onChange={() => handleToggleChange('soundEffects')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Auto-Save</div>
                <div className="setting-description">Automatically save your progress</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.autoSave}
                  onChange={() => handleToggleChange('autoSave')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'privacy' && (
        <div className="settings-panel">
          <div className="panel-header">
            <h2 className="panel-title">Privacy Settings</h2>
            <p className="panel-description">Control your data and privacy preferences</p>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Profile Visibility</div>
                <div className="setting-description">Control who can see your profile information</div>
              </div>
              <select 
                className="select-field"
                value={settings.privacy}
                onChange={(e) => handleSelectChange('privacy', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Activity Status</div>
                <div className="setting-description">Show when you're active on Acadify</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={true}
                  onChange={() => {}}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Data Usage</div>
                <div className="setting-description">Allow Acadify to collect anonymous usage data</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={true}
                  onChange={() => {}}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="reset-button" onClick={resetSettings}>Reset to Default</button>
        <button className="save-button" onClick={saveSettings}>Save Changes</button>
      </div>
    </div>
  );
};

export default Settings; 