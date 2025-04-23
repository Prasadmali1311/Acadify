// Database configuration
const config = {
  baseUrl: 'http://localhost:5000/api',
  endpoints: {
    // File upload endpoints
    upload: '/upload/upload',
    files: '/upload/files',
    file: '/upload/file',
    
    // User endpoints
    users: '/users',
    user: '/users',
    profile: '/users/profile',
    
    // Course endpoints
    courses: '/courses',
    course: '/courses',
    instructorCourses: '/courses/instructor',
    enrolledCourses: '/courses/enrolled',
    
    // Assignment endpoints
    assignments: '/assignments',
    assignment: '/assignments',
    studentAssignments: '/assignments/student',
    instructorAssignments: '/assignments/instructor',
    
    // Submission endpoints
    submissions: '/submissions',
    submission: '/submissions',
    studentSubmissions: '/submissions/student',
    instructorSubmissions: '/submissions/instructor',
    
    // Student endpoints
    students: '/students',
    student: '/students',
    teacherStudents: '/students/teacher',
    teacherAssignments: '/assignments/instructor',
    createAssignment: '/assignments',
    updateAssignment: '/assignments'
  }
};

// Helper function to get the appropriate API URL
export const getApiUrl = (endpoint) => {
  const endpointPath = config.endpoints[endpoint];
  if (!endpointPath) {
    throw new Error(`Endpoint ${endpoint} not found in configuration`);
  }
  return `${config.baseUrl}${endpointPath}`;
};

export default config;