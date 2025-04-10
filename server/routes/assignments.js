import express from 'express';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Error fetching assignments' });
  }
});

// Get assignments for a specific student
router.get('/student', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get courses the student is enrolled in
    const enrolledCourses = await Course.find({
      'students.email': email.toLowerCase()
    });

    if (!enrolledCourses || enrolledCourses.length === 0) {
      return res.status(200).json([]); // Return empty array if no enrolled courses
    }

    // Get course IDs
    const courseIds = enrolledCourses.map(course => course._id.toString());

    // Get assignments for these courses
    const assignments = await Assignment.find({
      courseId: { $in: courseIds }
    });

    if (!assignments || assignments.length === 0) {
      return res.status(200).json([]); // Return empty array if no assignments
    }

    // Get submissions for these assignments
    const submissions = await Submission.find({
      studentEmail: email.toLowerCase(),
      assignmentId: { $in: assignments.map(a => a._id.toString()) }
    });

    // Map submissions to assignments
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment._id.toString());
      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        instructorId: assignment.instructorId,
        instructorName: assignment.instructorName,
        deadline: assignment.deadline,
        status: submission ? (submission.grade ? 'graded' : 'submitted') : 'pending',
        submissionDate: submission?.submissionDate,
        grade: submission?.grade,
        feedback: submission?.feedback,
        gradedDate: submission?.gradedDate
      };
    });

    res.status(200).json(assignmentsWithSubmissions);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ error: 'Error fetching student assignments' });
  }
});

// Get assignments for a specific instructor
router.get('/instructor', async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor ID is required' });
    }

    const assignments = await Assignment.find({ instructorId });
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    res.status(500).json({ error: 'Error fetching instructor assignments' });
  }
});

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      courseName,
      instructorId,
      instructorName,
      deadline
    } = req.body;

    if (!title || !courseId || !instructorId || !deadline) {
      return res.status(400).json({
        error: 'Title, course ID, instructor ID, and deadline are required'
      });
    }

    const newAssignment = new Assignment({
      title,
      description,
      courseId,
      courseName,
      instructorId,
      instructorName,
      deadline: new Date(deadline)
    });

    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Error creating assignment' });
  }
});

export default router; 