import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';
import { getDatabaseType } from '../config/database';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  async function signup(email, password, role = 'student', userInfo = {}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in MongoDB
    try {
      await axios.post(`${getDatabaseType() === 'mongodb' ? 'http://localhost:5000/api' : ''}/users`, {
        firebaseUid: user.uid,
        email: user.email,
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        mobileNumber: userInfo.mobileNumber || '',
        role: role
      });
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      // If MongoDB creation fails, delete the Firebase user
      await user.delete();
      throw error;
    }

    return userCredential;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in MongoDB
    try {
      const response = await axios.get(`${getDatabaseType() === 'mongodb' ? 'http://localhost:5000/api' : ''}/users/${user.uid}`);
      
      if (!response.data) {
        // Extract first and last name from Google display name
        const displayNameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
        const firstName = displayNameParts[0] || '';
        const lastName = displayNameParts.slice(1).join(' ') || '';
        
        // Create user in MongoDB if it doesn't exist
        await axios.post(`${getDatabaseType() === 'mongodb' ? 'http://localhost:5000/api' : ''}/users`, {
          firebaseUid: user.uid,
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'student'
        });
      }
    } catch (error) {
      console.error('Error checking/creating user in MongoDB:', error);
      throw error;
    }
    
    return user;
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserRole(uid) {
    try {
      const response = await axios.get(`${getDatabaseType() === 'mongodb' ? 'http://localhost:5000/api' : ''}/users/${uid}`);
      if (response.data) {
        return response.data.role;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }

  async function getUserProfile(uid) {
    try {
      const response = await axios.get(`${getDatabaseType() === 'mongodb' ? 'http://localhost:5000/api' : ''}/users/${uid}`);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        const profile = await getUserProfile(user.uid);
        
        // Create a user object with all available data
        const userWithProfile = {
          ...user,
          role,
          profile: profile || {
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            email: user.email || ''
          }
        };
        
        setUserRole(role);
        setCurrentUser(userWithProfile);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout,
    getUserRole,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 