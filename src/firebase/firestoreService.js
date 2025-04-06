import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// ========== COURSES ==========

// Get all courses
export const getAllCourses = async () => {
  try {
    const coursesRef = collection(db, 'courses');
    const querySnapshot = await getDocs(coursesRef);
    
    const courses = [];
    querySnapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

// Get courses for a specific instructor
export const getInstructorCourses = async (instructorId) => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));
    const querySnapshot = await getDocs(q);
    
    const courses = [];
    querySnapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting instructor courses:', error);
    throw error;
  }
};

// Get courses for a specific student (enrolled)
export const getEnrolledCourses = async (studentId) => {
  try {
    console.log("getEnrolledCourses called with studentId:", studentId);
    
    if (!studentId) {
      console.error("Error: No studentId provided to getEnrolledCourses");
      return [];
    }
    
    console.log("Querying enrollments collection for student:", studentId);
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} enrollments for student`);
    
    const courseIds = [];
    querySnapshot.forEach(doc => {
      const courseId = doc.data().courseId;
      console.log(`Enrollment found: ${doc.id} for course: ${courseId}`);
      courseIds.push(courseId);
    });
    
    // Check if we found any enrollments
    if (courseIds.length === 0) {
      console.log("No course enrollments found for student. Enrolling in default courses...");
      // For testing: Auto-enroll student in a course if none found
      await enrollInDefaultCourses(studentId);
      
      // Retry fetching enrollments
      console.log("Retrying to get enrollments after auto-enrollment");
      const retrySnapshot = await getDocs(q);
      retrySnapshot.forEach(doc => {
        const courseId = doc.data().courseId;
        console.log(`Enrollment found after auto-enrollment: ${doc.id} for course: ${courseId}`);
        courseIds.push(courseId);
      });
    }
    
    // Get course details for each enrollment
    const courses = [];
    console.log("Fetching course details for each enrollment");
    for (const courseId of courseIds) {
      console.log(`Getting details for course: ${courseId}`);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        courses.push({
          id: courseDoc.id,
          ...courseData
        });
        console.log(`Added course: ${courseDoc.id} - ${courseData.name}`);
      } else {
        console.warn(`Course ${courseId} not found in database`);
      }
    }
    
    console.log(`Returning ${courses.length} enrolled courses`);
    return courses;
  } catch (error) {
    console.error("CRITICAL ERROR in getEnrolledCourses:", error);
    // Instead of throwing, return empty array to avoid breaking the UI
    return [];
  }
};

// Helper function to enroll a student in default courses (for testing)
const enrollInDefaultCourses = async (studentId) => {
  try {
    console.log("Enrolling student in default courses for testing");
    
    // Get all available courses
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, limit(2)); // Get first 2 courses
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No courses available to enroll in");
      return;
    }
    
    // Enroll in the courses
    const enrollmentsRef = collection(db, 'enrollments');
    let enrollmentCount = 0;
    
    for (const courseDoc of querySnapshot.docs) {
      console.log(`Enrolling student in course: ${courseDoc.id} - ${courseDoc.data().name}`);
      
      await addDoc(enrollmentsRef, {
        studentId: studentId,
        courseId: courseDoc.id,
        enrolledAt: serverTimestamp(),
        progress: 0,
        status: 'active'
      });
      enrollmentCount++;
    }
    
    console.log(`Auto-enrolled student in ${enrollmentCount} courses`);
    return true;
  } catch (error) {
    console.error("Error in auto-enrollment:", error);
    return false;
  }
};

// Get available courses (not enrolled)
export const getAvailableCourses = async (studentId) => {
  try {
    // Get all courses
    const allCourses = await getAllCourses();
    
    // Get enrolled course IDs
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    
    const enrolledCourseIds = [];
    querySnapshot.forEach(doc => {
      enrolledCourseIds.push(doc.data().courseId);
    });
    
    // Filter out enrolled courses
    const availableCourses = allCourses.filter(course => 
      !enrolledCourseIds.includes(course.id)
    );
    
    return availableCourses;
  } catch (error) {
    console.error('Error getting available courses:', error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (courseData) => {
  try {
    const coursesRef = collection(db, 'courses');
    const docRef = await addDoc(coursesRef, {
      ...courseData,
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...courseData
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (courseId, courseData) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: courseId,
      ...courseData
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Enroll a student in a course
export const enrollStudentInCourse = async (studentId, courseId) => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    await addDoc(enrollmentsRef, {
      studentId,
      courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
      status: 'active'
    });
    
    return true;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

// ========== ASSIGNMENTS ==========

// Get all assignments for a course
export const getCourseAssignments = async (courseId) => {
  try {
    const assignmentsRef = collection(db, 'assignments');
    const q = query(
      assignmentsRef,
      where('courseId', '==', courseId),
      orderBy('deadline', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const assignments = [];
    querySnapshot.forEach(doc => {
      assignments.push({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate() // Convert Firestore timestamp to JS Date
      });
    });
    
    return assignments;
  } catch (error) {
    console.error('Error getting course assignments:', error);
    throw error;
  }
};

// Get all assignments for a teacher
export const getTeacherAssignments = async (teacherId) => {
  try {
    console.log("getTeacherAssignments called with teacherId:", teacherId);
    
    if (!teacherId) {
      console.error("Error: No teacherId provided to getTeacherAssignments");
      return [];
    }
    
    const assignmentsRef = collection(db, 'assignments');
    console.log("Query params:", { teacherId });
    
    const q = query(
      assignmentsRef,
      where('teacherId', '==', teacherId)
      // Temporary remove the orderBy to check if it's causing issues
      // orderBy('createdAt', 'desc')
    );
    
    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    console.log("Query complete. Total results:", querySnapshot.size);
    
    const assignments = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log("Processing assignment doc:", doc.id, data);
      
      // Safely handle dates
      let deadlineDate = null;
      try {
        deadlineDate = data.deadline?.toDate ? data.deadline.toDate() : 
                      (data.deadline ? new Date(data.deadline) : null);
      } catch (e) {
        console.error("Error converting deadline to date:", e);
      }
      
      assignments.push({
        id: doc.id,
        ...data,
        deadline: deadlineDate
      });
    });
    
    console.log("Returning assignments count:", assignments.length);
    return assignments;
  } catch (error) {
    console.error("CRITICAL ERROR in getTeacherAssignments:", error);
    // Instead of throwing, return empty array to avoid breaking the UI
    return [];
  }
};

// Get all assignments for a student
export const getStudentAssignments = async (studentId) => {
  try {
    if (!studentId) {
      console.error("Error: No studentId provided to getStudentAssignments");
      return [];
    }
    
    // Get enrolled courses
    const enrolledCourses = await getEnrolledCourses(studentId);
    
    if (enrolledCourses.length === 0) {
      return [];
    }
    
    // Get assignments for each course
    const assignments = [];
    
    for (const course of enrolledCourses) {
      if (!course || !course.id) {
        continue;
      }
      
      try {
        // Direct query to assignments collection
        const assignmentsRef = collection(db, 'assignments');
        const q = query(
          assignmentsRef,
          where('courseId', '==', course.id)
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          assignments.push({
            id: doc.id,
            ...data,
            courseName: course.name || data.courseName || 'Unknown Course', 
            courseId: course.id,
            instructorName: course.instructorName || data.instructorName || 'Instructor',
            deadline: data.deadline instanceof Date ? data.deadline : 
                     (data.deadline && data.deadline.toDate ? data.deadline.toDate() : 
                     (data.deadline ? new Date(data.deadline) : new Date()))
          });
        });
      } catch (err) {
        console.error(`Error fetching assignments for course ${course.id}:`, err);
      }
    }
    
    // Get submission status for each assignment
    for (let i = 0; i < assignments.length; i++) {
      try {
        const submissionsRef = collection(db, 'submissions');
        const q = query(
          submissionsRef,
          where('assignmentId', '==', assignments[i].id),
          where('studentId', '==', studentId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const submission = querySnapshot.docs[0].data();
          assignments[i].submissionId = querySnapshot.docs[0].id;
          assignments[i].submissionDate = submission.submittedAt?.toDate ? 
                                         submission.submittedAt.toDate() :
                                         (submission.submittedAt || null);
          assignments[i].grade = submission.grade || null;
          assignments[i].feedback = submission.feedback || '';
          assignments[i].status = submission.grade ? 'graded' : 'submitted';
        } else {
          assignments[i].status = 'pending';
        }
      } catch (err) {
        console.error(`Error processing submission for assignment ${assignments[i].id}:`, err);
        assignments[i].status = 'pending'; // Default to pending on error
      }
    }
    
    // Sort by deadline, most urgent first
    assignments.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    
    return assignments;
  } catch (error) {
    console.error("Error in getStudentAssignments:", error);
    return []; // Return empty array to avoid breaking the UI
  }
};

// Create a new assignment
export const createAssignment = async (assignmentData) => {
  try {
    console.log("createAssignment called with data:", assignmentData);
    
    if (!assignmentData || !assignmentData.courseId || !assignmentData.teacherId) {
      console.error("Error: Missing required fields for assignment", assignmentData);
      throw new Error("Missing required assignment fields");
    }
    
    const assignmentsRef = collection(db, 'assignments');
    
    // Sanitize data to ensure it can be properly stored in Firestore
    const cleanedData = {
      ...assignmentData,
      createdAt: serverTimestamp(),
      status: assignmentData.status || 'active'
    };
    
    console.log("Saving assignment with cleaned data:", cleanedData);
    const docRef = await addDoc(assignmentsRef, cleanedData);
    console.log("Assignment saved successfully with ID:", docRef.id);
    
    // Fetch the newly created document to ensure we have the server timestamps
    const savedDoc = await getDoc(docRef);
    if (!savedDoc.exists()) {
      throw new Error("Failed to retrieve saved assignment");
    }
    
    const savedData = savedDoc.data();
    console.log("Retrieved saved assignment:", savedData);
    
    // Return the complete data with ID
    return {
      id: docRef.id,
      ...savedData,
      // Convert any timestamps for client use
      createdAt: savedData.createdAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error in createAssignment:', error);
    throw error;
  }
};

// Update an assignment
export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      ...assignmentData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: assignmentId,
      ...assignmentData
    };
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

// Delete an assignment
export const deleteAssignment = async (assignmentId) => {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// ========== SUBMISSIONS ==========

// Submit an assignment
export const submitAssignment = async (submissionData) => {
  try {
    const submissionsRef = collection(db, 'submissions');
    const docRef = await addDoc(submissionsRef, {
      ...submissionData,
      submittedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...submissionData
    };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Grade a submission
export const gradeSubmission = async (submissionId, grade, feedback) => {
  try {
    const submissionRef = doc(db, 'submissions', submissionId);
    await updateDoc(submissionRef, {
      grade,
      feedback,
      gradedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Get all submissions for an assignment
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const submissionsRef = collection(db, 'submissions');
    const q = query(submissionsRef, where('assignmentId', '==', assignmentId));
    
    const querySnapshot = await getDocs(q);
    
    const submissions = [];
    querySnapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        gradedAt: doc.data().gradedAt?.toDate()
      });
    });
    
    // Add student information to each submission
    for (let i = 0; i < submissions.length; i++) {
      const studentDoc = await getDoc(doc(db, 'users', submissions[i].studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        submissions[i].studentName = `${studentData.firstName} ${studentData.lastName}`;
      }
    }
    
    return submissions;
  } catch (error) {
    console.error('Error getting assignment submissions:', error);
    throw error;
  }
};

// ========== USERS ==========

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: userId,
      ...profileData
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get teacher's students
export const getTeacherStudents = async (teacherId) => {
  try {
    // Get instructor courses
    const instructorCourses = await getInstructorCourses(teacherId);
    const courseIds = instructorCourses.map(course => course.id);
    
    // Get enrollments for these courses
    const enrollmentsRef = collection(db, 'enrollments');
    const uniqueStudentIds = new Set();
    
    for (const courseId of courseIds) {
      const q = query(enrollmentsRef, where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(doc => {
        uniqueStudentIds.add(doc.data().studentId);
      });
    }
    
    // Get student profiles
    const students = [];
    for (const studentId of uniqueStudentIds) {
      const studentProfile = await getUserProfile(studentId);
      if (studentProfile) {
        students.push(studentProfile);
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error getting teacher students:', error);
    throw error;
  }
};

// Get all students
export const getAllStudents = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    
    const querySnapshot = await getDocs(q);
    
    const students = [];
    querySnapshot.forEach(doc => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Error getting all students:', error);
    throw error;
  }
};

// Get student performance for a course
export const getStudentCoursePerformance = async (studentId, courseId) => {
  try {
    // Get all assignments for this course
    const courseAssignments = await getCourseAssignments(courseId);
    
    let totalGrade = 0;
    let completedAssignments = 0;
    
    // Get submissions for each assignment
    for (const assignment of courseAssignments) {
      const submissionsRef = collection(db, 'submissions');
      const q = query(
        submissionsRef, 
        where('assignmentId', '==', assignment.id),
        where('studentId', '==', studentId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const submission = querySnapshot.docs[0].data();
        if (submission.grade) {
          totalGrade += submission.grade;
          completedAssignments++;
        }
      }
    }
    
    const totalAssignments = courseAssignments.length;
    const averageGrade = completedAssignments > 0 ? totalGrade / completedAssignments : 0;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    
    return {
      totalAssignments,
      completedAssignments,
      averageGrade,
      completionRate
    };
  } catch (error) {
    console.error('Error getting student performance:', error);
    throw error;
  }
};

// Remove these debug/test functions
export const createSampleAssignmentsForStudent = async () => {
  console.warn("Test functions have been disabled in production");
  return false;
};

export const createDirectTestAssignment = async () => {
  console.warn("Test functions have been disabled in production");
  return false;
}; 