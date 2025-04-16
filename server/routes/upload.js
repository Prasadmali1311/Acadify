import express from 'express';
import multer from 'multer';
import { bucket } from '../db.js';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';
import mongoose from 'mongoose';

const router = express.Router();

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        // Allow all file types
        cb(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Get all files
router.get('/files', async (req, res) => {
    try {
        const files = await bucket.find({}).toArray();
        const fileList = files.map(file => ({
            _id: file._id,
            filename: file.filename,
            length: file.length,
            uploadDate: file.uploadDate,
            metadata: file.metadata,
            userEmail: file.metadata?.userEmail || 'unknown' // Include user email who uploaded the file
        }));
        res.status(200).json(fileList);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Error listing files' });
    }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Get user email from request body
        const userEmail = req.body.userEmail || 'anonymous';
        
        // Create a unique filename
        const filename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
        
        // Create upload stream with user email in metadata
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: req.file.mimetype,
            metadata: {
                originalName: req.file.originalname,
                userEmail: userEmail, // Store the user email in metadata
                uploadedAt: new Date()
            }
        });
        
        // Convert buffer to stream
        const readableFileStream = new Readable();
        readableFileStream.push(req.file.buffer);
        readableFileStream.push(null);
        
        // Pipe the file data to GridFS
        readableFileStream.pipe(uploadStream);
        
        // Return success response when upload is complete
        uploadStream.on('finish', () => {
            const fileInfo = {
                filename: filename,
                originalName: req.file.originalname,
                contentType: req.file.mimetype,
                size: req.file.size,
                id: uploadStream.id,
                uploadDate: new Date(),
                userEmail: userEmail,
                fileId: uploadStream.id.toString() // Add fileId to response
            };
            
            return res.status(200).json({
                message: 'File uploaded successfully',
                file: fileInfo,
                fileId: uploadStream.id.toString()
            });
        });
        
        // Handle upload error
        uploadStream.on('error', (error) => {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Error uploading file' });
        });
    } catch (error) {
        console.error('Error handling upload:', error);
        return res.status(500).json({ error: 'Server error processing upload' });
    }
});

// Get file
router.get('/file/:filename', async (req, res) => {
    try {
        const files = await bucket.find({ filename: req.params.filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No file exists' });
        }
        
        const file = files[0];
        
        // Set the content type
        res.set('Content-Type', file.contentType);
        
        // Create download stream
        const downloadStream = bucket.openDownloadStreamByName(file.filename);
        
        // Pipe the download stream to the response
        downloadStream.pipe(res);
        
        // Handle download error
        downloadStream.on('error', (error) => {
            console.error('Download error:', error);
            return res.status(500).json({ error: 'Error downloading file' });
        });
    } catch (error) {
        console.error('Error retrieving file:', error);
        return res.status(500).json({ error: 'Server error retrieving file' });
    }
});

// Delete file
router.delete('/file/:filename', async (req, res) => {
    try {
        const files = await bucket.find({ filename: req.params.filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No file exists' });
        }
        
        // Delete the file
        await bucket.delete(files[0]._id);
        
        return res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ error: 'Server error deleting file' });
    }
});

// Get files by user email
router.get('/files/user/:email', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();
        
        // Find files with matching user email in metadata
        const files = await bucket.find({
            'metadata.userEmail': userEmail
        }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(200).json([]); // Return empty array if no files found
        }
        
        const fileList = files.map(file => ({
            _id: file._id,
            filename: file.filename,
            originalName: file.metadata?.originalName,
            length: file.length,
            uploadDate: file.uploadDate,
            metadata: file.metadata,
            userEmail: file.metadata?.userEmail
        }));
        
        res.status(200).json(fileList);
    } catch (error) {
        console.error('Error listing user files:', error);
        res.status(500).json({ error: 'Error listing user files' });
    }
});

// Get file by ID
router.get('/files/id/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;
        
        // Convert string to ObjectId
        const ObjectId = mongoose.Types.ObjectId;
        const fileObjectId = new ObjectId(fileId);
        
        // Find file by ID
        const file = await bucket.find({ _id: fileObjectId }).toArray();
        
        if (!file || file.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const fileData = file[0];
        const fileInfo = {
            _id: fileData._id,
            filename: fileData.filename,
            originalName: fileData.metadata?.originalName,
            contentType: fileData.contentType,
            length: fileData.length,
            uploadDate: fileData.uploadDate,
            metadata: fileData.metadata
        };
        
        res.status(200).json(fileInfo);
    } catch (error) {
        console.error('Error getting file by ID:', error);
        res.status(500).json({ error: 'Error retrieving file details' });
    }
});

export default router; 