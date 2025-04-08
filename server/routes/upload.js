import express from 'express';
import multer from 'multer';
import { bucket } from '../db.js';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';

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
            metadata: file.metadata
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
        // Create a unique filename
        const filename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
        
        // Create upload stream
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: req.file.mimetype,
            metadata: {
                originalName: req.file.originalname
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
                uploadDate: new Date()
            };
            
            return res.status(200).json({
                message: 'File uploaded successfully',
                file: fileInfo
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

export default router; 