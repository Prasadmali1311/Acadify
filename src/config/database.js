// Database configuration
const config = {
  // Current database type
  databaseType: 'mongodb', // Change this to 'firebase' to switch back

  // MongoDB configuration
  mongodb: {
    baseUrl: 'http://localhost:5000/api',
    endpoints: {
      upload: '/upload/upload',
      files: '/upload/files',
      file: '/upload/file'
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
  if (config.databaseType === 'mongodb') {
    return `${config.mongodb.baseUrl}${config.mongodb.endpoints[endpoint]}`;
  }
  // For Firebase, return the appropriate Firebase endpoint
  return null; // Firebase endpoints are handled differently
};

// Helper function to switch database type
export const switchDatabase = (type) => {
  if (type === 'mongodb' || type === 'firebase') {
    config.databaseType = type;
    return true;
  }
  return false;
};

export default config; 