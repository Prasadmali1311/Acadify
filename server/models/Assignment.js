import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName: {
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
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment; 