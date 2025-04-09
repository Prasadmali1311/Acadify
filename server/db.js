import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import process from 'process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acadify';

// GridFS bucket reference
let bucket;

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('MongoDB Connected successfully');

        // Initialize GridFS bucket
        const conn = mongoose.connection;
        bucket = new GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
        console.log('GridFS bucket initialized');

        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB. Please make sure MongoDB is running.');
            console.error('You can start MongoDB by running: mongod');
        }
        return false;
    }
};

export { mongoose, bucket, connectDB }; 