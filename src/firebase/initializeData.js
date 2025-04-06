import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Initialize database with courses and assignments if they don't exist
export const initializeDatabase = async (teacherId) => {
  try {
    // First, check if courses already exist
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Database already initialized for this teacher');
      return;
    }
    
    console.log('Initializing database with web development courses...');
    
    // Create courses
    const courses = [
      {
        name: 'HTML & CSS Fundamentals',
        description: 'Core concepts of modern web design and styling',
        instructorId: teacherId,
        instructorName: 'Dr. Emma Richards',
        level: 'Beginner',
        duration: '8 weeks',
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        name: 'JavaScript Essentials',
        description: 'Programming fundamentals with JavaScript',
        instructorId: teacherId,
        instructorName: 'Prof. David Chen',
        level: 'Beginner',
        duration: '10 weeks',
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        name: 'React Framework',
        description: 'Building dynamic UIs with React',
        instructorId: teacherId,
        instructorName: 'Dr. Sarah Johnson',
        level: 'Intermediate',
        duration: '12 weeks',
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        name: 'Backend Development with Node.js',
        description: 'Server-side JavaScript and API development',
        instructorId: teacherId,
        instructorName: 'Dr. Michael Thompson',
        level: 'Intermediate',
        duration: '10 weeks',
        createdAt: Timestamp.now(),
        status: 'active'
      }
    ];
    
    // Add courses to Firestore
    const courseIds = [];
    for (const course of courses) {
      const docRef = await addDoc(coursesRef, course);
      courseIds.push({ id: docRef.id, name: course.name, instructorName: course.instructorName });
    }
    
    console.log('Courses created successfully');
    
    // Create assignments
    const assignmentsRef = collection(db, 'assignments');
    const assignments = [
      {
        title: 'Responsive Portfolio Website',
        description: 'Create a responsive portfolio website using HTML5 and CSS3. Implement mobile-first design principles.',
        courseId: courseIds[0].id,
        courseName: courseIds[0].name,
        teacherId: teacherId,
        instructorName: courseIds[0].instructorName,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        title: 'CSS Grid Layout Challenge',
        description: 'Design a complex webpage layout using CSS Grid. Include responsive breakpoints.',
        courseId: courseIds[0].id,
        courseName: courseIds[0].name,
        teacherId: teacherId,
        instructorName: courseIds[0].instructorName,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        title: 'Interactive Quiz App',
        description: 'Build an interactive quiz application with JavaScript. Include timer, scoring, and result feedback.',
        courseId: courseIds[1].id,
        courseName: courseIds[1].name,
        teacherId: teacherId,
        instructorName: courseIds[1].instructorName,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        title: 'State Management Project',
        description: 'Implement different state management patterns in JavaScript. Compare and contrast approaches.',
        courseId: courseIds[1].id,
        courseName: courseIds[1].name,
        teacherId: teacherId,
        instructorName: courseIds[1].instructorName,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        title: 'Component Architecture Design',
        description: 'Create a React application with reusable components. Implement proper state management and props.',
        courseId: courseIds[2].id,
        courseName: courseIds[2].name,
        teacherId: teacherId,
        instructorName: courseIds[2].instructorName,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      },
      {
        title: 'API Integration Project',
        description: 'Develop a RESTful API with Node.js and Express. Implement CRUD operations and authentication.',
        courseId: courseIds[3].id,
        courseName: courseIds[3].name,
        teacherId: teacherId,
        instructorName: courseIds[3].instructorName,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        createdAt: Timestamp.now(),
        status: 'active'
      }
    ];
    
    // Add assignments to Firestore
    for (const assignment of assignments) {
      await addDoc(assignmentsRef, assignment);
    }
    
    console.log('Assignments created successfully');
    console.log('Database initialization complete!');
    
    return {
      courses: courseIds,
      assignmentsCount: assignments.length
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}; 