import express from 'express';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Get all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// Get student submissions
router.get('/student', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const submissions = await Submission.find({ studentId });
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Error fetching student submissions' });
  }
});

// Get instructor submissions
router.get('/instructor', async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor ID is required' });
    }

    // Get assignments created by this instructor
    const assignments = await Assignment.find({ instructorId });
    const assignmentIds = assignments.map(assignment => assignment._id.toString());
    
    // Get submissions for those assignments
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds }
    });
    
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching instructor submissions:', error);
    res.status(500).json({ error: 'Error fetching instructor submissions' });
  }
});

// Create a new submission
router.post('/', async (req, res) => {
  try {
    const { 
      assignmentId, 
      studentEmail, 
      courseId, 
      content, 
      fileIds, 
      submissionDate 
    } = req.body;
    
    if (!assignmentId || !studentEmail || !courseId) {
      return res.status(400).json({ 
        error: 'Assignment ID, student email, and course ID are required' 
      });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if a submission already exists
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentEmail: studentEmail.toLowerCase()
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content;
      existingSubmission.fileIds = fileIds || [];
      existingSubmission.submissionDate = submissionDate || new Date();
      
      const updatedSubmission = await existingSubmission.save();
      return res.status(200).json(updatedSubmission);
    }

    // Create new submission
    const newSubmission = new Submission({
      assignmentId,
      studentEmail: studentEmail.toLowerCase(),
      courseId,
      content,
      fileIds: fileIds || [],
      submissionDate: submissionDate || new Date()
    });

    const savedSubmission = await newSubmission.save();
    res.status(201).json(savedSubmission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Error creating submission' });
  }
});

// Grade a submission
router.post('/:submissionId/grade', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    if (!grade) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedDate = new Date();
    
    const updatedSubmission = await submission.save();
    res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Error grading submission' });
  }
});

export default router; 