import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  instructorId: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    trim: true
  },
  students: [{
    studentId: String,
    name: String,
    email: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

export default Course; 