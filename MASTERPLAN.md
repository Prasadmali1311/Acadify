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
- Upload any file type (max 500MB via Firebase Storage).
- ZIP/folder upload for coding projects.
- No resubmissions: Lock after grading.

#### Reporting:
- **Visual dashboards:** Progress trends, grade distribution.
- **Export:** PDF (for sharing) + CSV (for data analysis).
- **Attendance Tracking:** Based on submission deadlines.

#### Authentication:
- Phone + email sign-up (Firebase Auth).
- Phone number as a unique identifier.

## Technical Stack Recommendations

| Component   | Tool(s) |
|------------|--------|
| **Frontend** | React.js (free, component-based) + Firebase UI for auth. |
| **Backend** | Firebase Services (Auth, Firestore, Storage). |
| **Reporting** | Chart.js (visualizations) + jsPDF (PDF exports). |
| **Hosting** | Firebase Hosting (free tier). |

## Conceptual Data Model

### Users Collection:
- `userID` (string)  
- `role`: "student" | "instructor" | "admin"  
- `phone` (unique)  
- `email`  

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

### Firestore Rules:
- Students can only read/write to their own submissions.
- Instructors can only access their course’s data.

### Phone Verification:
- Cloud Function to block duplicate phone numbers during sign-up.

### Storage Rules:
- Restrict file access to authenticated users.

## Revised Development Phases

### **Phase 1: Frontend and UI/UX Design**
- Design wireframes and prototypes for all user roles (student, instructor, admin).
- Build the frontend using React.js with a focus on:
  - Clean, intuitive navigation.
  - Responsive design (works on mobile + desktop).
  - Placeholder components for backend integration.

### **Phase 2: Backend and Authentication + User Roles**
- Set up Firebase Firestore and Firebase Storage.
- Implement Firebase Authentication with:
  - Phone + email sign-up.
  - Unique phone enforcement via Cloud Functions.
- Define user roles (student, instructor, admin) and restrict access accordingly.

### **Phase 3: Advanced Features**

#### **Advanced Reporting:**
- Visual dashboards (Chart.js).
- Export to PDF (jsPDF) + CSV (SheetJS).

#### **Bulk Upload/Download:**
- Instructors can download all submissions as a ZIP file.
- Students can upload multiple files or ZIP folders.

#### **Notifications:**
- Email/SMS reminders for deadlines (Firebase Cloud Messaging + Twilio for SMS).

## Challenges & Mitigations

| Challenge | Solution |
|-----------|----------|
| Unique Phone Enforcement | Cloud Function to validate uniqueness. |
| Large File Storage Costs | Client-side ZIP compression before upload. |
| Complex Firestore Queries | Precompute metrics (e.g., store average grades). |

## Future Expansion

- **Plagiarism Checker:** Integrate free tools like Moss (Stanford).
- **Mobile App:** Wrap web app with React Native.
- **API Integration:** Sync with LMS platforms (Moodle, Canvas).