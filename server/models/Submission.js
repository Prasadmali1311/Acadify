import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  courseId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  fileIds: {
    type: [String],
    default: []
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedDate: {
    type: Date
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission; 