import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { bucket } from '../db.js';
import { Readable } from 'stream';
import path from 'path';
import crypto from 'crypto';
import { Busboy } from '@fastify/busboy';
import { Buffer } from 'buffer';
import process from 'process';

const router = express.Router();

// Helper function to handle file upload
const handleFileUpload = (req) => {
    return new Promise((resolve, reject) => {
        const busboy = new Busboy({ 
            headers: req.headers,
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
                files: 1 // Only allow 1 file
            }
        });

        let fileBuffer;
        let mimeType;
        let originalName;

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if (!mimetype.startsWith('image/')) {
                file.resume(); // Skip this file
                return reject(new Error('Only image files are allowed!'));
            }

            const chunks = [];
            mimeType = mimetype;
            originalName = filename;

            file.on('data', (chunk) => chunks.push(chunk));
            file.on('end', () => {
                fileBuffer = Buffer.concat(chunks);
            });
        });

        busboy.on('finish', () => {
            if (!fileBuffer) {
                return reject(new Error('No file uploaded'));
            }
            resolve({ fileBuffer, mimeType, originalName });
        });

        req.pipe(busboy);
    });
};

// Login user
router.post('/login', async (req, res) => {
  console.log('Login route hit');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data (excluding password) and token
    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      role: user.role
    };

    console.log('Login successful for user:', email);
    res.status(200).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error logging in',
      details: error.message 
    });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, mobileNumber, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNumber,
      role: role || 'student'
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data (excluding password) and token
    const userData = {
      id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      mobileNumber: savedUser.mobileNumber,
      role: savedUser.role
    };

    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Error registering user',
      details: error.message 
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Handle file upload if present
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            try {
                const { fileBuffer, mimeType, originalName } = await handleFileUpload(req);

                // Delete old photo if it exists
                if (user.photoURL) {
                    try {
                        const oldFilename = path.basename(user.photoURL);
                        const files = await bucket.find({ filename: oldFilename }).toArray();
                        if (files && files.length > 0) {
                            await bucket.delete(files[0]._id);
                        }
                    } catch (error) {
                        console.error('Error deleting old photo:', error);
                        // Continue with upload even if delete fails
                    }
                }

                // Create a unique filename
                const filename = crypto.randomBytes(16).toString('hex') + path.extname(originalName);
                
                // Create upload stream
                const uploadStream = bucket.openUploadStream(filename, {
                    contentType: mimeType,
                    metadata: {
                        originalName: originalName,
                        userId: user._id.toString(),
                        uploadedAt: new Date()
                    }
                });
                
                // Convert buffer to stream
                const readableFileStream = new Readable();
                readableFileStream.push(fileBuffer);
                readableFileStream.push(null);
                
                // Pipe the file data to GridFS
                readableFileStream.pipe(uploadStream);
                
                // Wait for upload to complete
                await new Promise((resolve, reject) => {
                    uploadStream.on('finish', resolve);
                    uploadStream.on('error', reject);
                });

                // Update user's photoURL with filename
                user.photoURL = `http://localhost:5000/api/upload/file/${filename}`;
            } catch (error) {
                console.error('Error uploading profile photo:', error);
                return res.status(400).json({ error: error.message });
            }
        }

        // Update other fields
        const updates = req.body;
        Object.keys(updates).forEach(key => {
            if (key !== 'password' && key !== '_id') {
                user[key] = updates[key];
            }
        });

        // Save updated user
        await user.save();

        // Return updated user data (excluding password)
        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNumber: user.mobileNumber,
            role: user.role,
            photoURL: user.photoURL
        };

        res.status(200).json({ user: userData });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(500).json({ 
            error: 'Error updating profile',
            details: error.message 
        });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        role: user.role,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ 
      error: 'Error getting profile',
      details: error.message 
    });
  }
});

export default router;