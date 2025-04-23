# Acadify Master Plan

## App Overview
A free, centralized e-learning platform for assignment submission and progress tracking.

### Core Objectives:
- Simplify assignment submission for students.
- Empower instructors to grade and monitor student progress.
- Provide actionable reports for academic improvement.

## Target Audience
**Primary:** Educational institutions (schools, coding bootcamps) needing a low-cost submission system.  
**Secondary:** Freelance instructors managing small student groups.

## Core Features

### User Roles
| Role       | Capabilities |
|------------|-------------|
| **Student** | Submit assignments (files/ZIPs), view grades/feedback, access reports. |
| **Instructor** | Create assignments, grade submissions, generate reports, track progress. |
| **Admin** | Manage user accounts, audit logs, system settings. |

### Key Functionality

#### Assignment Workflow:
- Upload any file type (max 500MB via GridFS).
- ZIP/folder upload for coding projects.
- No resubmissions: Lock after grading.

#### Reporting:
- **Visual dashboards:** Progress trends, grade distribution.
- **Export:** PDF (for sharing) + CSV (for data analysis).
- **Attendance Tracking:** Based on submission deadlines.

#### Authentication:
- JWT-based authentication with email/password.
- Phone number as optional contact method.

## Technical Stack Recommendations

| Component   | Tool(s) |
|------------|--------|
| **Frontend** | React.js with Context API for state management |
| **Backend** | Express.js + MongoDB (GridFS for file storage) |
| **Reporting** | Chart.js (visualizations) + jsPDF (PDF exports) |
| **Hosting** | Any VPS or cloud service with MongoDB support |

## Conceptual Data Model

### Users Collection:
- `userID` (string)  
- `role`: "student" | "instructor" | "admin"  
- `email`  
- `phone` (optional)  

### Assignments Collection:
- `assignmentID` (string)  
- `courseID` (string)  
- `deadline` (timestamp)  
- `maxFileSize` (number)  

### Submissions Collection:
- `submissionID` (string)  
- `userID` (string)  
- `fileURL` (string)  
- `timestamp`  

### Grades Collection:
- `gradeID` (string)  
- `submissionID` (string)  
- `score` (number)  
- `feedback` (string)  

## UI/UX Principles

### Student Dashboard:
- Clear submission status (pending/graded).
- Drag-and-drop file uploader.

### Instructor View:
- Bulk download submissions (ZIP files).
- Grading panel with rubric templates.

### Reports:
- Interactive charts (toggle date ranges/metrics).

## Security Considerations

### Access Control:
- Role-based access control (RBAC) for all routes.
- JWT verification middleware.
- Rate limiting for API endpoints.

### File Storage:
- GridFS for secure file storage.
- File type validation.
- Size limits and quota management.

### Data Protection:
- Password hashing with bcrypt.
- Input validation and sanitization.
- XSS and CSRF protection.

## Revised Development Phases

### **Phase 1: Frontend and UI/UX Design**
- Design wireframes and prototypes for all user roles.
- Build the frontend using React.js with a focus on:
  - Clean, intuitive navigation.
  - Responsive design (works on mobile + desktop).
  - Component reusability.

### **Phase 2: Backend and Authentication**
- Set up Express.js server with MongoDB.
- Implement JWT-based authentication.
- Set up GridFS for file storage.
- Define user roles and access control.

### **Phase 3: Advanced Features**

#### **Advanced Reporting:**
- Visual dashboards (Chart.js).
- Export to PDF (jsPDF) + CSV (SheetJS).

#### **Bulk Upload/Download:**
- Instructors can download all submissions as a ZIP file.
- Students can upload multiple files or ZIP folders.

#### **Notifications:**
- Email notifications for deadlines and updates.
- Optional SMS integration with third-party services.

## Challenges & Mitigations

| Challenge | Solution |
|-----------|----------|
| Large File Storage Costs | Client-side ZIP compression before upload. |
| Complex MongoDB Queries | Precompute metrics (e.g., store average grades). |

## Future Expansion

- **Plagiarism Checker:** Integrate free tools like Moss (Stanford).
- **Mobile App:** Wrap web app with React Native.
- **API Integration:** Sync with LMS platforms (Moodle, Canvas).