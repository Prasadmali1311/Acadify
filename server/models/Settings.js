import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  soundEffects: {
    type: Boolean,
    default: true
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['english', 'spanish', 'french', 'german', 'chinese'],
    default: 'english'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'friends'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 