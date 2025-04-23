# Acadify - Educational Management System

## Description
Acadify is a modern educational management system built for students and teachers. It provides role-based dashboards, assignment management, reporting tools, and class management features.

## Features
- 🔐 JWT-based authentication with email/password
- 👨‍🏫 Teacher role with specific dashboards and tools
- 👨‍🎓 Student role with personalized views
- 📝 Assignment creation and submission
- 📊 Performance reports and analytics
- 👥 Class management and enrollment
- 📱 Responsive design for all devices

## Technology Stack
- React 19 with Hooks
- MongoDB for database
- Express.js backend
- JWT Authentication
- Vite for bundling
- React Router v7
- Pure CSS (no frameworks)

## Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/contexts` - React context providers
- `/src/styles` - CSS files and global styles
- `/server` - Express.js backend with MongoDB

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB installed locally

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/acadify.git
   cd acadify
   ```

2. Install dependencies for both frontend and backend
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/acadify
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start MongoDB locally
   ```bash
   mongod
   ```

5. Start the development server (in separate terminals)
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   npm run dev
   ```

### Building for Production
```bash
npm run build
npm run serve
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.
