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
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      set: v => v.toLowerCase()
    },
    name: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove the unique index as it's causing issues with case sensitivity
// courseSchema.index({ 'students.email': 1 }, { unique: true, sparse: true });

const Course = mongoose.model('Course', courseSchema);

export default Course; 