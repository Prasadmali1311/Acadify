// Database configuration
const config = {
  // Current database type
  databaseType: 'mongodb', // Change this to 'firebase' to switch back

  // MongoDB configuration
  mongodb: {
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
  },

  // Firebase configuration
  firebase: {
    // Your existing Firebase config
    // ... (keep your existing Firebase config here)
  }
};

// Helper function to get the current database type
export const getDatabaseType = () => config.databaseType;

// Helper function to get the appropriate API URL based on database type
export const getApiUrl = (endpoint) => {
  const baseUrl = config[config.databaseType].baseUrl;
  const endpointPath = config[config.databaseType].endpoints[endpoint];
  if (!endpointPath) {
    throw new Error(`Endpoint ${endpoint} not found in ${config.databaseType} configuration`);
  }
  return `${baseUrl}${endpointPath}`;
};

// Helper function to switch database type
export const switchDatabase = (type) => {
  if (type !== 'mongodb' && type !== 'firebase') {
    throw new Error('Invalid database type. Must be either "mongodb" or "firebase"');
  }
  config.databaseType = type;
};

export default config; 