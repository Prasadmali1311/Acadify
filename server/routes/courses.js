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
    const { email } = req.query;
    console.log('Received request for enrolled courses with email:', email);
    
    if (!email) {
      console.error('No email provided in request');
      return res.status(400).json({ error: 'Student email is required' });
    }

    console.log('Searching for courses with student email:', email);
    const courses = await Course.find({
      'students.email': email
    });
    
    console.log('Found courses:', courses);
    console.log('Number of courses found:', courses.length);
    
    if (courses.length === 0) {
      console.log('No courses found for this email. Checking all courses in database...');
      const allCourses = await Course.find();
      console.log('Total courses in database:', allCourses.length);
      if (allCourses.length > 0) {
        console.log('Sample course structure:', allCourses[0]);
      }
    }
    
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
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Student email and name are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if student is already enrolled using email
    const alreadyEnrolled = course.students.some(student => student.email === email);
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

// Test route to check database state
router.get('/test', async (req, res) => {
  try {
    const allCourses = await Course.find();
    console.log('All courses in database:', allCourses);
    
    const testEmail = 'prasadmali13111@gmail.com';
    const coursesWithEmail = await Course.find({
      'students.email': testEmail
    });
    console.log('Courses with test email:', coursesWithEmail);
    
    res.status(200).json({
      totalCourses: allCourses.length,
      coursesWithTestEmail: coursesWithEmail.length,
      sampleCourse: allCourses[0]
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: 'Error in test route' });
  }
});

export default router; 