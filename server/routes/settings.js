import express from 'express';
import Settings from '../models/Settings.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get user settings
router.get('/', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find or create settings for user
    let settings = await Settings.findOne({ userId: decoded.id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({ userId: decoded.id });
      await settings.save();
    }

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Error getting settings',
      details: error.message 
    });
  }
});

// Update user settings
router.put('/', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find settings
    let settings = await Settings.findOne({ userId: decoded.id });
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings({ userId: decoded.id });
    }

    // Update settings with new values
    const updateFields = [
      'emailNotifications',
      'smsNotifications',
      'darkMode',
      'soundEffects',
      'autoSave',
      'language',
      'timezone',
      'privacy'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    settings.updatedAt = new Date();
    await settings.save();

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Error updating settings',
      details: error.message 
    });
  }
});

// Reset user settings to default
router.post('/reset', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Delete existing settings
    await Settings.findOneAndDelete({ userId: decoded.id });
    
    // Create new settings with defaults
    const settings = new Settings({ userId: decoded.id });
    await settings.save();

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Reset settings error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Error resetting settings',
      details: error.message 
    });
  }
});

export default router; 