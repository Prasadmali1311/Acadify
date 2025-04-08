import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import Grid from 'gridfs-stream';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GridFsStorage } from 'multer-gridfs-storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017/acadify';

// MongoDB connection options
const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

// Connect to MongoDB
mongoose.connect(mongoURI, options)
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// Initialize GridFS
let gfs;
const conn = mongoose.connection;

conn.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

conn.once('open', () => {
    console.log('MongoDB connection established');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    options: options,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: {
                        originalName: file.originalname,
                        mimetype: file.mimetype
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

export { mongoose, gfs, storage }; 