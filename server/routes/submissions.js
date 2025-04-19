import express from 'express';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
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

// Get submissions for a specific student from a specific teacher's perspective
router.get('/teacher/student/:studentEmail', async (req, res) => {
  console.log(`[SUBMISSIONS] GET /teacher/student/${req.params.studentEmail} - Request received`);
  try {
    // 1. Authentication & Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let teacherId;
    try {
      // eslint-disable-next-line no-undef
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      teacherId = decoded.id;
      console.log(`[SUBMISSIONS] Authenticated Teacher ID: ${teacherId}`);
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ error: 'Authentication failed: Invalid token' });
    }
    
    if (!teacherId) {
      // This case should ideally be caught by jwt.verify, but as a safeguard
      return res.status(401).json({ error: 'Authentication failed: Teacher ID not found in token' });
    }

    // 2. Get studentEmail from URL parameters
    const { studentEmail } = req.params;
    if (!studentEmail) {
      return res.status(400).json({ error: 'Student Email is required in URL path' });
    }
    const lowerCaseStudentEmail = studentEmail.toLowerCase();
    console.log(`[SUBMISSIONS] Searching for student: ${lowerCaseStudentEmail}`);

    // 3. Find assignments created by this teacher
    console.log(`[SUBMISSIONS] Finding assignments for instructorId: ${teacherId}`);
    const teacherAssignments = await Assignment.find({ instructorId: teacherId });
    const assignmentIds = teacherAssignments.map(assignment => assignment._id.toString());
    console.log(`[SUBMISSIONS] Found ${assignmentIds.length} assignment IDs for teacher:`, assignmentIds);

    if (assignmentIds.length === 0) {
      console.log(`[SUBMISSIONS] No assignments found for teacher. Returning empty array.`);
      return res.status(200).json([]); // No assignments means no relevant submissions
    }

    // 4. Find submissions by the student for only those assignments
    console.log(`[SUBMISSIONS] Finding submissions for studentEmail: ${lowerCaseStudentEmail} and assignmentIds:`, assignmentIds);
    const studentSubmissions = await Submission.find({
      studentEmail: lowerCaseStudentEmail,
      assignmentId: { $in: assignmentIds }
    }).populate('assignmentId', 'title courseName totalMarks'); // Added totalMarks to populated fields
    console.log(`[SUBMISSIONS] Found ${studentSubmissions.length} submissions matching criteria.`);

    // 5. Format the response
    const formattedSubmissions = studentSubmissions.map(sub => ({
        _id: sub._id,
        studentEmail: sub.studentEmail,
        content: sub.content,
        fileIds: sub.fileIds,
        submissionDate: sub.submissionDate,
        marks: sub.marks,
        totalMarks: sub.assignmentId?.totalMarks || 100, // Include totalMarks from assignment
        grade: sub.grade,
        feedback: sub.feedback,
        gradedDate: sub.gradedDate,
        assignmentTitle: sub.assignmentId?.title || 'N/A',
        courseName: sub.assignmentId?.courseName || 'N/A',
        assignmentId: sub.assignmentId?._id
    }));

    res.status(200).json(formattedSubmissions);

  } catch (error) {
    console.error('Error fetching teacher-view student submissions:', error);
    // Avoid sending detailed internal errors to client in production
    res.status(500).json({ error: 'Server error fetching student submissions' }); 
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
    const { marks, grade, feedback } = req.body;
    
    if (marks === undefined || marks === null) {
      return res.status(400).json({ error: 'Marks are required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Fetch the assignment to get total marks
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Associated assignment not found' });
    }

    // Validate marks against total marks
    if (marks < 0 || marks > assignment.totalMarks) {
      return res.status(400).json({ 
        error: `Marks must be between 0 and ${assignment.totalMarks}` 
      });
    }

    // Update submission with marks and grade
    submission.marks = marks;
    submission.grade = grade || '';
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