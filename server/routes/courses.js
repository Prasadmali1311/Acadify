import express from 'express';
import Course from '../models/Course.js';

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
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const courses = await Course.find({
      'students.studentId': studentId
    });
    
    res.status(200).json(courses);
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
    const { studentId, name, email } = req.body;
    
    if (!studentId || !name || !email) {
      return res.status(400).json({ error: 'Student ID, name, and email are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if student is already enrolled
    const alreadyEnrolled = course.students.some(student => student.studentId === studentId);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }

    course.students.push({ studentId, name, email });
    await course.save();
    
    res.status(200).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Error enrolling student' });
  }
});

export default router; 