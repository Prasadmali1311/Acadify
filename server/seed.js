import { mongoose, connectDB } from './db.js';
import Course from './models/Course.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';

// Sample data
const sampleCourses = [
  {
    name: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science and programming',
    code: 'CS101',
    instructorId: 'instructor1',
    instructorName: 'John Doe',
    students: [
      {
        studentId: 'student1',
        name: 'Alice Smith',
        email: 'alice@example.com'
      },
      {
        studentId: 'student2',
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    ]
  },
  {
    name: 'Web Development',
    description: 'Build modern web applications using HTML, CSS, and JavaScript',
    code: 'WEB200',
    instructorId: 'instructor1',
    instructorName: 'John Doe',
    students: [
      {
        studentId: 'student1',
        name: 'Alice Smith',
        email: 'alice@example.com'
      }
    ]
  },
  {
    name: 'Data Structures and Algorithms',
    description: 'Advanced programming concepts and algorithm analysis',
    code: 'CS201',
    instructorId: 'instructor2',
    instructorName: 'Jane Smith',
    students: [
      {
        studentId: 'student2',
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }

    // Clear existing data
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    console.log('Cleared existing data');

    // Insert courses
    const insertedCourses = await Course.insertMany(sampleCourses);
    console.log(`${insertedCourses.length} courses inserted`);

    // Create assignments for each course
    const assignments = [];
    for (const course of insertedCourses) {
      const assignmentData = {
        title: `Assignment 1: ${course.name}`,
        description: `Complete the first assignment for ${course.name}`,
        courseId: course._id.toString(),
        courseName: course.name,
        instructorId: course.instructorId,
        instructorName: course.instructorName,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      };
      assignments.push(assignmentData);
    }

    const insertedAssignments = await Assignment.insertMany(assignments);
    console.log(`${insertedAssignments.length} assignments inserted`);

    // Create a sample submission for the first assignment
    if (insertedAssignments.length > 0) {
      const submission = {
        assignmentId: insertedAssignments[0]._id.toString(),
        studentId: 'student1',
        courseId: insertedAssignments[0].courseId,
        content: 'This is my submission for the assignment.',
        submissionDate: new Date(),
        grade: 'A',
        feedback: 'Excellent work!',
        gradedDate: new Date()
      };

      await Submission.create(submission);
      console.log('Sample submission created');
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase(); 