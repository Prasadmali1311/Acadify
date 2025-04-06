# Acadify - Educational Management System

## Description
Acadify is a modern educational management system built for students and teachers. It provides role-based dashboards, assignment management, reporting tools, and class management features.

## Features
- 🔐 Authentication with email/password and Google
- 👨‍🏫 Teacher role with specific dashboards and tools
- 👨‍🎓 Student role with personalized views
- 📝 Assignment creation and submission
- 📊 Performance reports and analytics
- 👥 Class management and enrollment
- 📱 Responsive design for all devices

## Technology Stack
- React 19 with Hooks
- Firebase Authentication
- Firestore Database
- Vite for bundling
- React Router v7
- Pure CSS (no frameworks)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/acadify.git
   cd acadify
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
npm run serve
```

## Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/contexts` - React context providers
- `/src/firebase` - Firebase configuration and utility functions
- `/src/styles` - CSS files and global styles

## Usage
1. Create an account with email and password or sign in with Google
2. You will be assigned a default student role
3. Navigate through the sidebar to access different features
4. Teachers can manage classes, students, and assignments
5. Students can view courses, submit assignments, and track progress

## License
This project is licensed under the MIT License - see the LICENSE file for details.
