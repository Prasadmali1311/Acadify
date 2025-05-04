import express from 'express';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get enrolled courses for a student
router.get('/enrolled', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const courses = await Course.find({
      'students.email': email.toLowerCase()
    });
    
    // Get assignment counts for each course
    const coursesWithAssignmentCounts = await Promise.all(courses.map(async (course) => {
      // Get student's email in lowercase
      const studentEmail = email.toLowerCase();
      
      // Find pending assignments for this course (assignments without submissions)
      const assignments = await Assignment.find({ courseId: course._id.toString() });
      
      // For each assignment, check if the student has a submission
      const pendingAssignments = await Promise.all(assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          studentEmail: studentEmail
        });
        
        // If no submission found, this is a pending assignment
        return submission ? null : assignment;
      }));
      
      // Filter out null values and count the remaining pending assignments
      const pendingCount = pendingAssignments.filter(item => item !== null).length;
      
      // Create a new object with the course data and pending assignment count
      return {
        ...course._doc,
        assignmentCount: assignments.length,
        pendingCount: pendingCount
      };
    }));

    res.status(200).json(coursesWithAssignmentCounts);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ error: 'Error fetching enrolled courses' });
  }
});

// Get courses for an instructor
router.get('/instructor', async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor ID is required' });
    }

    const courses = await Course.find({ instructorId });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Error fetching instructor courses' });
  }
});

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { name, description, code, instructorId, instructorName } = req.body;
    if (!name || !instructorId) {
      return res.status(400).json({ error: 'Course name and instructor ID are required' });
    }

    const newCourse = new Course({
      name,
      description,
      code,
      instructorId,
      instructorName,
      students: []
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course' });
  }
});

// Enroll a student in a course
router.post('/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Convert email to lowercase for consistent matching
    const normalizedEmail = email.toLowerCase();

    // Check if student is already enrolled
    const alreadyEnrolled = course.students.some(student => 
      student.email === normalizedEmail
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }

    // Add student to course with pending status
    course.students.push({
      email: normalizedEmail,
      name,
      enrolledAt: new Date(),
      progress: 0,
      status: 'pending'
    });

    await course.save();
    
    res.status(200).json({ message: 'Enrollment request submitted. Awaiting instructor approval.' });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Error enrolling student' });
  }
});

// Approve or reject student enrollment
router.put('/:courseId/students/:studentEmail/status', async (req, res) => {
  try {
    const { courseId, studentEmail } = req.params;
    const { status, teacherId } = req.body;

    if (!status || !teacherId) {
      return res.status(400).json({ error: 'Status and teacher ID are required' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify the teacher is the course instructor
    if (course.instructorId !== teacherId) {
      return res.status(403).json({ error: 'Not authorized to approve/reject students for this course' });
    }

    // Find and update the student's status
    const studentIndex = course.students.findIndex(
      student => student.email.toLowerCase() === studentEmail.toLowerCase()
    );

    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found in course' });
    }

    course.students[studentIndex].status = status;
    await course.save();

    res.status(200).json({ 
      message: `Student ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      student: course.students[studentIndex]
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ error: 'Error updating student status' });
  }
});

export default router;